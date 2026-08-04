# Anthropic (Claude Code and Claude Desktop)

Claude Code and Claude Desktop are **separate products** with **separate config files**. Configure each one you use.

Both use a top-level `mcpServers` object (same shape as Cursor), pointing at this repo’s built stdio server.

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.

---

## Claude Code

### Config locations

| Scope | macOS | Windows |
|-------|-------|---------|
| Project (team-shareable) | `.mcp.json` at repo root | `.mcp.json` at repo root |
| User / local | `~/.claude.json` | `%USERPROFILE%\.claude.json` |

Or manage via the `claude mcp` CLI (preferred).

### Terminal (preferred)

#### macOS / Linux (bash/zsh)

```bash
claude mcp add jira-worklog -- node /Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js
claude mcp list
```

If you already configured Claude Desktop on macOS or WSL, you can import:

```bash
claude mcp add-from-claude-desktop
```

#### Windows (PowerShell)

```powershell
claude mcp add jira-worklog -- node C:\Users\YOUR_USER\path\to\jira_work_logs\dist\interfaces\mcp\server.js
claude mcp list
```

### Project file example (`.mcp.json`)

#### macOS

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

#### Windows

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

Use doubled backslashes (`\\`) in JSON, or forward slashes (`C:/Users/...`).

### Verify (Claude Code)

| Check | Expected |
|-------|----------|
| `claude mcp list` | `jira-worklog` present |
| In a Claude Code session, tools available | `create_worklog`, `create_issue` |

---

## Claude Desktop

Claude Desktop does **not** use Claude Code’s `.mcp.json` or `claude mcp` CLI.

### Config location

#### macOS

`~/Library/Application Support/Claude/claude_desktop_config.json`

#### Windows

`%APPDATA%\Claude\claude_desktop_config.json`

On some Windows MSIX installs, the app may read a virtualized copy under `%LOCALAPPDATA%\Packages\Claude_...\LocalCache\Roaming\Claude\`. If **Edit Config** does not seem to take effect, check that path as well.

### UI

#### macOS

1. Open Claude Desktop → **Settings**.
2. Open the **Developer** tab.
3. Click **Edit Config** (creates the file if missing).
4. Merge the `mcpServers` block below, save, then **fully quit** Claude Desktop (`Cmd+Q`) and reopen.

#### Windows

1. Open Claude Desktop → **Settings**.
2. Open the **Developer** tab.
3. Click **Edit Config** (creates the file if missing).
4. Merge the `mcpServers` block below, save, then **fully quit** Claude Desktop from the system tray / Exit and reopen.

### Config example

#### macOS

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

#### Windows

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

`npm run setup` prints a block in this shape (with the absolute path for the machine where you ran it).

### Verify (Claude Desktop)

| Check | Expected |
|-------|----------|
| Settings → Developer | Server listed without errors |
| Chat can use tools | `create_worklog`, `create_issue` |

---

## Notes

- Prefer absolute paths to `dist/interfaces/mcp/server.js` so the client finds the server regardless of cwd.
- Run clients with access to this project’s `.env`, or set credentials in the environment before launching. For local smoke tests, set `USE_FAKE_JIRA=true` in `.env`.
- This guide can be split into two files later if it grows.

## Official docs

- [Connect local MCP servers (Claude Desktop)](https://modelcontextprotocol.io/docs/develop/connect-local-servers)
- Claude Code: `claude mcp --help` and Anthropic’s Claude Code MCP documentation
