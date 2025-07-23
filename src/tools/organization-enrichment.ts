import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { OrganizationEnrichmentRequest } from "../types/apollo.js";

export const organizationEnrichmentSchema = z.object({
  domain: z.string().optional().describe("Company domain (e.g., 'example.com')"),
  name: z.string().optional().describe("Company name"),
}).refine(
  (data) => data.domain || data.name,
  {
    message: "Must provide either domain or company name",
  }
);

export type OrganizationEnrichmentParams = z.infer<typeof organizationEnrichmentSchema>;

export async function organizationEnrichmentTool(
  params: OrganizationEnrichmentParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing organization enrichment", params);
    
    const enrichmentParams: OrganizationEnrichmentRequest = params;
    const response = await apolloClient.enrichOrganization(enrichmentParams);
    
    if (!response.organization) {
      return {
        found: false,
        message: "No organization found with the provided information",
      };
    }

    const org = response.organization;
    
    return {
      found: true,
      organization: {
        id: org.id,
        name: org.name,
        domain: org.domain,
        domains: org.domains,
        website_url: org.website_url,
        logo_url: org.logo_url,
        industry: org.industry,
        industries: org.industries,
        location: {
          city: org.city,
          state: org.state,
          country: org.country,
          full: [org.city, org.state, org.country].filter(Boolean).join(", "),
        },
        employee_count: org.employee_count,
        employee_count_range: org.employee_count_range,
        revenue: org.revenue,
        revenue_range: org.revenue_range,
        phone: org.phone,
        social_media: {
          linkedin_url: org.linkedin_url,
          twitter_url: org.twitter_url,
          facebook_url: org.facebook_url,
        },
        technologies: org.technologies,
        funding_raised: org.funding_raised,
        founded_year: org.founded_year,
        description: org.description,
      },
    };
  } catch (error) {
    logger.error("Organization enrichment failed", error);
    throw error;
  }
}

export const organizationEnrichmentDefinition = {
  name: "organization_enrichment",
  description: "Enrich organization/company data using domain or company name",
  inputSchema: zodToJsonSchema(organizationEnrichmentSchema),
};