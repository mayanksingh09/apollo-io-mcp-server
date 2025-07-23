#!/usr/bin/env node
import * as dotenv from "dotenv";
import { ApolloClient } from "../src/apollo-client.js";
import { peopleSearchTool } from "../src/tools/people-search.js";
import { peopleMatchTool } from "../src/tools/people-match.js";
import readline from "readline";

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function log(message: string, color: string = colors.reset) {
  console.warn(`${color}${message}${colors.reset}`);
}

async function emailWorkflowTest() {
  log("\n📧 Apollo.io Email Retrieval Workflow Test", colors.bright + colors.blue);
  log("This demonstrates how to find email addresses in two steps", colors.yellow);
  log("=".repeat(60), colors.blue);

  try {
    // Check for API key
    if (!process.env.APOLLO_API_KEY) {
      throw new Error("APOLLO_API_KEY not found in environment. Create a .env file with your API key.");
    }

    // Create Apollo client
    const apolloClient = new ApolloClient();
    log("\n✅ Apollo client initialized", colors.green);

    // Get workflow type
    const workflowType = process.argv[2] || "interactive";

    if (workflowType === "demo") {
      await runDemoWorkflows(apolloClient);
    } else {
      await runInteractiveWorkflow(apolloClient);
    }

    rl.close();
    log("\n✅ Email workflow test completed!", colors.green);

  } catch (error) {
    log(`\n❌ Error: ${error}`, colors.red);
    if (error instanceof Error) {
      log(`Details: ${error.message}`, colors.red);
    }
    rl.close();
    process.exit(1);
  }
}

async function runDemoWorkflows(apolloClient: ApolloClient) {
  log("\n🎯 Running Demo Email Workflows", colors.cyan);
  
  const demoScenarios = [
    {
      name: "Find emails for CTOs at startups",
      searchParams: {
        title: "CTO",
        q_keywords: "startup",
        per_page: 3,
      },
    },
    {
      name: "Find emails for Marketing Directors",
      searchParams: {
        person_functions: ["marketing"],
        person_seniorities: ["director"],
        per_page: 3,
      },
    },
    {
      name: "Find emails for Engineers at specific company",
      searchParams: {
        title: "software engineer",
        company: "Microsoft",
        per_page: 3,
      },
    },
  ];

  for (const scenario of demoScenarios) {
    log(`\n\n${"=".repeat(60)}`, colors.blue);
    log(`📌 Scenario: ${scenario.name}`, colors.bright + colors.cyan);
    
    await performEmailWorkflow(apolloClient, scenario.searchParams, true);
    
    const continueChoice = await prompt("\nPress Enter to continue to next scenario (or 'q' to quit): ");
    if (continueChoice.toLowerCase() === 'q') break;
  }
}

async function runInteractiveWorkflow(apolloClient: ApolloClient) {
  log("\n🔍 Interactive Email Retrieval Workflow", colors.cyan);
  
  let continueWorkflow = true;
  
  while (continueWorkflow) {
    log("\n" + "=".repeat(60), colors.blue);
    log("Build your search criteria:", colors.cyan);
    
    const searchParams: any = { per_page: 5 };
    
    const name = await prompt("\nPerson's name (or press Enter to skip): ");
    if (name) searchParams.name = name;
    
    const title = await prompt("Job title (or press Enter to skip): ");
    if (title) searchParams.title = title;
    
    const company = await prompt("Company name (or press Enter to skip): ");
    if (company) searchParams.company = company;
    
    const location = await prompt("Location (or press Enter to skip): ");
    if (location) searchParams.location = location;
    
    const keywords = await prompt("Keywords (or press Enter to skip): ");
    if (keywords) searchParams.q_keywords = keywords;
    
    // Validate we have at least one search criterion
    if (Object.keys(searchParams).length === 1) {
      log("\n⚠️  Please provide at least one search criterion", colors.yellow);
      continue;
    }
    
    await performEmailWorkflow(apolloClient, searchParams, false);
    
    const again = await prompt("\n\nSearch for another person? (y/n): ");
    continueWorkflow = again.toLowerCase() === 'y';
  }
}

async function performEmailWorkflow(
  apolloClient: ApolloClient, 
  searchParams: any, 
  autoSelect: boolean
): Promise<void> {
  try {
    // Step 1: Search for people
    log("\n📍 Step 1: Searching for people...", colors.yellow);
    log(`Search parameters: ${JSON.stringify(searchParams, null, 2)}`, colors.cyan);
    
    const searchResult = await peopleSearchTool(searchParams, apolloClient);
    
    if (!searchResult.results || searchResult.results.length === 0) {
      log("\n⚠️  No people found with these criteria", colors.yellow);
      return;
    }
    
    log(`\n✅ Found ${searchResult.results.length} people:`, colors.green);
    
    // Display search results
    searchResult.results.forEach((person: any, index: number) => {
      log(`\n${colors.bright}[${index + 1}] ${person.name}${colors.reset}`);
      log(`    Title: ${person.title || "N/A"}`);
      log(`    Company: ${person.company || "N/A"}`);
      log(`    Location: ${person.location || "N/A"}`);
      if (person.linkedin_url) log(`    LinkedIn: ${person.linkedin_url}`);
    });
    
    // Select person for email retrieval
    let selectedIndex = 0;
    
    if (autoSelect) {
      log(`\n🤖 Auto-selecting first result for demo`, colors.cyan);
    } else {
      const selection = await prompt(`\nSelect person number (1-${searchResult.results.length}) or 'a' for all: `);
      
      if (selection.toLowerCase() === 'a') {
        // Process all results
        log("\n📧 Retrieving emails for all results...", colors.yellow);
        
        for (let i = 0; i < searchResult.results.length; i++) {
          await retrieveEmailForPerson(apolloClient, searchResult.results[i], i + 1);
        }
        return;
      }
      
      selectedIndex = parseInt(selection) - 1;
      
      if (selectedIndex < 0 || selectedIndex >= searchResult.results.length) {
        log("\n❌ Invalid selection", colors.red);
        return;
      }
    }
    
    const selectedPerson = searchResult.results[selectedIndex];
    await retrieveEmailForPerson(apolloClient, selectedPerson, selectedIndex + 1);
    
  } catch (error) {
    log(`\n❌ Workflow error: ${error}`, colors.red);
  }
}

async function retrieveEmailForPerson(
  apolloClient: ApolloClient, 
  person: any, 
  personNumber: number
): Promise<void> {
  // Step 2: Match to get email
  log(`\n📍 Step 2: Getting email for person #${personNumber} (${person.name})...`, colors.yellow);
  log("⚠️  Note: This consumes API credits", colors.yellow);
  
  // Build match parameters with all available data
  const matchParams: any = {
    name: person.name,
    reveal_personal_emails: true,
    reveal_phone_number: true,
  };
  
  if (person.company) matchParams.organization_name = person.company;
  if (person.company_domain) matchParams.domain = person.company_domain;
  if (person.linkedin_url) matchParams.linkedin_url = person.linkedin_url;
  
  log(`Match parameters: ${JSON.stringify(matchParams, null, 2)}`, colors.cyan);
  
  try {
    const matchResult = await peopleMatchTool(matchParams, apolloClient);
    
    if (matchResult.found) {
      log(`\n✅ ${colors.bright}Email Retrieved Successfully!${colors.reset}`, colors.green);
      log(`\n${colors.bright}📇 Contact Information:${colors.reset}`);
      log(`  Name: ${matchResult.person.name}`);
      log(`  Title: ${matchResult.person.title || "N/A"}`);
      log(`  Company: ${matchResult.person.company?.name || "N/A"}`);
      
      if (matchResult.person.email) {
        log(`  ${colors.bright}Primary Email: ${matchResult.person.email}${colors.reset}`);
      } else {
        log(`  Primary Email: Not found`);
      }
      
      if (matchResult.person.personal_emails && matchResult.person.personal_emails.length > 0) {
        log(`  ${colors.bright}Personal Emails: ${matchResult.person.personal_emails.join(", ")}${colors.reset}`);
      }
      
      if (matchResult.person.phone_numbers && matchResult.person.phone_numbers.length > 0) {
        log(`  Phone Numbers: ${matchResult.person.phone_numbers.join(", ")}`);
      }
      
      log(`\n💰 Credits Used: ${matchResult.credits_used}`);
      
      // Show employment history if available
      if (matchResult.person.employment_history && matchResult.person.employment_history.length > 0) {
        log(`\n${colors.bright}📋 Employment History:${colors.reset}`);
        matchResult.person.employment_history.slice(0, 3).forEach((job: any) => {
          log(`  - ${job.title || "N/A"} at ${job.organization_name}`);
          if (job.current) log(`    (Current position)`);
        });
      }
    } else {
      log(`\n⚠️  Could not retrieve email for ${person.name}`, colors.yellow);
      log(`  Reason: ${matchResult.message}`, colors.yellow);
    }
  } catch (error) {
    log(`\n❌ Match failed for ${person.name}: ${error}`, colors.red);
  }
}

// Show usage if help is requested
if (process.argv[2] === "--help" || process.argv[2] === "-h") {
  log("\nUsage: npm run test:email [mode]", colors.cyan);
  log("\nmode options:");
  log("  interactive - Interactive workflow (default)");
  log("  demo        - Run pre-configured demo scenarios");
  log("\nExamples:");
  log("  npm run test:email");
  log("  npm run test:email demo");
  log("\nThis test demonstrates the two-step process:");
  log("  1. Search for people using various criteria");
  log("  2. Match found people to retrieve their email addresses");
  log("\n⚠️  Note: The match step consumes API credits!");
  process.exit(0);
}

// Run the email workflow test
emailWorkflowTest();