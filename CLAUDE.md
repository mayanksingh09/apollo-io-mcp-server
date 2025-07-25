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

### Test Scripts

```bash
npm run test:client    # Interactive menu-driven MCP client test
npm run test:manual    # Direct API testing without MCP protocol
npm run test:email     # Test two-step email retrieval workflow
npm run test:build     # Build and run client test
npm run test:all       # Run all tests after building
```

## Common Issues

**"Cannot find module" errors**: Run `npm run build` first - server runs from `dist/`

**Authentication errors**: Check API key has proper permissions in Apollo.io dashboard

**Empty responses**: Apollo.io returns null for enrichment when no data found (not an error)

## Apollo.io API Constraints

- Search limited to 50,000 total results (500 pages × 100/page)
- People search doesn't return email/phone (requires enrichment)
- Credit-based system - each API call consumes credits
- Free tier has no API access
- Create Contact API does NOT apply deduplication - will create duplicates if similar contacts exist

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

## Creating New Contacts

The `create_contact` tool allows you to add new contacts to your Apollo.io account:

**Required fields:**
- `first_name`: Contact's first name
- `last_name`: Contact's last name

**Optional fields:**
- `title`: Job title
- `organization_name`: Company name
- `email`: Email address
- `website_url`: Company website
- `direct_phone`: Direct phone number
- `mobile_phone`: Mobile number
- `label_names`: Array of labels
- `visibility`: 'all' or 'only-me' (default: 'all')

**IMPORTANT:** Apollo does NOT apply deduplication when creating contacts via API. Even if a contact with identical details exists, a new duplicate contact will be created. To update existing contacts, use the Update Contact endpoint (not yet implemented in this MCP server).

## Contact Search vs People Search

The MCP server provides two different search tools:

1. **`people_search`** - Searches the entire Apollo.io database
   - Returns people from Apollo's global database
   - Does NOT return email addresses (requires enrichment/match)
   - Useful for finding new prospects

2. **`contact_search`** - Searches only YOUR team's saved contacts
   - Returns contacts you've already added to your Apollo account
   - Includes email addresses and phone numbers if available
   - Limited to 50,000 results (500 pages × 100/page)
   - Not available on free Apollo plans
   - Useful for finding existing contacts in your CRM

**Example workflow:**
```
# Find new prospects in Apollo's database
people_search(company="Acme Corp", title="CEO")

# Search your existing contacts
contact_search(company="Acme Corp", label_names=["qualified"])
```

## TypeScript Configuration

- Target: ES2022, Module: ESNext with Node resolution
- Strict mode enabled with all type checking options
- Source maps and declarations generated
- Output directory: `dist/`
- Node 18+ required

## Directory Structure

```
src/
├── index.ts          # Server entry point, tool registration
├── apollo-client.ts  # Apollo.io API client with all endpoints
├── config/          # Environment configuration
├── tools/           # Individual tool implementations
├── types/           # TypeScript type definitions
└── utils/           # Error classes and utilities
```

## Code Style

- ESLint with TypeScript plugin for linting
- Prettier for code formatting
- ES modules throughout (no CommonJS)
- Async/await for all asynchronous operations
- Zod schemas for runtime validation