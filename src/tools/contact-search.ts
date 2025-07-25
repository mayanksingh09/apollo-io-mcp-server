import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { ContactSearchRequest } from "../types/apollo.js";

export const contactSearchSchema = z.object({
  q_keywords: z.string().optional().describe("Keywords to search for in contact profiles"),
  name: z.string().optional().describe("Contact's full name"),
  email: z.string().optional().describe("Contact's email address"),
  title: z.string().optional().describe("Job title"),
  company: z.string().optional().describe("Company name"),
  location: z.string().optional().describe("Location (city, state, or country)"),
  industry: z.string().optional().describe("Industry"),
  person_titles: z.array(z.string()).optional().describe("List of job titles"),
  organization_domains: z.array(z.string()).optional().describe("List of company domains"),
  person_locations: z.array(z.string()).optional().describe("List of locations"),
  organization_locations: z.array(z.string()).optional().describe("List of company locations"),
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
  contact_type: z
    .enum(["person", "company"])
    .optional()
    .describe("Filter by contact type (person or company)"),
  contact_email_status: z.string().optional().describe("Filter by email verification status"),
  label_names: z.array(z.string()).optional().describe("Filter by label names"),
  page: z.number().min(1).max(500).default(1).optional().describe("Page number (max 500)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .optional()
    .describe("Results per page (max 100)"),
});

export type ContactSearchParams = z.infer<typeof contactSearchSchema>;

export async function contactSearchTool(
  params: ContactSearchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing contact search", params);

    const searchParams: ContactSearchRequest = {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 25,
    };

    const response = await apolloClient.searchContacts(searchParams);

    logger.info(`Found ${response.pagination.total_entries} contacts`);

    return {
      results: response.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        first_name: contact.first_name,
        last_name: contact.last_name,
        title: contact.title,
        email: contact.email,
        email_status: contact.email_status,
        company: contact.organization?.name,
        company_domain: contact.organization?.domain,
        location: [contact.city, contact.state, contact.country].filter(Boolean).join(", "),
        linkedin_url: contact.linkedin_url,
        direct_phone: contact.direct_phone,
        mobile_phone: contact.mobile_phone,
        seniority: contact.seniority,
        functions: contact.functions,
        labels: contact.label_names,
        visibility: contact.visibility,
        created_at: contact.created_at,
        updated_at: contact.updated_at,
      })),
      pagination: {
        current_page: response.pagination.page,
        total_pages: response.pagination.total_pages,
        total_results: response.pagination.total_entries,
        results_per_page: response.pagination.per_page,
      },
      note: "This searches only contacts already added to your team's Apollo account. To search the broader Apollo database, use people_search instead.",
    };
  } catch (error) {
    logger.error("Contact search failed", error);
    throw error;
  }
}

export const contactSearchDefinition = {
  name: "contact_search",
  description:
    "Search for contacts in your team's Apollo.io account. Note: This only searches contacts you've already added, not the entire Apollo database. Limited to 50,000 results (500 pages). Not available on free plans.",
  inputSchema: zodToJsonSchema(contactSearchSchema),
};