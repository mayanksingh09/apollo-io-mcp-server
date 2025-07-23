# Testing the Apollo.io MCP Server

This guide explains how to test the Apollo.io MCP server using the provided test scripts.

## Prerequisites

1. **API Key**: Ensure you have a valid Apollo.io API key in your `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your actual API key
   ```

2. **Build the server**: 
   ```bash
   npm run build
   ```

## Testing Options

### 1. MCP Client Test (Interactive)

The most comprehensive test that simulates how the server will be used by AI assistants:

```bash
npm run test:client
```

Features:
- Interactive menu system
- Tests MCP protocol communication
- Allows custom searches with user input
- Shows formatted results with colors
- Tests both people and organization search

### 2. Manual Test (Direct API)

Tests the Apollo.io API integration directly without MCP protocol:

```bash
# Test both people and organization search
npm run test:manual

# Test only people search
npm run test:manual people

# Test only organization search
npm run test:manual org

# Show help
npm run test:manual --help
```

Features:
- Direct API testing
- Pre-configured test cases
- Useful for debugging API issues
- Faster than MCP client test

### 3. Build and Test

Combines building and testing in one command:

```bash
npm run test:build
```

## Test Scenarios

### People Search Tests
- Senior engineers in tech hubs
- Sales leaders (VPs and Directors)
- Custom searches by name, title, company, location

### Organization Search Tests
- Mid-size SaaS companies (50-500 employees)
- Tech companies using specific technologies
- Custom searches by industry, size, revenue

## Troubleshooting

### "Cannot find module" Error
Make sure to build the project first:
```bash
npm run build
```

### "APOLLO_API_KEY not found" Error
Create a `.env` file with your API key:
```bash
echo "APOLLO_API_KEY=your_actual_key_here" > .env
```

### No Results Returned
- Check that your API key has proper permissions
- Verify you have remaining API credits
- Try broader search criteria
- Note: People search doesn't return emails/phones (requires enrichment)

### Connection Issues
- Ensure the server builds without errors
- Check that port 8000 is available
- Look for error messages in the console

## Understanding the Results

### People Search Results
- Basic info: name, title, company, location
- No email/phone in search results (requires enrichment)
- Pagination info shows total available results

### Organization Search Results
- Company details: name, domain, industry
- Size information: employee count or range
- Technologies used (if available)
- Location and description

## API Limits

Remember that Apollo.io has:
- Credit-based pricing (each call uses credits)
- Rate limiting (respect retry-after headers)
- Result limits (max 50,000 results per search)
- No API access on free tier

## Next Steps

After testing locally:
1. Configure the server in Claude Desktop
2. Test with actual AI assistant interactions
3. Monitor API credit usage
4. Consider implementing caching for frequent searches