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