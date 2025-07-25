import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from "axios";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import {
  ApolloError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
} from "./utils/errors.js";
import type {
  PeopleSearchRequest,
  PeopleSearchResponse,
  OrganizationSearchRequest,
  OrganizationSearchResponse,
  PeopleEnrichmentRequest,
  PeopleEnrichmentResponse,
  PeopleMatchRequest,
  PeopleMatchResponse,
  OrganizationEnrichmentRequest,
  OrganizationEnrichmentResponse,
  JobPostingsResponse,
  CreateContactRequest,
  CreateContactResponse,
  ApolloAPIError,
} from "./types/apollo.js";

export class ApolloClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.apollo.apiKey;
    
    this.client = axios.create({
      baseURL: config.apollo.baseUrl,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((req) => {
      req.headers["X-Api-Key"] = this.apiKey;
      return req;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError<ApolloAPIError>): never {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.error?.message || error.message;

      logger.error(`Apollo API error: ${status}`, {
        status,
        message,
        data: data?.error,
      });

      switch (status) {
        case 401:
          throw new AuthenticationError(message);
        case 429:
          const retryAfter = error.response.headers["retry-after"];
          throw new RateLimitError(message, retryAfter ? parseInt(retryAfter) : undefined);
        case 400:
          throw new ValidationError(message, data?.error?.details);
        default:
          throw new ApolloError(message, data?.error?.code, status, data?.error?.details);
      }
    } else if (error.request) {
      logger.error("Network error", error.message);
      throw new ApolloError("Network error: Unable to reach Apollo API", "NETWORK_ERROR");
    } else {
      logger.error("Unexpected error", error.message);
      throw new ApolloError(error.message, "UNKNOWN_ERROR");
    }
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    logger.debug(`Making request to ${config.method} ${config.url}`, config.data || config.params);
    const response = await this.client.request<T>(config);
    return response.data;
  }

  // People Search
  async searchPeople(params: PeopleSearchRequest): Promise<PeopleSearchResponse> {
    return this.request<PeopleSearchResponse>({
      method: "POST",
      url: "/mixed_people/search",
      data: params,
    });
  }

  // Organization Search
  async searchOrganizations(
    params: OrganizationSearchRequest
  ): Promise<OrganizationSearchResponse> {
    return this.request<OrganizationSearchResponse>({
      method: "POST",
      url: "/mixed_companies/search",
      data: params,
    });
  }

  // People Enrichment
  async enrichPerson(params: PeopleEnrichmentRequest): Promise<PeopleEnrichmentResponse> {
    return this.request<PeopleEnrichmentResponse>({
      method: "GET",
      url: "/people/enrich",
      params,
    });
  }

  // People Match
  async matchPerson(params: PeopleMatchRequest): Promise<PeopleMatchResponse> {
    return this.request<PeopleMatchResponse>({
      method: "POST",
      url: "/people/match",
      data: params,
    });
  }

  // Organization Enrichment
  async enrichOrganization(
    params: OrganizationEnrichmentRequest
  ): Promise<OrganizationEnrichmentResponse> {
    return this.request<OrganizationEnrichmentResponse>({
      method: "GET",
      url: "/organizations/enrich",
      params,
    });
  }

  // Job Postings
  async getJobPostings(
    organizationId: string,
    page = 1,
    perPage = 100
  ): Promise<JobPostingsResponse> {
    return this.request<JobPostingsResponse>({
      method: "GET",
      url: `/organizations/${organizationId}/job_postings`,
      params: {
        page,
        per_page: perPage,
      },
    });
  }

  // Create Contact
  async createContact(params: CreateContactRequest): Promise<CreateContactResponse> {
    return this.request<CreateContactResponse>({
      method: "POST",
      url: "/contacts",
      data: params,
    });
  }

  // Helper method to handle paginated results
  async *searchPeoplePaginated(
    params: PeopleSearchRequest,
    maxPages = 10
  ): AsyncGenerator<PeopleSearchResponse, void, unknown> {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const response = await this.searchPeople({ ...params, page, per_page: 100 });
      yield response;

      hasMore = response.pagination.page < response.pagination.total_pages;
      page++;
    }
  }

  async *searchOrganizationsPaginated(
    params: OrganizationSearchRequest,
    maxPages = 10
  ): AsyncGenerator<OrganizationSearchResponse, void, unknown> {
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= maxPages) {
      const response = await this.searchOrganizations({ ...params, page, per_page: 100 });
      yield response;

      hasMore = response.pagination.page < response.pagination.total_pages;
      page++;
    }
  }
}