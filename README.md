# Apollo.io MCP Server

An MCP (Model Context Protocol) server that enables AI assistants to interact with Apollo.io's API for people search, organization search, and data enrichment for sales outreach.

## Features

- **People Search**: Find contacts with advanced filters (title, company, location, seniority, etc.)
- **Organization Search**: Search companies by various criteria (industry, size, revenue, technologies)
- **People Enrichment**: Get detailed information about a person using email or LinkedIn URL
- **Organization Enrichment**: Get comprehensive company data using domain or company name
- **Job Postings**: Retrieve current job openings for any organization

## Prerequisites

- Node.js 18 or higher
- Apollo.io API key (get it from [Apollo.io settings](https://app.apollo.io/#/settings/integrations/api))
- MCP-compatible AI assistant (like Claude)

## Installation

### From npm (coming soon)
```bash
npm install -g apollo-io-mcp-server
```

### From source
```bash
git clone https://github.com/mayanksingh09/apollo-io-mcp-server.git
cd apollo-io-mcp-server
npm install
npm run build
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your Apollo.io API key:
```env
APOLLO_API_KEY=your_apollo_api_key_here
```

## Usage

### Starting the Server

```bash
# If installed globally
apollo-io-mcp-server

# If running from source
npm start

# For development
npm run dev
```

### Using with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "apollo": {
      "command": "apollo-io-mcp-server",
      "env": {
        "APOLLO_API_KEY": "your_apollo_api_key_here"
      }
    }
  }
}
```

If running from source:
```json
{
  "mcpServers": {
    "apollo": {
      "command": "node",
      "args": ["/path/to/apollo-io-mcp-server/dist/index.js"],
      "env": {
        "APOLLO_API_KEY": "your_apollo_api_key_here"
      }
    }
  }
}
```

## Available Tools

### 1. people_search

Search for people in Apollo's database.

**Parameters:**
- `q_keywords` (optional): Keywords to search for
- `name` (optional): Person's full name
- `email` (optional): Email address
- `title` (optional): Job title
- `company` (optional): Company name
- `location` (optional): Location (city, state, or country)
- `person_seniorities` (optional): Array of seniority levels (e.g., ["senior", "manager", "director"])
- `person_functions` (optional): Array of job functions (e.g., ["sales", "engineering", "marketing"])
- `page` (optional): Page number (default: 1, max: 500)
- `per_page` (optional): Results per page (default: 25, max: 100)

**Example:**
```
Find senior sales people at companies in San Francisco
```

### 2. organization_search

Search for companies in Apollo's database.

**Parameters:**
- `q_keywords` (optional): Keywords to search for
- `name` (optional): Company name
- `domains` (optional): Array of company domains
- `industries` (optional): Array of industries
- `employee_count_min` (optional): Minimum number of employees
- `employee_count_max` (optional): Maximum number of employees
- `revenue_min` (optional): Minimum revenue in USD
- `revenue_max` (optional): Maximum revenue in USD
- `technologies` (optional): Array of technologies used
- `page` (optional): Page number (default: 1, max: 500)
- `per_page` (optional): Results per page (default: 25, max: 100)

**Example:**
```
Find SaaS companies with 50-200 employees using React
```

### 3. people_enrichment

Get detailed information about a person.

**Parameters (at least one required):**
- `email` (optional): Email address
- `linkedin_url` (optional): LinkedIn profile URL
- `name` (optional): Full name (requires organization_name or domain)
- `organization_name` (optional): Company name
- `domain` (optional): Company domain

**Example:**
```
Get details for john.doe@example.com
```

### 4. organization_enrichment

Get comprehensive company information.

**Parameters (at least one required):**
- `domain` (optional): Company domain (e.g., "example.com")
- `name` (optional): Company name

**Example:**
```
Get information about the company with domain example.com
```

### 5. job_postings

Get current job openings for a specific company.

**Parameters:**
- `organization_id` (required): Apollo organization ID
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 25, max: 100)

**Example:**
```
Get job postings for organization ID 5f5e2b3d1c9d440001234567
```

## Examples

### Finding Sales Prospects

```
Find VPs of Sales at Series B SaaS companies in the Bay Area with 100-500 employees
```

### Enriching a Contact List

```
Get details for jane.smith@techcompany.com including her title, phone, and LinkedIn
```

### Company Research

```
Find all companies in the healthcare industry in New York with revenue over $10M
```

### Building Target Account Lists

```
Search for fintech companies that use AWS and have raised over $5M in funding
```

## Rate Limits and Credits

- Apollo.io uses a credit-based system
- Different API calls consume different amounts of credits
- The server handles rate limiting automatically
- Monitor your credit usage in the [Apollo.io dashboard](https://app.apollo.io/#/settings/credits)

## Error Handling

The server includes comprehensive error handling for:
- Invalid API credentials
- Rate limit exceeded
- Network errors
- Invalid parameters
- Resource not found

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Troubleshooting

### "Authentication failed" error
- Verify your API key is correct
- Check that your Apollo.io account has API access
- Ensure the API key has proper permissions

### "Rate limit exceeded" error
- Wait for the rate limit to reset (check retry-after header)
- Upgrade your Apollo.io plan for higher limits
- Implement caching for frequently accessed data

### No results returned
- Check your search filters aren't too restrictive
- Verify the data exists in Apollo.io
- Try broader search criteria

## Security

- API keys are stored securely in environment variables
- Never commit `.env` files to version control
- Use environment-specific configurations for production
- Regularly rotate your API keys

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Create an issue on [GitHub](https://github.com/mayanksingh09/apollo-io-mcp-server/issues)
- Check Apollo.io API documentation at [docs.apollo.io](https://docs.apollo.io)
- MCP documentation at [modelcontextprotocol.io](https://modelcontextprotocol.io)

## Acknowledgments

- Built on the [Model Context Protocol SDK](https://github.com/anthropics/model-context-protocol)
- Powered by [Apollo.io API](https://www.apollo.io)