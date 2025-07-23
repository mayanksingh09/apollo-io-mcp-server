#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import readline from "readline";

// ANSI color codes for better output
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

async function testMCPServer() {
  log("\n🚀 Apollo.io MCP Server Test Client", colors.bright + colors.blue);
  log("=".repeat(50), colors.blue);

  try {
    // Check for API key
    if (!process.env.APOLLO_API_KEY) {
      log("\n⚠️  Warning: APOLLO_API_KEY not found in environment", colors.yellow);
      log("Make sure you have a .env file with your API key", colors.yellow);
    }

    // Start the server process
    log("\n📡 Starting MCP server...", colors.cyan);
    const serverProcess = spawn("node", ["dist/index.js"], {
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Create transport and client
    const transport = new StdioClientTransport({
      command: "node",
      args: ["dist/index.js"],
      env: process.env as Record<string, string>,
    });

    const client = new Client(
      { name: "apollo-test-client", version: "1.0.0" },
      { capabilities: {} }
    );

    // Connect to server
    await client.connect(transport);
    log("✅ Connected to MCP server", colors.green);

    // List available tools
    log("\n📋 Available tools:", colors.cyan);
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools || [];
    
    tools.forEach((tool, index) => {
      log(`  ${index + 1}. ${colors.bright}${tool.name}${colors.reset} - ${tool.description}`);
    });

    // Main test loop
    let testing = true;
    while (testing) {
      log("\n" + "=" .repeat(50), colors.blue);
      log("Select a test option:", colors.cyan);
      log("1. Test people_search");
      log("2. Test organization_search");
      log("3. Custom people search");
      log("4. Custom organization search");
      log("5. Test people_enrichment");
      log("6. Test people_match");
      log("7. Test email retrieval workflow (search + match)");
      log("8. Exit");

      const choice = await prompt("\nEnter your choice (1-8): ");

      switch (choice) {
        case "1":
          await testPeopleSearch(client);
          break;
        case "2":
          await testOrganizationSearch(client);
          break;
        case "3":
          await customPeopleSearch(client);
          break;
        case "4":
          await customOrganizationSearch(client);
          break;
        case "5":
          await testPeopleEnrichment(client);
          break;
        case "6":
          await testPeopleMatch(client);
          break;
        case "7":
          await testEmailWorkflow(client);
          break;
        case "8":
          testing = false;
          break;
        default:
          log("Invalid choice. Please try again.", colors.red);
      }
    }

    // Cleanup
    log("\n👋 Closing connection...", colors.cyan);
    await client.close();
    serverProcess.kill();
    rl.close();
    
    log("✅ Test completed successfully!", colors.green);

  } catch (error) {
    log(`\n❌ Error: ${error}`, colors.red);
    if (error instanceof Error) {
      log(`Details: ${error.message}`, colors.red);
      if (error.stack) {
        log(`Stack trace:\n${error.stack}`, colors.red);
      }
    }
    rl.close();
    process.exit(1);
  }
}

async function testPeopleSearch(client: Client) {
  log("\n🔍 Testing people_search with sample parameters...", colors.cyan);
  
  try {
    const result = await client.callTool("people_search", {
      q_keywords: "software engineer",
      location: "San Francisco",
      person_seniorities: ["senior", "manager"],
      per_page: 5,
    });

    log("\n✅ People search results:", colors.green);
    console.warn(JSON.parse(result.content[0].text));
  } catch (error) {
    log(`❌ People search failed: ${error}`, colors.red);
  }
}

async function testOrganizationSearch(client: Client) {
  log("\n🔍 Testing organization_search with sample parameters...", colors.cyan);
  
  try {
    const result = await client.callTool("organization_search", {
      q_keywords: "technology",
      industries: ["software", "saas"],
      employee_count_min: 50,
      employee_count_max: 500,
      per_page: 5,
    });

    log("\n✅ Organization search results:", colors.green);
    console.warn(JSON.parse(result.content[0].text));
  } catch (error) {
    log(`❌ Organization search failed: ${error}`, colors.red);
  }
}

async function customPeopleSearch(client: Client) {
  log("\n🔍 Custom People Search", colors.cyan);
  
  const params: any = {};
  
  const keywords = await prompt("Enter keywords (or press Enter to skip): ");
  if (keywords) params.q_keywords = keywords;
  
  const name = await prompt("Enter name (or press Enter to skip): ");
  if (name) params.name = name;
  
  const title = await prompt("Enter job title (or press Enter to skip): ");
  if (title) params.title = title;
  
  const company = await prompt("Enter company (or press Enter to skip): ");
  if (company) params.company = company;
  
  const location = await prompt("Enter location (or press Enter to skip): ");
  if (location) params.location = location;
  
  const perPage = await prompt("Results per page (default 10): ");
  params.per_page = perPage ? parseInt(perPage) : 10;

  try {
    log("\n⏳ Searching...", colors.yellow);
    const result = await client.callTool("people_search", params);
    
    log("\n✅ Search results:", colors.green);
    const data = JSON.parse(result.content[0].text);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((person: any, index: number) => {
        log(`\n${colors.bright}Person ${index + 1}:${colors.reset}`);
        log(`  Name: ${person.name}`);
        log(`  Title: ${person.title || "N/A"}`);
        log(`  Company: ${person.company || "N/A"}`);
        log(`  Location: ${person.location || "N/A"}`);
        if (person.email) log(`  Email: ${person.email}`);
        if (person.linkedin_url) log(`  LinkedIn: ${person.linkedin_url}`);
      });
      
      log(`\n${colors.cyan}Total results: ${data.pagination.total_results}${colors.reset}`);
    } else {
      log("No results found.", colors.yellow);
    }
  } catch (error) {
    log(`❌ Search failed: ${error}`, colors.red);
  }
}

async function customOrganizationSearch(client: Client) {
  log("\n🔍 Custom Organization Search", colors.cyan);
  
  const params: any = {};
  
  const keywords = await prompt("Enter keywords (or press Enter to skip): ");
  if (keywords) params.q_keywords = keywords;
  
  const name = await prompt("Enter company name (or press Enter to skip): ");
  if (name) params.name = name;
  
  const industries = await prompt("Enter industries (comma-separated, or press Enter to skip): ");
  if (industries) params.industries = industries.split(",").map(i => i.trim());
  
  const minEmployees = await prompt("Minimum employees (or press Enter to skip): ");
  if (minEmployees) params.employee_count_min = parseInt(minEmployees);
  
  const maxEmployees = await prompt("Maximum employees (or press Enter to skip): ");
  if (maxEmployees) params.employee_count_max = parseInt(maxEmployees);
  
  const technologies = await prompt("Enter technologies (comma-separated, or press Enter to skip): ");
  if (technologies) params.technologies = technologies.split(",").map(t => t.trim());
  
  const perPage = await prompt("Results per page (default 10): ");
  params.per_page = perPage ? parseInt(perPage) : 10;

  try {
    log("\n⏳ Searching...", colors.yellow);
    const result = await client.callTool("organization_search", params);
    
    log("\n✅ Search results:", colors.green);
    const data = JSON.parse(result.content[0].text);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((org: any, index: number) => {
        log(`\n${colors.bright}Organization ${index + 1}:${colors.reset}`);
        log(`  Name: ${org.name}`);
        log(`  Domain: ${org.domain || "N/A"}`);
        log(`  Industry: ${org.industry || "N/A"}`);
        log(`  Location: ${org.location || "N/A"}`);
        log(`  Employees: ${org.employee_count || org.employee_count_range || "N/A"}`);
        if (org.description) {
          log(`  Description: ${org.description.substring(0, 100)}...`);
        }
        if (org.technologies && org.technologies.length > 0) {
          log(`  Technologies: ${org.technologies.slice(0, 5).join(", ")}`);
        }
      });
      
      log(`\n${colors.cyan}Total results: ${data.pagination.total_results}${colors.reset}`);
    } else {
      log("No results found.", colors.yellow);
    }
  } catch (error) {
    log(`❌ Search failed: ${error}`, colors.red);
  }
}

async function testPeopleEnrichment(client: Client) {
  log("\n🔍 Testing people_enrichment...", colors.cyan);
  
  const email = await prompt("Enter email address (or press Enter for demo): ");
  const linkedin = await prompt("Enter LinkedIn URL (or press Enter to skip): ");
  
  try {
    const params: any = {};
    if (email) params.email = email;
    else params.email = "john.smith@example.com"; // Demo email
    
    if (linkedin) params.linkedin_url = linkedin;
    
    const result = await client.callTool("people_enrichment", params);
    log("\n✅ Enrichment results:", colors.green);
    console.warn(JSON.parse(result.content[0].text));
  } catch (error) {
    log(`❌ People enrichment failed: ${error}`, colors.red);
  }
}

async function testPeopleMatch(client: Client) {
  log("\n🔍 Testing people_match...", colors.cyan);
  
  const name = await prompt("Enter person's name: ");
  const company = await prompt("Enter company name: ");
  const domain = await prompt("Enter company domain (or press Enter to skip): ");
  
  try {
    const params: any = {
      name,
      organization_name: company,
      reveal_personal_emails: true,
      reveal_phone_number: true,
    };
    
    if (domain) params.domain = domain;
    
    log("\n⏳ Matching person (this consumes API credits)...", colors.yellow);
    const result = await client.callTool("people_match", params);
    
    log("\n✅ Match results:", colors.green);
    const data = JSON.parse(result.content[0].text);
    
    if (data.found) {
      const person = data.person;
      log(`\n${colors.bright}Person Found:${colors.reset}`);
      log(`  Name: ${person.name}`);
      log(`  Title: ${person.title || "N/A"}`);
      log(`  Email: ${person.email || "N/A"}`);
      log(`  Personal Emails: ${person.personal_emails.join(", ") || "None"}`);
      log(`  Phone Numbers: ${person.phone_numbers.join(", ") || "None"}`);
      log(`  LinkedIn: ${person.linkedin_url || "N/A"}`);
      log(`  Credits Used: ${data.credits_used}`);
    } else {
      log("No matching person found.", colors.yellow);
    }
  } catch (error) {
    log(`❌ People match failed: ${error}`, colors.red);
  }
}

async function testEmailWorkflow(client: Client) {
  log("\n📧 Testing Email Retrieval Workflow (Search + Match)", colors.cyan);
  log("This demonstrates how to find someone's email in two steps.", colors.yellow);
  
  // Step 1: Search for person
  const name = await prompt("\nEnter person's name to search for: ");
  const company = await prompt("Enter their company (optional): ");
  
  try {
    log("\n⏳ Step 1: Searching for person...", colors.yellow);
    
    const searchParams: any = { name, per_page: 5 };
    if (company) searchParams.company = company;
    
    const searchResult = await client.callTool("people_search", searchParams);
    const searchData = JSON.parse(searchResult.content[0].text);
    
    if (!searchData.results || searchData.results.length === 0) {
      log("No people found with that search criteria.", colors.yellow);
      return;
    }
    
    log(`\n✅ Found ${searchData.results.length} people:", colors.green);
    searchData.results.forEach((person: any, index: number) => {
      log(`\n${index + 1}. ${person.name}`);
      log(`   Title: ${person.title || "N/A"}`);
      log(`   Company: ${person.company || "N/A"}`);
      log(`   Location: ${person.location || "N/A"}`);
    });
    
    const selection = await prompt("\nSelect person number to get email (1-" + searchData.results.length + "): ");
    const selectedIndex = parseInt(selection) - 1;
    
    if (selectedIndex < 0 || selectedIndex >= searchData.results.length) {
      log("Invalid selection.", colors.red);
      return;
    }
    
    const selectedPerson = searchData.results[selectedIndex];
    
    // Step 2: Match to get email
    log("\n⏳ Step 2: Getting email address (consumes credits)...", colors.yellow);
    
    const matchParams: any = {
      name: selectedPerson.name,
      reveal_personal_emails: true,
      reveal_phone_number: true,
    };
    
    if (selectedPerson.company) matchParams.organization_name = selectedPerson.company;
    if (selectedPerson.company_domain) matchParams.domain = selectedPerson.company_domain;
    if (selectedPerson.linkedin_url) matchParams.linkedin_url = selectedPerson.linkedin_url;
    
    const matchResult = await client.callTool("people_match", matchParams);
    const matchData = JSON.parse(matchResult.content[0].text);
    
    if (matchData.found) {
      const person = matchData.person;
      log(`\n✅ ${colors.bright}Email Retrieved Successfully:${colors.reset}`);
      log(`  Primary Email: ${person.email || "Not found"}`);
      if (person.personal_emails && person.personal_emails.length > 0) {
        log(`  Personal Emails: ${person.personal_emails.join(", ")}`);
      }
      if (person.phone_numbers && person.phone_numbers.length > 0) {
        log(`  Phone Numbers: ${person.phone_numbers.join(", ")}`);
      }
      log(`  Credits Used: ${matchData.credits_used}`);
    } else {
      log("Could not retrieve email for this person.", colors.yellow);
    }
    
  } catch (error) {
    log(`❌ Email workflow failed: ${error}`, colors.red);
  }
}

// Run the test client
testMCPServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});