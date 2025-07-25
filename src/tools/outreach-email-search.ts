import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";
import type { OutreachEmailSearchRequest } from "../types/apollo.js";

export const outreachEmailSearchSchema = z.object({
  subject: z.string().optional().describe("Filter by email subject"),
  body: z.string().optional().describe("Filter by email body content"),
  from_address: z.string().optional().describe("Filter by sender email address"),
  to_address: z.string().optional().describe("Filter by recipient email address"),
  bounce_type: z.string().optional().describe("Filter by bounce type"),
  sent_at_before: z
    .string()
    .optional()
    .describe("Filter emails sent before this date (ISO 8601 format)"),
  sent_at_after: z
    .string()
    .optional()
    .describe("Filter emails sent after this date (ISO 8601 format)"),
  delivered_at_before: z.string().optional().describe("Filter emails delivered before this date"),
  delivered_at_after: z.string().optional().describe("Filter emails delivered after this date"),
  opened_at_before: z.string().optional().describe("Filter emails opened before this date"),
  opened_at_after: z.string().optional().describe("Filter emails opened after this date"),
  clicked_at_before: z.string().optional().describe("Filter emails clicked before this date"),
  clicked_at_after: z.string().optional().describe("Filter emails clicked after this date"),
  bounced_at_before: z.string().optional().describe("Filter emails bounced before this date"),
  bounced_at_after: z.string().optional().describe("Filter emails bounced after this date"),
  replied_at_before: z.string().optional().describe("Filter emails replied to before this date"),
  replied_at_after: z.string().optional().describe("Filter emails replied to after this date"),
  emailer_campaign_ids: z.array(z.string()).optional().describe("Filter by emailer campaign IDs"),
  contact_ids: z.array(z.string()).optional().describe("Filter by contact IDs"),
  page: z.number().min(1).max(500).default(1).optional().describe("Page number (max 500)"),
  per_page: z
    .number()
    .min(1)
    .max(100)
    .default(25)
    .optional()
    .describe("Results per page (max 100)"),
});

export type OutreachEmailSearchParams = z.infer<typeof outreachEmailSearchSchema>;

export async function outreachEmailSearchTool(
  params: OutreachEmailSearchParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Executing outreach email search", params);

    const searchParams: OutreachEmailSearchRequest = {
      ...params,
      page: params.page || 1,
      per_page: params.per_page || 25,
    };

    const response = await apolloClient.searchOutreachEmails(searchParams);

    // Debug log the response structure
    logger.debug("Raw response from Apollo API:", JSON.stringify(response, null, 2));

    // Check if response has expected structure
    if (!response || !response.emailer_messages) {
      logger.error("Unexpected response structure:", response);
      throw new Error("Invalid response structure from Apollo API");
    }

    logger.info(`Found ${response.emailer_messages.length} outreach emails`);

    return {
      results: response.emailer_messages.map((email) => ({
        id: email.id,
        subject: email.subject,
        body_text: email.body_text,
        from_email: email.from_email,
        from_name: email.from_name,
        to_email: email.to_email,
        to_name: email.to_name,
        cc_emails: email.cc_emails,
        bcc_emails: email.bcc_emails,
        campaign_id: email.emailer_campaign_id,
        contact_id: email.contact_id,
        sent_at: email.due_at,
        completed_at: email.completed_at,
        status: email.status,
        type: email.type,
        tracking_disabled_reason: email.tracking_disabled_reason,
        recipients: email.recipients,
      })),
      pagination: {
        current_page: params.page || 1,
        total_results: response.emailer_messages.length,
        note: "This endpoint does not provide pagination metadata. Results shown are from the requested page only.",
      },
      note: "This endpoint requires a master API key and searches emails created and sent via Apollo sequences. Not available on free plans.",
    };
  } catch (error) {
    logger.error("Outreach email search failed", error);
    throw error;
  }
}

export const outreachEmailSearchDefinition = {
  name: "outreach_email_search",
  description:
    "Search for outreach emails sent via Apollo sequences. Requires a master API key. Limited to 50,000 results (500 pages). Not available on free plans.",
  inputSchema: zodToJsonSchema(outreachEmailSearchSchema),
};
