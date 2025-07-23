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
- Interactive menu system with 8 options
- Tests MCP protocol communication
- Tests all tools: people_search, organization_search, people_enrichment, people_match
- Email retrieval workflow demonstration
- Shows formatted results with colors

Menu Options:
1. Test people_search
2. Test organization_search
3. Custom people search
4. Custom organization search
5. Test people_enrichment
6. Test people_match
7. Test email retrieval workflow (search + match)
8. Exit

### 2. Manual Test (Direct API)

Tests the Apollo.io API integration directly without MCP protocol:

```bash
# Test both people and organization search
npm run test:manual

# Test only people search
npm run test:manual people

# Test only organization search
npm run test:manual org

# Test people enrichment
npm run test:manual enrichment

# Test people match (uses credits!)
npm run test:manual match

# Test email workflow
npm run test:manual email

# Show help
npm run test:manual --help
```

Features:
- Direct API testing
- Pre-configured test cases
- Tests new enrichment and match endpoints
- Email workflow demonstration
- Useful for debugging API issues

### 3. Email Workflow Test

Dedicated test for the two-step email retrieval process:

```bash
# Interactive mode (default)
npm run test:email

# Demo mode with pre-configured scenarios
npm run test:email demo

# Show help
npm run test:email --help
```

Features:
- Demonstrates search → match workflow
- Interactive and demo modes
- Shows credit consumption
- Retrieves emails, phone numbers, and employment history
- Option to process multiple results at once

### 4. Build and Test

Combines building and testing in one command:

```bash
npm run test:build
```

### 5. Run All Tests

Run all test suites sequentially:

```bash
npm run test:all
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

### People Enrichment Tests
- Enrich by email address
- Enrich by name and company
- Enrich by LinkedIn URL

### People Match Tests (Uses Credits!)
- Match by name and company to get emails
- Retrieve personal emails and phone numbers
- Get employment history and full profile

### Email Workflow Tests
- Search for CTOs at startups
- Find emails for Marketing Directors
- Search engineers at specific companies
- Interactive search with custom criteria

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
- Note: People search doesn't return emails/phones (use people_match instead)

### People Match Errors
- Ensure you have API credits available (match endpoint consumes credits)
- Provide as much identifying information as possible
- Try using LinkedIn URL if available for better matching
- Check that reveal_personal_emails is set to true

### Connection Issues
- Ensure the server builds without errors
- Check that port 8000 is available
- Look for error messages in the console

## Understanding the Results

### People Search Results
- Basic info: name, title, company, location
- No email/phone in search results (use people_match to get emails)
- Pagination info shows total available results
- LinkedIn URL when available

### Organization Search Results
- Company details: name, domain, industry
- Size information: employee count or range
- Technologies used (if available)
- Location and description

### People Enrichment Results
- Returns enriched data based on provided identifiers
- May include email, phone, and social profiles
- Returns null if no match found

### People Match Results
- Full contact information including emails
- Personal emails (when reveal_personal_emails=true)
- Phone numbers (when reveal_phone_number=true)
- Employment history
- Shows credits consumed per match

## API Limits

Remember that Apollo.io has:
- Credit-based pricing (each call uses credits)
- People Match endpoint consumes credits per request
- Rate limiting (respect retry-after headers)
- Result limits (max 50,000 results per search)
- No API access on free tier

## Email Retrieval Best Practices

1. **Two-Step Process**:
   - First: Use `people_search` to find prospects
   - Second: Use `people_match` with found details to get emails

2. **Maximize Match Success**:
   - Include LinkedIn URL when available
   - Provide company domain along with company name
   - Use full name rather than partial names

3. **Credit Optimization**:
   - Search first to verify the person exists
   - Only match people you actually need emails for
   - Consider caching results to avoid duplicate matches

## Next Steps

After testing locally:
1. Configure the server in Claude Desktop
2. Test with actual AI assistant interactions
3. Monitor API credit usage
4. Consider implementing caching for frequent searches