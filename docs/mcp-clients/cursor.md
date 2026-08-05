# Cursor

Connect this repo’s MCP server to [Cursor](https://cursor.com) (IDE and Agent CLI). Both use the same **global** config.

## Prerequisites

1. `npm run setup` (so `dist/interfaces/mcp/server.js` exists)
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`

## Configure (global)

```bash
npm run configure-clients -- --cursor
# overwrite if needed:
npm run configure-clients -- --cursor --force
```

| OS | Global config path |
|----|--------------------|
| macOS | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

### Manual global config

**macOS**

```json
{
  "mcpServers": {
    "jira-worklog": {
      "command": "node",
      "args": ["/Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js"],
      "envFile": "/Users/YOUR_USER/path/to/jira_work_logs/.env"
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
      "args": ["C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"],
      "envFile": "C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\.env"
    }
  }
}
```

The MCP server also loads `.env` from the repo root automatically. Prefer forward slashes on Windows in JSON if you like (`C:/Users/...`).

## Verify

**UI**

| OS | Steps |
|----|--------|
| macOS | Settings (`Cmd+,`) → **Tools & MCP** → confirm `jira-worklog` |
| Windows | Settings (`Ctrl+,`) → **Tools & MCP** → confirm `jira-worklog` |

Reload the window or restart Cursor if it does not appear.

**Agent CLI** (same global config)

```bash
agent mcp list
agent mcp list-tools jira-worklog
```

Expect `create_worklog` and `create_issue`.

## Official docs

- [Cursor MCP](https://cursor.com/docs/mcp)
- [Cursor CLI MCP](https://cursor.com/docs/cli/mcp)
