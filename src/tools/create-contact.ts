import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { CreateContactRequest } from "../types/apollo.js";

export const createContactSchema = z.object({
  first_name: z.string().describe("The contact's first name"),
  last_name: z.string().describe("The contact's last name"),
  title: z.string().optional().describe("The contact's job title"),
  organization_name: z.string().optional().describe("The company name"),
  email: z.string().email().optional().describe("Email address"),
  website_url: z.string().url().optional().describe("Company website URL"),
  direct_phone: z.string().optional().describe("Direct phone number"),
  mobile_phone: z.string().optional().describe("Mobile phone number"),
  label_names: z.array(z.string()).optional().describe("Labels to assign to the contact"),
  visibility: z.enum(["all", "only-me"]).optional().describe("Contact visibility (default: 'all')"),
});

export type CreateContactParams = z.infer<typeof createContactSchema>;

export async function createContactTool(
  params: CreateContactParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Creating new contact", params);

    const contactData: CreateContactRequest = {
      ...params,
    };

    const response = await apolloClient.createContact(contactData);

    if (response.contact) {
      logger.info(`Successfully created contact: ${response.contact.id}`);

      return {
        success: true,
        contact: {
          id: response.contact.id,
          name: response.contact.name,
          first_name: response.contact.first_name,
          last_name: response.contact.last_name,
          title: response.contact.title,
          email: response.contact.email,
          organization: response.contact.organization,
          direct_phone: response.contact.direct_phone,
          mobile_phone: response.contact.mobile_phone,
          labels: response.contact.label_names,
          visibility: response.contact.visibility,
          created_at: response.contact.created_at,
        },
        note: "Apollo does not apply deduplication when creating contacts via API. This may create duplicate contacts if similar details already exist.",
      };
    } else if (response.error) {
      logger.error("Failed to create contact", response.error);
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: false,
      error: "Unexpected response format from Apollo API",
    };
  } catch (error) {
    logger.error("Create contact failed", error);
    throw error;
  }
}

export const createContactDefinition = {
  name: "create_contact",
  description:
    "Create a new contact in Apollo.io. Note: Apollo does not apply deduplication - this will create a new contact even if similar details already exist.",
  inputSchema: zodToJsonSchema(createContactSchema),
};
