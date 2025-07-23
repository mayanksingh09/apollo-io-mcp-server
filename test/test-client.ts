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
      log("5. Exit");

      const choice = await prompt("\nEnter your choice (1-5): ");

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

// Run the test client
testMCPServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});