# Apollo.io MCP Server Examples

## Setting Up

1. First, ensure you have your Apollo.io API key in the `.env` file:
```bash
APOLLO_API_KEY=your_actual_api_key_here
```

2. Build and start the server:
```bash
npm run build
npm start
```

## Example Use Cases

### 1. Finding Sales Prospects

**Task**: Find senior sales executives at SaaS companies in San Francisco

**Using with AI Assistant**:
```
Using the Apollo.io tools, find senior sales people (VP level or above) at SaaS companies in San Francisco with 50-500 employees.
```

**Direct tool usage**:
```json
{
  "tool": "people_search",
  "parameters": {
    "location": "San Francisco",
    "person_seniorities": ["vp", "cxo", "owner"],
    "person_functions": ["sales"],
    "q_keywords": "SaaS",
    "per_page": 50
  }
}
```

### 2. Enriching Contact Information

**Task**: Get detailed information about a specific contact

**Using with AI Assistant**:
```
Get the full details for john.smith@techcompany.com including their phone number, LinkedIn, and current role.
```

**Direct tool usage**:
```json
{
  "tool": "people_enrichment",
  "parameters": {
    "email": "john.smith@techcompany.com"
  }
}
```

### 3. Building Target Account Lists

**Task**: Find growing tech companies for outreach

**Using with AI Assistant**:
```
Find technology companies in the US with 100-1000 employees that have raised funding in the last 2 years and use AWS.
```

**Direct tool usage**:
```json
{
  "tool": "organization_search",
  "parameters": {
    "locations": ["United States"],
    "industries": ["technology", "software"],
    "employee_count_min": 100,
    "employee_count_max": 1000,
    "technologies": ["AWS"],
    "funding_raised_min": 1000000,
    "per_page": 100
  }
}
```

### 4. Company Research

**Task**: Get comprehensive information about a target company

**Using with AI Assistant**:
```
Get detailed information about the company with domain example.com, including their size, revenue, technologies, and social media presence.
```

**Direct tool usage**:
```json
{
  "tool": "organization_enrichment",
  "parameters": {
    "domain": "example.com"
  }
}
```

### 5. Finding Hiring Companies

**Task**: Identify companies actively hiring for specific roles

**Process**:
1. First, search for target companies
2. Then get their job postings

**Using with AI Assistant**:
```
Find SaaS companies in California with 200+ employees, then show me their current sales job openings.
```

### 6. Multi-Step Prospecting Workflow

**Task**: Build a complete prospect list with enriched data

**Using with AI Assistant**:
```
1. Search for Directors of Engineering at AI/ML companies in New York or Boston
2. Filter for companies with 50-200 employees  
3. Enrich the top 10 contacts with their email and phone information
4. Also get detailed company information for each prospect's organization
```

### 7. Competitive Intelligence

**Task**: Research competitors in a specific market

**Using with AI Assistant**:
```
Find all cybersecurity companies in the United States with revenue between $10M-$100M that compete with CrowdStrike.
```

### 8. Event-Based Outreach

**Task**: Find companies with recent changes

**Using with AI Assistant**:
```
Search for companies in the fintech industry that:
- Have 100-500 employees
- Are based in major US tech hubs
- Have current job postings for VP of Sales or CRO positions (indicating growth or leadership changes)
```

## Tips for Effective Searches

1. **Start broad, then narrow**: Begin with broader searches and refine based on results
2. **Use multiple filters**: Combine location, industry, size, and technology filters for precision
3. **Leverage keywords**: Use relevant keywords in `q_keywords` for better matching
4. **Check pagination**: Remember the 50,000 record limit for searches
5. **Monitor credits**: Each API call consumes credits from your Apollo.io account

## Advanced Patterns

### Bulk Enrichment Workflow
```
1. Import a CSV of email addresses
2. For each email:
   - Use people_enrichment to get full contact details
   - Use organization_enrichment on their company domain
   - Compile results into a enriched dataset
```

### Account-Based Marketing (ABM)
```
1. Define ideal customer profile (ICP) criteria
2. Use organization_search with specific filters
3. For each target account:
   - Get all decision makers using people_search
   - Enrich contact information
   - Check for current job openings
   - Build personalized outreach strategy
```

### Sales Trigger Monitoring
```
1. Search for companies using specific technologies
2. Filter by recent funding or growth indicators
3. Identify key decision makers
4. Monitor job postings for expansion signals
```