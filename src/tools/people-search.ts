import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { PeopleSearchRequest } from "../types/apollo.js";

export const peopleSearchSchema = z.object({
  q_keywords: z.string().optional().describe("Keywords to search for in people profiles"),
  name: z.string().optional().describe("Person's full name"),
  email: z.string().optional().describe("Person's email address"),
  title: z.string().optional().describe("Job title"),
  company: z.string().optional().describe("Company name"),
  location: z.string().optional().describe("Location (city, state, or country)"),
  industry: z.string().optional().describe("Industry"),
  person_titles: z.array(z.string()).optional().describe("List of job titles"),
  organization_domains: z.array(z.string()).optional().describe("List of company domains"),
  person_locations: z.array(z.string()).optional().describe("List of locations"),
  organization_locations: z.array(z.string()).optional().describe("List of company locations"),
  q_organization_domains: z.array(z.string()).optional().describe("Query by organization domains"),
  organization_ids: z.array(z.string()).optional().describe("List of organization IDs"),
  person_seniorities: z
    .array(z.string())
    .optional()
    .describe("Seniority levels (e.g., 'senior', 'manager', 'director')"),
  person_functions: z
    .array(z.string())
    .optional()
    .describe("Job functions (e.g., 'sales', 'engineering', 'marketing')"),
  organization_num_employees_ranges: z
    .array(z.string())
    .optional()
    .describe("List of employee count ranges (e.g., '1,10', '11,20', '21,50')"),
  page: z.number().min(1).max(500).default(1).optional().describe("Page number (max 500)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .optional()
    .describe("Results per page (max 100)"),
  contact_email_status: z
    .array(z.string())
    .optional()
    .describe("Filter by email verification status (e.g., 'verified', 'unverified', 'likely to engage', 'unavailable')"),
  include_similar_titles: z
    .boolean()
    .optional()
    .describe("Include similar job titles in search results"),
  q_organization_domains_list: z
    .array(z.string())
    .optional()
    .describe("List of organization domains for searching"),
  // New API parameters
  revenue_range_min: z
    .number()
    .optional()
    .describe("Minimum revenue the person's current employer generates"),
  revenue_range_max: z
    .number()
    .optional()
    .describe("Maximum revenue the person's current employer generates"),
  currently_using_any_of_technology_uids: z
    .array(z.string())
    .optional()
    .describe("Find people based on any of the technologies their current employer uses (e.g., 'salesforce', 'google_analytics')"),
  currently_using_all_of_technology_uids: z
    .array(z.string())
    .optional()
    .describe("Find people based on all of the technologies their current employer uses"),
  currently_not_using_any_of_technology_uids: z
    .array(z.string())
    .optional()
    .describe("Exclude people based on technologies their current employer uses"),
  q_organization_job_titles: z
    .array(z.string())
    .optional()
    .describe("Job titles listed in active job postings at the person's current employer"),
  organization_job_locations: z
    .array(z.string())
    .optional()
    .describe("Locations of jobs being actively recruited by the person's employer"),
  organization_num_jobs_range_min: z
    .number()
    .optional()
    .describe("Minimum number of job postings active at the person's current employer"),
  organization_num_jobs_range_max: z
    .number()
    .optional()
    .describe("Maximum number of job postings active at the person's current employer"),
  organization_job_posted_at_range_min: z
    .string()
    .optional()
    .describe("Earliest date when jobs were posted by the person's employer (YYYY-MM-DD)"),
  organization_job_posted_at_range_max: z
    .string()
    .optional()
    .describe("Latest date when jobs were posted by the person's employer (YYYY-MM-DD)"),
  job_seniority: z
    .array(z.string())
    .optional()
    .describe("Job seniority levels (e.g., 'owner', 'founder', 'c_suite', 'vp', 'director', 'manager', 'senior', 'entry', 'intern')"),
});

export type PeopleSearchParams = z.infer<typeof peopleSearchSchema>;

export async function peopleSearchTool(
  params: PeopleSearchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing people search", params);

    // Transform flat parameters to nested API format
    const {
      revenue_range_min,
      revenue_range_max,
      organization_num_jobs_range_min,
      organization_num_jobs_range_max,
      organization_job_posted_at_range_min,
      organization_job_posted_at_range_max,
      ...restParams
    } = params;

    const searchParams: PeopleSearchRequest = {
      ...restParams,
      page: params.page || 1,
      per_page: params.per_page || 25,
    };

    // Add nested range parameters if provided
    if (revenue_range_min !== undefined || revenue_range_max !== undefined) {
      searchParams.revenue_range = {
        min: revenue_range_min,
        max: revenue_range_max,
      };
    }

    if (organization_num_jobs_range_min !== undefined || organization_num_jobs_range_max !== undefined) {
      searchParams.organization_num_jobs_range = {
        min: organization_num_jobs_range_min,
        max: organization_num_jobs_range_max,
      };
    }

    if (organization_job_posted_at_range_min !== undefined || organization_job_posted_at_range_max !== undefined) {
      searchParams.organization_job_posted_at_range = {
        min: organization_job_posted_at_range_min,
        max: organization_job_posted_at_range_max,
      };
    }

    const response = await apolloClient.searchPeople(searchParams);

    // Handle both new and legacy response formats
    const totalEntries = response.total_entries ?? response.pagination?.total_entries ?? 0;
    const currentPage = response.pagination?.page ?? params.page ?? 1;
    const perPage = response.pagination?.per_page ?? params.per_page ?? 25;
    const totalPages = response.pagination?.total_pages ?? Math.ceil(totalEntries / perPage);

    logger.info(`Found ${totalEntries} people`);

    return {
      results: response.people.map((person) => ({
        id: person.id,
        first_name: person.first_name,
        last_name: person.last_name,
        last_name_obfuscated: person.last_name_obfuscated,
        name: person.name ?? `${person.first_name} ${person.last_name_obfuscated ?? person.last_name ?? ""}`.trim(),
        title: person.title,
        email: person.email,
        company: person.organization?.name,
        company_domain: person.organization?.domain,
        location: [person.city, person.state, person.country].filter(Boolean).join(", "),
        linkedin_url: person.linkedin_url,
        seniority: person.seniority,
        functions: person.functions,
        // New API response fields
        last_refreshed_at: person.last_refreshed_at,
        has_email: person.has_email,
        has_city: person.has_city,
        has_state: person.has_state,
        has_country: person.has_country,
        has_direct_phone: person.has_direct_phone,
        organization_info: person.organization ? {
          name: person.organization.name,
          has_industry: person.organization.has_industry,
          has_phone: person.organization.has_phone,
          has_city: person.organization.has_city,
          has_state: person.organization.has_state,
          has_country: person.organization.has_country,
          has_zip_code: person.organization.has_zip_code,
          has_revenue: person.organization.has_revenue,
          has_employee_count: person.organization.has_employee_count,
        } : undefined,
      })),
      pagination: {
        current_page: currentPage,
        total_pages: totalPages,
        total_results: totalEntries,
        results_per_page: perPage,
      },
    };
  } catch (error) {
    logger.error("People search failed", error);
    throw error;
  }
}

export const peopleSearchDefinition = {
  name: "people_search",
  description: "Search for people in Apollo.io database with various filters. This endpoint does not consume API credits. Note: Returns obfuscated last names and boolean flags for data availability. Use people_match or people_enrichment to get full contact details.",
  inputSchema: zodToJsonSchema(peopleSearchSchema),
};
