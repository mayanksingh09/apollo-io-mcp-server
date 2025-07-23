#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { ApolloClient } from "./apollo-client.js";
import { logger } from "./utils/logger.js";
import {
  peopleSearchTool,
  peopleSearchDefinition,
  peopleSearchSchema,
  organizationSearchTool,
  organizationSearchDefinition,
  organizationSearchSchema,
  peopleEnrichmentTool,
  peopleEnrichmentDefinition,
  organizationEnrichmentTool,
  organizationEnrichmentDefinition,
  jobPostingsTool,
  jobPostingsDefinition,
} from "./tools/index.js";

class ApolloMCPServer {
  private server: Server;
  private apolloClient: ApolloClient;

  constructor() {
    this.server = new Server(
      {
        name: "apollo-io-mcp-server",
        vendor: "apollo-io",
        version: "1.0.0",
        description: "MCP server for Apollo.io integration - search people, organizations, and gather sales intelligence",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Apollo client - will use API key from environment
    this.apolloClient = new ApolloClient();

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          peopleSearchDefinition,
          organizationSearchDefinition,
          peopleEnrichmentDefinition,
          organizationEnrichmentDefinition,
          jobPostingsDefinition,
        ],
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        logger.info(`Executing tool: ${name}`, args);

        switch (name) {
          case "people_search": {
            const params = peopleSearchSchema.parse(args);
            const result = await peopleSearchTool(params, this.apolloClient);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "organization_search": {
            const params = organizationSearchSchema.parse(args);
            const result = await organizationSearchTool(params, this.apolloClient);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "people_enrichment": {
            const params = peopleEnrichmentDefinition.inputSchema.parse(args);
            const result = await peopleEnrichmentTool(params, this.apolloClient);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "organization_enrichment": {
            const params = organizationEnrichmentDefinition.inputSchema.parse(args);
            const result = await organizationEnrichmentTool(params, this.apolloClient);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          case "job_postings": {
            const params = jobPostingsDefinition.inputSchema.parse(args);
            const result = await jobPostingsTool(params, this.apolloClient);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        
        if (error instanceof z.ZodError) {
          return {
            content: [
              {
                type: "text",
                text: `Validation error: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private setupErrorHandling(): void {
    process.on("SIGINT", async () => {
      logger.info("Shutting down Apollo MCP server...");
      await this.server.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Shutting down Apollo MCP server...");
      await this.server.close();
      process.exit(0);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled Rejection at:", { promise, reason });
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  }

  async start(): Promise<void> {
    logger.info("Starting Apollo MCP server...");
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    logger.info("Apollo MCP server is running");
  }
}

// Start the server
const server = new ApolloMCPServer();
server.start().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});