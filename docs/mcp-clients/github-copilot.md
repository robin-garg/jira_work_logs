# GitHub Copilot (VS Code and CLI)

VS Code Copilot and Copilot CLI use **different** config files. Configure each product you use. Both should be **global**.

## Prerequisites

1. `npm run setup`
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`

## Configure (global)

```bash
npm run configure-clients -- --vscode
npm run configure-clients -- --copilot-cli
```

---

## VS Code (Copilot Agent)

Uses top-level key `servers` (not `mcpServers`).

| OS | Global (user) path |
|----|--------------------|
| macOS | `~/Library/Application Support/Code/User/mcp.json` |
| Windows | `%APPDATA%\Code\User\mcp.json` |

Open via Command Palette → **MCP: Open User Configuration**.

**macOS**

```json
{
  "servers": {
    "jira-worklog": {
      "type": "stdio",
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
  "servers": {
    "jira-worklog": {
      "type": "stdio",
      "command": "node",
      "args": ["C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"],
      "envFile": "C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\.env"
    }
  }
}
```

**Verify:** Command Palette → **MCP: List Servers**; Copilot Chat in **Agent** mode.

Docs: [VS Code MCP](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)

---

## Copilot CLI

Does **not** read VS Code’s `mcp.json`.

| OS | Global path |
|----|-------------|
| macOS / Windows | `~/.copilot/mcp-config.json` |

```bash
npm run configure-clients -- --copilot-cli
# or:
copilot mcp add jira-worklog -- node /absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js
copilot mcp list
copilot mcp get jira-worklog
```

**macOS** (`~/.copilot/mcp-config.json`)

```json
{
  "mcpServers": {
    "jira-worklog": {
      "type": "local",
      "command": "node",
      "args": ["/Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js"],
      "tools": ["*"]
    }
  }
}
```

**Windows**

```json
{
  "mcpServers": {
    "jira-worklog": {
      "type": "local",
      "command": "node",
      "args": ["C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"],
      "tools": ["*"]
    }
  }
}
```

Docs: [Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers)
