# Jira Worklog MCP Server

Log time to company or client Jira issues from an MCP client (Cursor, Claude Desktop, etc.).

This started as a Node/TypeScript practice project. The HTTP API and CLI are supporting interfaces — the main product is the **MCP server**.

## Tech Stack

- **Node.js** (≥ 18) with **TypeScript**
- **Model Context Protocol SDK** — MCP server over stdio
- **Axios** — Jira REST API v3 client
- **Zod** — input validation
- **yargs** — CLI (optional smoke-testing)
- **Express** — optional HTTP API
- **dotenv** — environment configuration

## MCP Setup

Requirements: Node.js 18+.

### 1. Install and build

From the project root:

```bash
npm run setup
```

This checks your Node version, installs dependencies, compiles TypeScript to `dist/`, creates `.env` from `.env.example` if needed, and prints an MCP client config block.

### 2. Configure Jira credentials

Edit `.env` with your Atlassian account email and an API token (not your Jira password).

#### Generate an Atlassian API token

1. Sign in to your Atlassian account at [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Select **Create API token** (unscoped).
   - Prefer this over **Create API token with scopes** for this project — scoped tokens must use Atlassian’s gateway URL (`api.atlassian.com/...`), which this app does not use yet.
3. Enter a label you’ll recognize later (for example `jira-worklog-mcp`).
4. Choose an expiration (1–365 days; default is typically one year).
5. Select **Create**, then **Copy** the token immediately — Atlassian will not show it again.
6. Paste it into `.env` as `COMPANY_JIRA_API_TOKEN` and/or `CLIENT_JIRA_API_TOKEN`.
7. Set the matching `*_JIRA_EMAIL` to the same Atlassian account email you used to create the token, and `*_JIRA_BASE_URL` to your site (for example `https://your-domain.atlassian.net`).

If you use company and client Jira under different Atlassian accounts, create a separate token while signed into each account.

Official docs: [Manage API tokens for your Atlassian account](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

For local testing without writing to real Jira, set `USE_FAKE_JIRA=true` in `.env`. MCP, CLI, and the HTTP API will use `FakeJiraService` instead.

You only need real credentials for the instance(s) you use when fake mode is off. Config is loaded lazily — missing the unused instance will not block MCP/CLI for the one you configure. Values left as `.env.example` placeholders (for example `your-client-api-token-here`) are treated as empty.

```env
# Company Jira
COMPANY_JIRA_BASE_URL=https://your-company-domain.atlassian.net
COMPANY_JIRA_EMAIL=your-company-email@example.com
COMPANY_JIRA_API_TOKEN=your-company-api-token-here

# Client Jira (optional if you only use company)
CLIENT_JIRA_BASE_URL=https://your-client-domain.atlassian.net
CLIENT_JIRA_EMAIL=your-client-email@example.com
CLIENT_JIRA_API_TOKEN=your-client-api-token-here
```

### 3. Register the MCP server

Add the block printed by `npm run setup` to your MCP client config (for example Cursor MCP settings or Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "jira-worklog": {
      "command": "node",
      "args": ["/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
    }
  }
}
```

Use the absolute path to this repo’s built MCP entry. Restart the MCP client, then call the `create_worklog` tool with `type` (`company` or `client`), `issueId`, `message`, `timeSpent`, and optional `date`.

**Optional check via CLI** (same core logic as MCP):

```bash
npm run cli -- --type company --issueId PROJ-123 --message "Test worklog" --timeSpent "1m"
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | First-time install, build, `.env` scaffold, print MCP config |
| `npm run mcp` | Run MCP server (stdio) via `ts-node` |
| `npm run cli` | Log a worklog from the command line |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run dev` | Optional Express API with auto-reload |
| `npm start` | Run compiled Express API |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COMPANY_JIRA_BASE_URL` | Company Jira base URL | When using `type: company` |
| `COMPANY_JIRA_EMAIL` | Company Atlassian account email | When using `type: company` |
| `COMPANY_JIRA_API_TOKEN` | Company Jira API token | When using `type: company` |
| `CLIENT_JIRA_BASE_URL` | Client Jira base URL | When using `type: client` |
| `CLIENT_JIRA_EMAIL` | Client Atlassian account email | When using `type: client` |
| `CLIENT_JIRA_API_TOKEN` | Client Jira API token | When using `type: client` |
| `PORT` | Express server port | Optional (default `3000`) |
| `USE_FAKE_JIRA` | Use `FakeJiraService` instead of real Jira | Optional (`true` / `false`) |

Base URLs must be `http://` or `https://`. Emails must be valid Atlassian account emails. Invalid or missing values for the instance you request produce a clear error when that instance is first used.

## Optional: HTTP API

For local practice or integrations outside MCP:

```bash
npm run dev
```

- `GET /health` — health check
- `POST /worklog` — same payload as the MCP tool (`type`, `issueId`, `message`, `timeSpent`, optional `date`)

The Express server logs both company and client base URLs on startup, so both instance configs should be present when using the API.
