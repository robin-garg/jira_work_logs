# Jira Worklog MCP Server

Log time and create issues on company or client Jira from an MCP client (Cursor, Claude Desktop, and others).

## Requirements

- Node.js 18 or newer
- An Atlassian account with access to the Jira site(s) you will use
- An MCP client that can run a local stdio server

## Quick start (after cloning)

From the project root:

```bash
npm run setup
```

This will:

1. Check your Node.js version
2. Install dependencies
3. Compile TypeScript to `dist/`
4. Create `.env` from `.env.example` if it does not already exist
5. Print a ready-to-paste MCP client config block

## Configure Jira credentials

Edit `.env` with your Atlassian account email and an API token (not your Jira password).

### Generate an Atlassian API token

1. Sign in at [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Select **Create API token** (unscoped).
   - Prefer this over **Create API token with scopes** — scoped tokens must use Atlassian’s gateway URL (`api.atlassian.com/...`), which this app does not use yet.
3. Enter a label you will recognize later (for example `jira-worklog-mcp`).
4. Choose an expiration (1–365 days; default is typically one year).
5. Select **Create**, then **Copy** the token immediately — Atlassian will not show it again.
6. Paste it into `.env` as `COMPANY_JIRA_API_TOKEN` and/or `CLIENT_JIRA_API_TOKEN`.
7. Set the matching `*_JIRA_EMAIL` to the same Atlassian account email you used to create the token, and `*_JIRA_BASE_URL` to your site (for example `https://your-domain.atlassian.net`).

If you use company and client Jira under different Atlassian accounts, create a separate token while signed into each account.

Official docs: [Manage API tokens for your Atlassian account](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/).

### Example `.env`

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

For local testing without writing to real Jira, set `USE_FAKE_JIRA=true`. You only need real credentials for the instance(s) you use when fake mode is off. Values left as `.env.example` placeholders are treated as empty.

## Connect your AI client

After `npm run setup` and configuring `.env`, register the MCP server in your AI tool. Each guide covers config file format, UI steps (if any), and terminal/CLI commands (if any):

| Client | Guide |
|--------|-------|
| Cursor | [docs/mcp-clients/cursor.md](docs/mcp-clients/cursor.md) |
| GitHub Copilot (VS Code) | [docs/mcp-clients/github-copilot.md](docs/mcp-clients/github-copilot.md) |
| Codex | [docs/mcp-clients/codex.md](docs/mcp-clients/codex.md) |
| Claude Code / Claude Desktop | [docs/mcp-clients/anthropic.md](docs/mcp-clients/anthropic.md) |
| Hermes Agent | [docs/mcp-clients/hermes.md](docs/mcp-clients/hermes.md) |

Generic stdio shape (many clients use `mcpServers`; VS Code Copilot uses `servers` instead — see its guide). Use an absolute path for your OS:

**macOS**

```json
{
  "mcpServers": {
    "jira-worklog": {
      "command": "node",
      "args": ["/Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
    }
  }
}
```

**Windows**

```json
{
  "mcpServers": {
    "jira-worklog": {
      "command": "node",
      "args": ["C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"]
    }
  }
}
```

`npm run setup` prints an absolute-path block for the built entry under `dist/interfaces/mcp/server.js` on the machine where you run it. Restart or reload the client after saving. Per-client paths and shortcuts for macOS and Windows are in each guide above.

## MCP tools

| Tool | Purpose | Main arguments |
|------|---------|----------------|
| `create_worklog` | Log time on an existing issue | `type` (`company` \| `client`), `issueId`, `message`, `timeSpent`, optional `date` |
| `create_issue` | Create a new issue | `type`, `projectKey`, `summary`, `issueType`, optional `description`, `labels`, `priority`, `assignToMe` |

## Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run setup` | First-time install, build, `.env` scaffold, print MCP config |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run mcp` | Run the MCP server over stdio via `ts-node` (dev) |

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `COMPANY_JIRA_BASE_URL` | Company Jira base URL | When using `type: company` |
| `COMPANY_JIRA_EMAIL` | Company Atlassian account email | When using `type: company` |
| `COMPANY_JIRA_API_TOKEN` | Company Jira API token | When using `type: company` |
| `CLIENT_JIRA_BASE_URL` | Client Jira base URL | When using `type: client` |
| `CLIENT_JIRA_EMAIL` | Client Atlassian account email | When using `type: client` |
| `CLIENT_JIRA_API_TOKEN` | Client Jira API token | When using `type: client` |
| `USE_FAKE_JIRA` | Use `FakeJiraService` instead of real Jira | Optional (`true` / `false`) |

Base URLs must be `http://` or `https://`. Emails must be valid Atlassian account emails.

## Other interfaces

The same core services also power optional interfaces that are not required for MCP use:

- [CLI](CLI.md) — command-line smoke testing and scripting
- [HTTP API (Node.js / Express)](HTTP_API.md) — local REST server for practice or non-MCP integrations
