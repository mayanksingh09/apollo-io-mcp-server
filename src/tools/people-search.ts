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
  organization_domains: z.array(z.string()).optional().Ndescribe("List of company domains"),
  person_locations: z.array(z.string()).optional().describe("List of locations"),
  organization_locations: z.array(z.string()).optional().describe("List of company locations"),
  q_organization_domains: z.array(z.string()).optional().describe("Query by organization domains"),
  organization_ids: z.array(z.string()).optional().describe("List of organization IDs"),
  person_seniorities: z.array(z.string()).optional().describe("Seniority levels (e.g., 'senior', 'manager', 'director')"),
  person_functions: z.array(z.string()).optional().describe("Job functions (e.g., 'sales', 'engineering', 'marketing')"),
  organization_num_employees_ranges: z.array(z.string()).optional().describe("List of employee count ranges (e.g., '1,10', '11,20', '21,50')"),
  page: z.number().min(1).max(500).default(1).optional().describe("Page number (max 500)"),
  per_page: z.number().min(1).max(100).default(25).optional().describe("Results per page (max 100)"),
});

export type PeopleSearchParams = z.infer<typeof peopleSearchSchema>;

export async function peopleSearchTool(
  params: PeopleSearchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing people search", params);
    
    const searchParams: PeopleSearchRequest = {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 25,
    };

    const response = await apolloClient.searchPeople(searchParams);
    
    logger.info(`Found ${response.pagination.total_entries} people`);
    
    return {
      results: response.people.map(person => ({
        id: person.id,
        name: person.name,
        title: person.title,
        email: person.email,
        company: person.organization?.name,
        company_domain: person.organization?.domain,
        location: [person.city, person.state, person.country].filter(Boolean).join(", "),
        linkedin_url: person.linkedin_url,
        seniority: person.seniority,
        functions: person.functions,
      })),
      pagination: {
        current_page: response.pagination.page,
        total_pages: response.pagination.total_pages,
        total_results: response.pagination.total_entries,
        results_per_page: response.pagination.per_page,
      },
    };
  } catch (error) {
    logger.error("People search failed", error);
    throw error;
  }
}

export const peopleSearchDefinition = {
  name: "people_search",
  description: "Search for people in Apollo.io database with various filters",
  inputSchema: zodToJsonSchema(peopleSearchSchema),
};