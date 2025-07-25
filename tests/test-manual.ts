#!/usr/bin/env node
import * as dotenv from "dotenv";
import { ApolloClient } from "../src/apollo-client.js";
import { peopleSearchTool } from "../src/tools/people-search.js";
import { organizationSearchTool } from "../src/tools/organization-search.js";
import { peopleEnrichmentTool } from "../src/tools/people-enrichment.js";
import { peopleMatchTool } from "../src/tools/people-match.js";
import { outreachEmailSearchTool } from "../src/tools/outreach-email-search.js";
// Type definitions for the transformed results from our tools
interface PersonResult {
  id: string;
  name: string;
  title?: string;
  email?: string;
  company?: string;
  company_domain?: string;
  location?: string;
  linkedin_url?: string;
  seniority?: string;
  functions?: string[];
}

interface OrganizationResult {
  id: string;
  name: string;
  domain?: string;
  website_url?: string;
  industry?: string;
  industries?: string[];
  location?: string;
  employee_count?: number;
  employee_count_range?: string;
  revenue?: number;
  revenue_range?: string;
  technologies?: string[];
  funding_raised?: number;
  founded_year?: number;
  description?: string;
  linkedin_url?: string;
}

// Load environment variables
dotenv.config({ quiet: true });

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.warn(`${color}${message}${colors.reset}`);
}

async function manualTest() {
  log("\n🧪 Apollo.io Manual Test (Direct API Testing)", colors.bright + colors.blue);
  log("=".repeat(50), colors.blue);

  try {
    // Check for API key
    if (!process.env.APOLLO_API_KEY) {
      throw new Error("APOLLO_API_KEY not found in environment. Create a .env file with your API key.");
    }

    // Create Apollo client
    const apolloClient = new ApolloClient();
    log("✅ Apollo client initialized", colors.green);

    // Get test type from command line argument
    const testType = process.argv[2] || "both";

    if (testType === "people" || testType === "both") {
      await testPeopleSearchDirect(apolloClient);
    }

    if (testType === "org" || testType === "both") {
      await testOrganizationSearchDirect(apolloClient);
    }

    if (testType === "enrichment") {
      await testPeopleEnrichmentDirect(apolloClient);
    }

    if (testType === "match") {
      await testPeopleMatchDirect(apolloClient);
    }

    if (testType === "email") {
      await testEmailWorkflowDirect(apolloClient);
    }

    if (testType === "outreach") {
      await testOutreachEmailSearchDirect(apolloClient);
    }

    log("\n✅ All tests completed successfully!", colors.green);

  } catch (error) {
    log(`\n❌ Error: ${error}`, colors.red);
    if (error instanceof Error) {
      log(`Details: ${error.message}`, colors.red);
    }
    process.exit(1);
  }
}

async function testPeopleSearchDirect(apolloClient: ApolloClient) {
  log("\n🔍 Testing People Search (Direct API)", colors.cyan);
  
  const testCases = [
    {
      name: "Senior Engineers in Tech Hubs",
      params: {
        q_keywords: "software engineer",
        person_seniorities: ["senior", "lead"],
        person_locations: ["San Francisco, CA", "New York, NY", "Seattle, WA"],
        per_page: 3,
      },
    },
    {
      name: "Sales Leaders",
      params: {
        person_functions: ["sales"],
        person_seniorities: ["vp", "director"],
        per_page: 3,
      },
    },
  ];

  for (const testCase of testCases) {
    log(`\n📌 Test: ${testCase.name}`, colors.yellow);
    log(`Parameters: ${JSON.stringify(testCase.params, null, 2)}`, colors.cyan);

    try {
      const result = await peopleSearchTool(testCase.params, apolloClient);
      
      log("\n✅ Results:", colors.green);
      if (result.results && result.results.length > 0) {
        result.results.forEach((person: PersonResult, index: number) => {
          log(`\n${colors.bright}Person ${index + 1}:${colors.reset}`);
          log(`  Name: ${person.name}`);
          log(`  Title: ${person.title || "N/A"}`);
          log(`  Company: ${person.company || "N/A"}`);
          log(`  Location: ${person.location || "N/A"}`);
          log(`  Seniority: ${person.seniority || "N/A"}`);
        });
        
        log(`\n${colors.cyan}Pagination:${colors.reset}`);
        log(`  Current page: ${result.pagination.current_page}`);
        log(`  Total results: ${result.pagination.total_results}`);
        log(`  Total pages: ${result.pagination.total_pages}`);
      } else {
        log("No results found.", colors.yellow);
      }
    } catch (error) {
      log(`❌ Test failed: ${error}`, colors.red);
    }
  }
}

async function testOrganizationSearchDirect(apolloClient: ApolloClient) {
  log("\n\n🔍 Testing Organization Search (Direct API)", colors.cyan);
  
  const testCases = [
    {
      name: "Mid-size SaaS Companies",
      params: {
        industries: ["software", "saas"],
        employee_count_min: 50,
        employee_count_max: 500,
        per_page: 3,
      },
    },
    {
      name: "Tech Companies using AWS",
      params: {
        q_keywords: "technology",
        technologies: ["AWS", "Amazon Web Services"],
        per_page: 3,
      },
    },
  ];

  for (const testCase of testCases) {
    log(`\n📌 Test: ${testCase.name}`, colors.yellow);
    log(`Parameters: ${JSON.stringify(testCase.params, null, 2)}`, colors.cyan);

    try {
      const result = await organizationSearchTool(testCase.params, apolloClient);
      
      log("\n✅ Results:", colors.green);
      if (result.results && result.results.length > 0) {
        result.results.forEach((org: OrganizationResult, index: number) => {
          log(`\n${colors.bright}Organization ${index + 1}:${colors.reset}`);
          log(`  Name: ${org.name}`);
          log(`  Domain: ${org.domain || "N/A"}`);
          log(`  Industry: ${org.industry || "N/A"}`);
          log(`  Employees: ${org.employee_count || org.employee_count_range || "N/A"}`);
          log(`  Location: ${org.location || "N/A"}`);
          if (org.technologies && org.technologies.length > 0) {
            log(`  Technologies: ${org.technologies.slice(0, 5).join(", ")}`);
          }
        });
        
        log(`\n${colors.cyan}Pagination:${colors.reset}`);
        log(`  Current page: ${result.pagination.current_page}`);
        log(`  Total results: ${result.pagination.total_results}`);
        log(`  Total pages: ${result.pagination.total_pages}`);
      } else {
        log("No results found.", colors.yellow);
      }
    } catch (error) {
      log(`❌ Test failed: ${error}`, colors.red);
    }
  }
}

async function testPeopleEnrichmentDirect(apolloClient: ApolloClient) {
  log("\n\n🔍 Testing People Enrichment (Direct API)", colors.cyan);
  
  const testCases = [
    {
      name: "Enrich by Email",
      params: {
        email: "john.smith@example.com",
      },
    },
    {
      name: "Enrich by Name and Company",
      params: {
        name: "Jane Doe",
        organization_name: "Acme Corporation",
      },
    },
  ];

  for (const testCase of testCases) {
    log(`\n📌 Test: ${testCase.name}`, colors.yellow);
    log(`Parameters: ${JSON.stringify(testCase.params, null, 2)}`, colors.cyan);

    try {
      const result = await peopleEnrichmentTool(testCase.params, apolloClient);
      
      log("\n✅ Results:", colors.green);
      if (result.found) {
        const person = result.person;
        log(`\n${colors.bright}Person Found:${colors.reset}`);
        log(`  Name: ${person.name}`);
        log(`  Title: ${person.title || "N/A"}`);
        log(`  Email: ${person.email || "N/A"}`);
        log(`  Company: ${person.company?.name || "N/A"}`);
        log(`  Location: ${person.location || "N/A"}`);
        log(`  LinkedIn: ${person.linkedin_url || "N/A"}`);
      } else {
        log(result.message, colors.yellow);
      }
    } catch (error) {
      log(`❌ Test failed: ${error}`, colors.red);
    }
  }
}

async function testPeopleMatchDirect(apolloClient: ApolloClient) {
  log("\n\n🔍 Testing People Match (Direct API)", colors.cyan);
  log("Note: This endpoint consumes API credits!", colors.yellow);
  
  const testCases = [
    {
      name: "Match by Name and Company",
      params: {
        name: "Tim Cook",
        organization_name: "Apple",
        reveal_personal_emails: true,
        reveal_phone_number: true,
      },
    },
  ];

  for (const testCase of testCases) {
    log(`\n📌 Test: ${testCase.name}`, colors.yellow);
    log(`Parameters: ${JSON.stringify(testCase.params, null, 2)}`, colors.cyan);

    try {
      const result = await peopleMatchTool(testCase.params, apolloClient);
      
      log("\n✅ Results:", colors.green);
      if (result.found) {
        const person = result.person;
        log(`\n${colors.bright}Person Matched:${colors.reset}`);
        log(`  Name: ${person.name}`);
        log(`  Title: ${person.title || "N/A"}`);
        log(`  Primary Email: ${person.email || "N/A"}`);
        log(`  Personal Emails: ${person.personal_emails.join(", ") || "None"}`);
        log(`  Phone Numbers: ${person.phone_numbers.join(", ") || "None"}`);
        log(`  Company: ${person.company?.name || "N/A"}`);
        log(`  Credits Used: ${result.credits_used}`);
      } else {
        log(result.message, colors.yellow);
      }
    } catch (error) {
      log(`❌ Test failed: ${error}`, colors.red);
    }
  }
}

async function testEmailWorkflowDirect(apolloClient: ApolloClient) {
  log("\n\n📧 Testing Email Retrieval Workflow (Search + Match)", colors.cyan);
  log("This demonstrates the two-step process to find emails", colors.yellow);
  
  // Step 1: Search
  log("\n🔍 Step 1: Searching for Sales VPs...", colors.cyan);
  
  const searchParams = {
    person_functions: ["sales"],
    person_seniorities: ["vp"],
    per_page: 3,
  };
  
  try {
    const searchResult = await peopleSearchTool(searchParams, apolloClient);
    
    if (searchResult.results && searchResult.results.length > 0) {
      log(`\n✅ Found ${searchResult.results.length} people:`, colors.green);
      
      const firstPerson = searchResult.results[0];
      log(`\nUsing first result for email retrieval:`);
      log(`  Name: ${firstPerson.name}`);
      log(`  Company: ${firstPerson.company || "N/A"}`);
      log(`  Title: ${firstPerson.title || "N/A"}`);
      
      // Step 2: Match to get email
      log("\n🔍 Step 2: Getting email via match endpoint...", colors.cyan);
      
      const matchParams = {
        name: firstPerson.name,
        organization_name: firstPerson.company,
        domain: firstPerson.company_domain,
        linkedin_url: firstPerson.linkedin_url,
        reveal_personal_emails: true,
        reveal_phone_number: true,
      };
      
      const matchResult = await peopleMatchTool(matchParams, apolloClient);
      
      if (matchResult.found) {
        log("\n✅ Email Retrieved Successfully:", colors.green);
        log(`  Primary Email: ${matchResult.person.email || "Not found"}`);
        log(`  Personal Emails: ${matchResult.person.personal_emails.join(", ") || "None"}`);
        log(`  Phone Numbers: ${matchResult.person.phone_numbers.join(", ") || "None"}`);
        log(`  Credits Used: ${matchResult.credits_used}`);
      } else {
        log("\n⚠️  Could not retrieve email", colors.yellow);
      }
    } else {
      log("\nNo results found in search", colors.yellow);
    }
  } catch (error) {
    log(`❌ Workflow failed: ${error}`, colors.red);
  }
}

async function testOutreachEmailSearchDirect(apolloClient: ApolloClient) {
  log("\n\n📧 Testing Outreach Email Search (Direct API)", colors.cyan);
  log("Note: This endpoint requires a master API key and is not available on free plans!", colors.yellow);
  
  const testCases = [
    {
      name: "Search all outreach emails",
      params: {
        per_page: 5,
      },
    },
    {
      name: "Search by date range",
      params: {
        sent_at_after: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        per_page: 5,
      },
    },
  ];

  for (const testCase of testCases) {
    log(`\n📌 Test: ${testCase.name}`, colors.yellow);
    log(`Parameters: ${JSON.stringify(testCase.params, null, 2)}`, colors.cyan);

    try {
      const result = await outreachEmailSearchTool(testCase.params, apolloClient);
      
      log("\n✅ Results:", colors.green);
      if (result.results && result.results.length > 0) {
        result.results.forEach((email: any, index: number) => {
          log(`\n${colors.bright}Email ${index + 1}:${colors.reset}`);
          log(`  Subject: ${email.subject || "N/A"}`);
          log(`  From: ${email.from_email || "N/A"} (${email.from_name || "N/A"})`);
          log(`  To: ${email.to_email || "N/A"} (${email.to_name || "N/A"})`);
          log(`  Contact ID: ${email.contact_id || "N/A"}`);
          log(`  Sent: ${email.sent_at || "N/A"}`);
          log(`  Status: ${email.status || "N/A"}`);
          log(`  Type: ${email.type || "N/A"}`);
        });
        
        log(`\n${colors.cyan}Pagination:${colors.reset}`);
        log(`  Current page: ${result.pagination.current_page}`);
        log(`  Total results: ${result.pagination.total_results}`);
        log(`  Total pages: ${result.pagination.total_pages}`);
      } else {
        log("No results found.", colors.yellow);
      }
    } catch (error: any) {
      log(`❌ Test failed: ${error.message}`, colors.red);
      if (error.response) {
        log(`  Status: ${error.response.status}`, colors.red);
        log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
      }
      // Log full error details for debugging
      log(`  Full error: ${JSON.stringify(error, null, 2)}`, colors.red);
    }
  }
}

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  log("\nUsage: npm run test:manual [test-type]", colors.cyan);
  log("\ntest-type options:");
  log("  people      - Test only people search");
  log("  org         - Test only organization search");
  log("  enrichment  - Test people enrichment");
  log("  match       - Test people match (uses credits!)");
  log("  email       - Test email workflow (search + match)");
  log("  outreach    - Test outreach email search (requires master key)");
  log("  both        - Test people and org search (default)");
  log("\nExamples:");
  log("  npm run test:manual people");
  log("  npm run test:manual email");
  process.exit(0);
}

// Run the manual test
manualTest();