import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { OrganizationSearchRequest } from "../types/apollo.js";

export const organizationSearchSchema = z.object({
  q_keywords: z.string().optional().describe("Keywords to search for in company profiles"),
  name: z.string().optional().describe("Company name"),
  domains: z.array(z.string()).optional().describe("List of company domains"),
  locations: z.array(z.string()).optional().describe("List of locations"),
  industries: z.array(z.string()).optional().describe("List of industries"),
  employee_count_min: z.number().optional().describe("Minimum number of employees"),
  employee_count_max: z.number().optional().describe("Maximum number of employees"),
  revenue_min: z.number().optional().describe("Minimum revenue in USD"),
  revenue_max: z.number().optional().describe("Maximum revenue in USD"),
  technologies: z.array(z.string()).optional().describe("Technologies used by the company"),
  funding_raised_min: z.number().optional().describe("Minimum funding raised in USD"),
  funding_raised_max: z.number().optional().describe("Maximum funding raised in USD"),
  page: z.number().min(1).max(500).default(1).optional().describe("Page number (max 500)"),
  per_page: z.number().min(1).max(100).default(25).optional().describe("Results per page (max 100)"),
});

export type OrganizationSearchParams = z.infer<typeof organizationSearchSchema>;

export async function organizationSearchTool(
  params: OrganizationSearchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing organization search", params);
    
    const searchParams: OrganizationSearchRequest = {
      q_keywords: params.q_keywords,
      name: params.name,
      domains: params.domains,
      locations: params.locations,
      industries: params.industries,
      technologies: params.technologies,
      page: params.page || 1,
      per_page: params.per_page || 25,
    };

    // Add employee count range if provided
    if (params.employee_count_min || params.employee_count_max) {
      searchParams.employee_count_range = {
        min: params.employee_count_min,
        max: params.employee_count_max,
      };
    }

    // Add revenue range if provided
    if (params.revenue_min || params.revenue_max) {
      searchParams.revenue_range = {
        min: params.revenue_min,
        max: params.revenue_max,
      };
    }

    // Add funding range if provided
    if (params.funding_raised_min || params.funding_raised_max) {
      searchParams.funding_raised_range = {
        min: params.funding_raised_min,
        max: params.funding_raised_max,
      };
    }

    const response = await apolloClient.searchOrganizations(searchParams);
    
    logger.info(`Found ${response.pagination.total_entries} organizations`);
    
    return {
      results: response.organizations.map(org => ({
        id: org.id,
        name: org.name,
        domain: org.domain,
        website_url: org.website_url,
        industry: org.industry,
        industries: org.industries,
        location: [org.city, org.state, org.country].filter(Boolean).join(", "),
        employee_count: org.employee_count,
        employee_count_range: org.employee_count_range,
        revenue: org.revenue,
        revenue_range: org.revenue_range,
        technologies: org.technologies,
        funding_raised: org.funding_raised,
        founded_year: org.founded_year,
        description: org.description,
        linkedin_url: org.linkedin_url,
      })),
      pagination: {
        current_page: response.pagination.page,
        total_pages: response.pagination.total_pages,
        total_results: response.pagination.total_entries,
        results_per_page: response.pagination.per_page,
      },
    };
  } catch (error) {
    logger.error("Organization search failed", error);
    throw error;
  }
}

export const organizationSearchDefinition = {
  name: "organization_search",
  description: "Search for organizations/companies in Apollo.io database with various filters",
  inputSchema: zodToJsonSchema(organizationSearchSchema),
};