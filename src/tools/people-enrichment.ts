import { z } from "zod";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { PeopleEnrichmentRequest } from "../types/apollo.js";

export const peopleEnrichmentSchema = z.object({
  email: z.string().email().optional().describe("Email address to enrich"),
  linkedin_url: z.string().url().optional().describe("LinkedIn profile URL"),
  name: z.string().optional().describe("Person's full name"),
  organization_name: z.string().optional().describe("Company name"),
  domain: z.string().optional().describe("Company domain"),
}).refine(
  (data) => data.email || data.linkedin_url || (data.name && (data.organization_name || data.domain)),
  {
    message: "Must provide either email, linkedin_url, or name with organization information",
  }
);

export type PeopleEnrichmentParams = z.infer<typeof peopleEnrichmentSchema>;

export async function peopleEnrichmentTool(
  params: PeopleEnrichmentParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing people enrichment", params);
    
    const enrichmentParams: PeopleEnrichmentRequest = params;
    const response = await apolloClient.enrichPerson(enrichmentParams);
    
    if (!response.person) {
      return {
        found: false,
        message: "No person found with the provided information",
      };
    }

    const person = response.person;
    
    return {
      found: true,
      person: {
        id: person.id,
        name: person.name,
        first_name: person.first_name,
        last_name: person.last_name,
        title: person.title,
        email: person.email,
        phone_numbers: person.phone_numbers,
        linkedin_url: person.linkedin_url,
        photo_url: person.photo_url,
        location: [person.city, person.state, person.country].filter(Boolean).join(", "),
        company: person.organization ? {
          id: person.organization.id,
          name: person.organization.name,
          domain: person.organization.domain,
          industry: person.organization.industry,
        } : null,
        seniority: person.seniority,
        functions: person.functions,
      },
    };
  } catch (error) {
    logger.error("People enrichment failed", error);
    throw error;
  }
}

export const peopleEnrichmentDefinition = {
  name: "people_enrichment",
  description: "Enrich person data using email, LinkedIn URL, or name with company information",
  inputSchema: peopleEnrichmentSchema,
};