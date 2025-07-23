import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { PeopleMatchRequest } from "../types/apollo.js";

export const peopleMatchSchema = z
  .object({
    email: z.string().email().optional().describe("Email address to match"),
    first_name: z.string().optional().describe("Person's first name"),
    last_name: z.string().optional().describe("Person's last name"),
    name: z.string().optional().describe("Person's full name"),
    organization_name: z.string().optional().describe("Company name"),
    domain: z.string().optional().describe("Company domain"),
    linkedin_url: z.string().url().optional().describe("LinkedIn profile URL"),
    reveal_personal_emails: z
      .boolean()
      .default(true)
      .describe("Enable retrieval of personal email addresses"),
    reveal_phone_number: z.boolean().default(false).describe("Enable retrieval of phone numbers"),
  })
  .refine(
    (data) => data.email || data.linkedin_url || data.name || (data.first_name && data.last_name),
    {
      message:
        "Must provide at least one identifier: email, linkedin_url, name, or first_name + last_name",
    }
  );

export type PeopleMatchParams = z.infer<typeof peopleMatchSchema>;

export async function peopleMatchTool(
  params: PeopleMatchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing people match", params);

    const matchParams: PeopleMatchRequest = params;
    const response = await apolloClient.matchPerson(matchParams);

    if (!response || !response.person) {
      return {
        found: false,
        message: "No person found matching the provided information",
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
        email_status: person.email_status,
        personal_emails: person.personal_emails || [],
        phone_numbers: person.phone_numbers || [],
        linkedin_url: person.linkedin_url,
        photo_url: person.photo_url,
        location: [person.city, person.state, person.country].filter(Boolean).join(", "),
        company: person.organization
          ? {
              id: person.organization.id,
              name: person.organization.name,
              domain: person.organization.domain,
              industry: person.organization.industry,
              employee_count: person.organization.employee_count,
            }
          : null,
        seniority: person.seniority,
        functions: person.functions || [],
        employment_history: person.employment_history || [],
      },
      credits_used: response.credits_used || 0,
    };
  } catch (error) {
    logger.error("People match failed", error);
    throw error;
  }
}

export const peopleMatchDefinition = {
  name: "people_match",
  description:
    "Match and retrieve detailed person information including email addresses. Use after people_search to get contact details. Consumes API credits.",
  inputSchema: zodToJsonSchema(peopleMatchSchema),
};
