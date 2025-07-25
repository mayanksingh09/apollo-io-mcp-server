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
  contact_email_status?: string;
  include_similar_titles?: boolean;
  q_organization_domains_list?: string[];
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

// Create Contact Types
export interface CreateContactRequest {
  first_name: string;
  last_name: string;
  title?: string;
  organization_name?: string;
  email?: string;
  website_url?: string;
  direct_phone?: string;
  mobile_phone?: string;
  label_names?: string[];
  visibility?: "all" | "only-me";
}

export interface CreateContactResponse {
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    title?: string;
    email?: string;
    organization?: {
      id: string;
      name: string;
      domain?: string;
    };
    direct_phone?: string;
    mobile_phone?: string;
    label_names?: string[];
    visibility?: string;
    created_at?: string;
    updated_at?: string;
  };
  success?: boolean;
  error?: string;
}

// Contact Search Types
export interface ContactSearchRequest extends Pagination {
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
  person_seniorities?: string[];
  person_functions?: string[];
  organization_num_employees_ranges?: string[];
  contact_type?: "person" | "company";
  contact_email_status?: string;
  label_names?: string[];
}

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title?: string;
  email?: string;
  email_status?: string;
  phone_numbers?: string[];
  direct_phone?: string;
  mobile_phone?: string;
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
  label_names?: string[];
  visibility?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactSearchResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

// Outreach Email Search
export interface OutreachEmailSearchRequest {
  subject?: string;
  body?: string;
  from_address?: string;
  to_address?: string;
  bounce_type?: string;
  sent_at_before?: string;
  sent_at_after?: string;
  delivered_at_before?: string;
  delivered_at_after?: string;
  opened_at_before?: string;
  opened_at_after?: string;
  clicked_at_before?: string;
  clicked_at_after?: string;
  bounced_at_before?: string;
  bounced_at_after?: string;
  replied_at_before?: string;
  replied_at_after?: string;
  emailer_campaign_ids?: string[];
  contact_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface OutreachEmail {
  id: string;
  user_id?: string;
  status?: string;
  time_zone?: string | null;
  provider_message_id?: string;
  to_name?: string;
  due_at?: string;
  completed_at?: string;
  emailer_touch_id?: string | null;
  emailer_campaign_id?: string | null;
  emailer_step_id?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
  attachment_ids?: string[];
  enable_tracking?: boolean;
  type?: string;
  contact_id?: string;
  provider_thread_id?: string;
  schedule_delayed_reason?: string | null;
  demoed?: boolean | null;
  email_account_id?: string;
  due_at_manually_changed?: boolean;
  not_sent_reason?: string | null;
  bounce?: any | null;
  spam_blocked?: boolean | null;
  tracking_disabled_reason?: string;
  created_at?: string;
  async_sending?: boolean;
  due_at_source?: string;
  crm_id?: string | null;
  replied?: boolean | null;
  needs_dynamic_assemble?: boolean;
  personalized_opener?: string | null;
  reply_class?: string | null;
  schedule_delayed_limit_reason?: string | null;
  schedule_delayed_reason_details?: string | null;
  sensitive_info_redacted?: boolean | null;
  account_id?: string;
  recipients?: Array<{
    email: string;
    raw_name: string;
    recipient_type_cd: string;
    contact_id: string | null;
    user_id: string | null;
  }>;
  send_from?: {
    email: string;
    raw_name: string;
    recipient_type_cd: string | null;
    contact_id: string | null;
    user_id: string | null;
  };
  from_email?: string;
  to_email?: string;
  from_name?: string;
  bcc_emails?: string[];
  cc_emails?: string[];
  send_from_info?: string;
  body_text?: string;
  subject?: string;
}

export interface OutreachEmailSearchResponse {
  breadcrumbs: any[];
  emailer_messages: OutreachEmail[];
  emailer_steps: any[];
  num_fetch_result: number | null;
}

// API Error Response
export interface ApolloAPIError {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}
