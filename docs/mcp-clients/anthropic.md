# Anthropic (Claude Code and Claude Desktop)

Separate products with **separate global** configs. Configure each one you use.

## Prerequisites

1. `npm run setup`
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`

## Configure (global)

```bash
npm run configure-clients -- --claude-code
npm run configure-clients -- --claude-desktop
```

---

## Claude Code

| OS | Global path |
|----|-------------|
| macOS | `~/.claude.json` |
| Windows | `%USERPROFILE%\.claude.json` |

**macOS**

```bash
claude mcp add jira-worklog -- node /Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js
claude mcp list
```

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

**Windows (PowerShell)**

```powershell
claude mcp add jira-worklog -- node C:\Users\YOUR_USER\path\to\jira_work_logs\dist\interfaces\mcp\server.js
claude mcp list
```

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

**Verify:** `claude mcp list` → tools `create_worklog`, `create_issue`.

---

## Claude Desktop

Always global (no project scope).

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

On some Windows MSIX installs, also check `%LOCALAPPDATA%\Packages\Claude_...\LocalCache\Roaming\Claude\`.

**UI:** Settings → **Developer** → **Edit Config** → save → fully quit and reopen.

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

## Official docs

- [Connect local MCP servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- Claude Code: `claude mcp --help`
