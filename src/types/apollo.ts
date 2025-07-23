// Apollo.io API Types

// Common types
export interface Pagination {
  page?: number;
  per_page?: number;
}

// People Search Types
export interface PeopleSearchRequest extends Pagination {
  q_keywords?: string;
  name?: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  industry?: string;
  person_titles?: string[];
  organization_domains?: string[];
  person_locations?: string[];
  organization_locations?: string[];
  q_organization_domains?: string[];
  organization_ids?: string[];
  person_seniorities?: string[];
  person_functions?: string[];
  organization_num_employees_ranges?: string[];
}

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email?: string;
  phone_numbers?: string[];
  linkedin_url?: string;
  photo_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: {
    id: string;
    name: string;
    domain: string;
    industry?: string;
  };
  seniority?: string;
  functions?: string[];
}

export interface PeopleSearchResponse {
  breadcrumbs: any[];
  people: Person[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Organization Search Types
export interface OrganizationSearchRequest extends Pagination {
  q_keywords?: string;
  name?: string;
  domains?: string[];
  locations?: string[];
  industries?: string[];
  employee_count_range?: {
    min?: number;
    max?: number;
  };
  revenue_range?: {
    min?: number;
    max?: number;
  };
  technologies?: string[];
  funding_raised_range?: {
    min?: number;
    max?: number;
  };
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  domains?: string[];
  website_url?: string;
  logo_url?: string;
  industry?: string;
  industries?: string[];
  city?: string;
  state?: string;
  country?: string;
  employee_count?: number;
  employee_count_range?: string;
  revenue?: number;
  revenue_range?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  technologies?: string[];
  funding_raised?: number;
  founded_year?: number;
  description?: string;
}

export interface OrganizationSearchResponse {
  breadcrumbs: any[];
  organizations: Organization[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// People Enrichment Types
export interface PeopleEnrichmentRequest {
  email?: string;
  linkedin_url?: string;
  name?: string;
  organization_name?: string;
  domain?: string;
}

export interface PeopleEnrichmentResponse {
  person: Person | null;
}

// Organization Enrichment Types
export interface OrganizationEnrichmentRequest {
  domain?: string;
  name?: string;
}

export interface OrganizationEnrichmentResponse {
  organization: Organization | null;
}

// People Match Types
export interface PeopleMatchRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  organization_name?: string;
  domain?: string;
  linkedin_url?: string;
  reveal_personal_emails?: boolean;
  reveal_phone_number?: boolean;
}

export interface PeopleMatchResponse {
  person?: {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    title?: string;
    email?: string;
    email_status?: string;
    personal_emails?: string[];
    phone_numbers?: string[];
    linkedin_url?: string;
    photo_url?: string;
    city?: string;
    state?: string;
    country?: string;
    organization?: Organization;
    seniority?: string;
    functions?: string[];
    employment_history?: Array<{
      id: string;
      organization_name: string;
      title?: string;
      start_date?: string;
      end_date?: string;
      current?: boolean;
    }>;
  };
  credits_used?: number;
}

// Job Postings Types
export interface JobPosting {
  id: string;
  title: string;
  department?: string;
  location?: string;
  posted_at?: string;
  job_type?: string;
  seniority_level?: string;
  description?: string;
  apply_url?: string;
}

export interface JobPostingsResponse {
  job_postings: JobPosting[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// API Error Response
export interface ApolloAPIError {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}