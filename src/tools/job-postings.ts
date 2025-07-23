import { z } from "zod";
import { ApolloClient } from "../apollo-client.js";
import { logger } from "../utils/logger.js";

export const jobPostingsSchema = z.object({
  organization_id: z.string().describe("Apollo organization ID"),
  page: z.number().min(1).optional().default(1).describe("Page number"),
  per_page: z.number().min(1).max(100).optional().default(25).describe("Results per page (max 100)"),
});

export type JobPostingsParams = z.infer<typeof jobPostingsSchema>;

export async function jobPostingsTool(
  params: JobPostingsParams,
  apolloClient: ApolloClient
): Promise<any> {
  try {
    logger.info("Fetching job postings", params);
    
    const response = await apolloClient.getJobPostings(
      params.organization_id,
      params.page || 1,
      params.per_page || 25
    );
    
    logger.info(`Found ${response.pagination.total_entries} job postings`);
    
    return {
      results: response.job_postings.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        posted_at: job.posted_at,
        job_type: job.job_type,
        seniority_level: job.seniority_level,
        description: job.description,
        apply_url: job.apply_url,
      })),
      pagination: {
        current_page: response.pagination.page,
        total_pages: response.pagination.total_pages,
        total_results: response.pagination.total_entries,
        results_per_page: response.pagination.per_page,
      },
    };
  } catch (error) {
    logger.error("Failed to fetch job postings", error);
    throw error;
  }
}

export const jobPostingsDefinition = {
  name: "job_postings",
  description: "Get current job postings for a specific organization",
  inputSchema: jobPostingsSchema,
};