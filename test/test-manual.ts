#!/usr/bin/env node
import * as dotenv from "dotenv";
import { ApolloClient } from "../src/apollo-client.js";
import { peopleSearchTool } from "../src/tools/people-search.js";
import { organizationSearchTool } from "../src/tools/organization-search.js";
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

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  log("\nUsage: npm run test:manual [test-type]", colors.cyan);
  log("\ntest-type options:");
  log("  people - Test only people search");
  log("  org    - Test only organization search");
  log("  both   - Test both (default)");
  log("\nExample: npm run test:manual people");
  process.exit(0);
}

// Run the manual test
manualTest();