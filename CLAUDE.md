# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that bridges Apollo.io's API with AI assistants. It provides tools for searching people/organizations and enriching sales data.

## Development Commands

```bash
npm run dev      # Start with hot reload (uses tsx watch)
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled server from dist/
npm run lint     # ESLint check on src/**/*.ts
npm run format   # Prettier format src/**/*.ts
npm run clean    # Remove dist/ directory
```

## Architecture

### Request Flow
1. MCP client → `src/index.ts` (Server entry point)
2. Tool handler parses request with Zod schema
3. `src/apollo-client.ts` makes authenticated API call
4. Response formatted and returned to MCP client

### Key Design Patterns

**Tool Registration Pattern**: Each tool in `src/tools/` exports:
- Schema definition (Zod)
- Tool function (async, takes params + client)
- Tool definition object (name, description, inputSchema)

**Error Handling Hierarchy**:
- Custom error classes in `src/utils/errors.ts`
- Apollo API errors mapped to specific types (RateLimitError, AuthenticationError)
- Zod validation errors handled separately in tool execution

**Configuration Loading**: Environment validation happens once at startup in `src/config/index.ts`

### Apollo.io API Integration

**Authentication**: API key sent via `X-Api-Key` header on all requests

**Rate Limiting**: 
- Server handles 429 responses with RateLimitError
- Retry-after header respected when available
- No built-in retry logic (leaves to consumer)

**Pagination**: 
- Search endpoints support max 100 results/page, 500 pages total
- Helper methods `searchPeoplePaginated` and `searchOrganizationsPaginated` for iterating

### Adding New Tools

1. Create `src/tools/your-tool.ts` with:
   ```typescript
   export const yourToolSchema = z.object({...});
   export async function yourToolTool(params, apolloClient) {...}
   export const yourToolDefinition = {...};
   ```

2. Add exports to `src/tools/index.ts`

3. Register in `src/index.ts`:
   - Add to tools array in `ListToolsRequestSchema` handler
   - Add case in `CallToolRequestSchema` switch statement

## Environment Setup

Required: `APOLLO_API_KEY` in `.env` file

Optional:
- `MCP_SERVER_PORT` (default: 8000)
- `LOG_LEVEL` (debug|info|warn|error, default: info)

## Testing Locally

1. Create `.env` with valid Apollo.io API key
2. Run `npm run build && npm start`
3. Server communicates via stdio (not HTTP)
4. Configure in Claude Desktop's config.json to test with AI

## Common Issues

**"Cannot find module" errors**: Run `npm run build` first - server runs from `dist/`

**Authentication errors**: Check API key has proper permissions in Apollo.io dashboard

**Empty responses**: Apollo.io returns null for enrichment when no data found (not an error)

## Apollo.io API Constraints

- Search limited to 50,000 total results (500 pages × 100/page)
- People search doesn't return email/phone (requires enrichment)
- Credit-based system - each API call consumes credits
- Free tier has no API access

## Finding Email Addresses - Two-Step Process

To retrieve email addresses for people found via search:

1. **First, use `people_search`** to find prospects based on criteria (name, company, title, etc.)
   - This returns basic info but NO email addresses
   - Note the person's details (name, company, LinkedIn URL, etc.)

2. **Then, use `people_match`** with identifying information to get emails
   - Pass details from search results (name, company, domain, LinkedIn URL)
   - Set `reveal_personal_emails: true` to include personal emails
   - Set `reveal_phone_number: true` if phone numbers needed
   - This endpoint consumes API credits

**Example workflow for LLMs:**
```
User: "Find the email for John Smith at Acme Corp"
1. Call people_search with name="John Smith" company="Acme Corp"
2. From results, extract: name, organization_name, domain, linkedin_url
3. Call people_match with those details + reveal_personal_emails=true
4. Return the email address from people_match response
```

**Important:** The `people_match` endpoint is more accurate with more identifying information. Always pass as many details as available from the search results.