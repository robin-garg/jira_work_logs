# Cursor

Connect this repo’s MCP server to [Cursor](https://cursor.com) (IDE and Cursor Agent CLI).

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.

## Config file

Cursor reads MCP from either:

| Scope | Path |
|-------|------|
| Project | `.cursor/mcp.json` (repo root) |
| Global | `~/.cursor/mcp.json` |

Both are merged; project wins if the same server name appears in both.

### Project (recommended for this repo)

Create `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "jira-worklog": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/interfaces/mcp/server.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

`${workspaceFolder}` is resolved by Cursor. Do not commit secrets; `.env` stays local.

### Global

Replace the path with the absolute path to this clone:

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

When using a global entry without `envFile`, run Cursor with this project open (or ensure the process can load `.env` from the project directory). Prefer the project config with `envFile` when possible.

`npm run setup` also prints an absolute-path block you can paste.

## UI

1. Open **Cursor Settings** (`Cmd+,` on macOS).
2. Go to **Tools & MCP** (label may vary slightly by version).
3. Confirm `jira-worklog` appears and shows as connected.
4. Or use **+ Add Custom MCP** / open `mcp.json` from that screen and paste the snippet above.
5. If the server does not appear, reload the window (**Developer: Reload Window**) or fully restart Cursor.

## Terminal (Cursor Agent CLI)

Cursor CLI uses the **same** `mcp.json` as the editor. There is no `mcp add` command — edit the file, then manage servers with:

```bash
# From the project directory (so project mcp.json is discovered)
agent mcp list
agent mcp list-tools jira-worklog
agent mcp enable jira-worklog
```

Expect tools `create_worklog` and `create_issue`.

In an interactive agent session you can also use `/mcp list`.

## Verify

| Check | Expected |
|-------|----------|
| Settings → Tools & MCP | `jira-worklog` connected |
| `agent mcp list-tools jira-worklog` | `create_worklog`, `create_issue` |
| Ask Agent to log a worklog (use `USE_FAKE_JIRA=true` to avoid real Jira) | Tool runs successfully |

## Official docs

- [Cursor MCP](https://cursor.com/docs/mcp)
- [Cursor CLI MCP](https://cursor.com/docs/cli/mcp)
