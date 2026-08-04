# GitHub Copilot (VS Code)

Connect this repo’s MCP server to GitHub Copilot in [Visual Studio Code](https://code.visualstudio.com/).

VS Code uses a **different** top-level key than Cursor: `servers`, not `mcpServers`.

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.
3. VS Code with Copilot / Agent mode that supports MCP (see [GitHub docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp)).

## Config file

| Scope | Path |
|-------|------|
| Workspace | `.vscode/mcp.json` |
| User | Open via Command Palette: **MCP: Open User Configuration** |

### Workspace example

Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "jira-worklog": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/dist/interfaces/mcp/server.js"],
      "envFile": "${workspaceFolder}/.env"
    }
  }
}
```

### Absolute-path example

```json
{
  "servers": {
    "jira-worklog": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
    }
  }
}
```

## UI / Command Palette

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run **MCP: Add Server** and choose Workspace or User, **or** open **MCP: Open Workspace Folder Configuration** and paste the JSON above.
3. Use **MCP: List Servers** to see status.
4. In the `mcp.json` editor, use the inline **Start** control if shown.
5. In Copilot Chat, switch to **Agent** mode so MCP tools can be used.

There is no dedicated `mcp` CLI for Copilot; configuration is file + Command Palette.

## Verify

| Check | Expected |
|-------|----------|
| **MCP: List Servers** | `jira-worklog` running / available |
| Copilot Agent can call tools | `create_worklog`, `create_issue` |

Use `USE_FAKE_JIRA=true` for a safe smoke test.

## Official docs

- [Add and manage MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- [MCP configuration reference](https://code.visualstudio.com/docs/copilot/reference/mcp-configuration)
- [Extend Copilot Chat with MCP](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp-in-your-ide/extend-copilot-chat-with-mcp)
