# Cursor

Connect this repo’s MCP server to [Cursor](https://cursor.com) (IDE and Cursor Agent CLI).

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.

## Config file

Cursor reads MCP from either:

| Scope | Path |
|-------|------|
| Project | `.cursor/mcp.json` (repo root; same on macOS and Windows) |
| Global (macOS) | `~/.cursor/mcp.json` |
| Global (Windows) | `%USERPROFILE%\.cursor\mcp.json` |

Both scopes are merged; project wins if the same server name appears in both.

### IDE vs Agent CLI (same config, separate enablement)

The Cursor **IDE** (Agent app) and **Agent CLI** share the same `mcp.json` entry for `jira-worklog`, but they do **not** share a running server or enablement state:

| Topic | Behavior |
|-------|----------|
| Config | One shared file (project and/or global `mcp.json`) |
| Enable / approve | **Per client** — enable in Settings → Tools & MCP **and** with `agent mcp enable jira-worklog` if you use both |
| Runtime | **Separate instances** — each connected client starts its own `node …/server.js` process over stdio |
| Cross-enable | Enabling in the CLI does **not** enable it in the IDE, and enabling in the IDE does **not** enable it in the CLI |
| **Calling tools** | **Use the IDE Agent.** Cursor Agent CLI can manage MCP (`list` / `list-tools` / `enable`) and show `ready`, but CLI Agent chats do **not** reliably expose those tools for the model to invoke yet |

If both are connected at the same time, two processes of the same MCP server are running. Changing `mcp.json` (for example switching between `${workspaceFolder}` and absolute paths) can require re-approval in each client.

**Practical recommendation:** configure once in `.cursor/mcp.json`, enable and use `jira-worklog` from the **Cursor application** Agent. Treat CLI `agent mcp …` as setup/diagnostics until Cursor ships full MCP tool calling in CLI Agent sessions.

### Project (recommended for this repo)

Create `.cursor/mcp.json` at the repo root. Path style depends on whether you use the **IDE**, the **Agent CLI**, or both:

| Client | `${workspaceFolder}` | Absolute paths |
|--------|----------------------|----------------|
| Cursor IDE | Resolved (works) | Works |
| Cursor Agent CLI (`agent`) | **Not** resolved — connection fails | Required |

Do not commit secrets; `.env` stays local. `.cursor/mcp.json` is typically local/untracked when it contains machine-specific absolute paths.

#### IDE only — `${workspaceFolder}`

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

#### Agent CLI (or IDE + CLI) — absolute paths

Use the absolute path to this repo’s `dist/.../server.js` and `.env`. `npm run setup` prints a ready-to-paste block.

##### macOS / Linux

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

##### Windows

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

Use doubled backslashes (`\\`) in JSON, or forward slashes (`C:/Users/...`).

If `agent mcp list` shows `Connection failed` / `Connection closed` while the IDE looks fine, switch the project config from `${workspaceFolder}` to absolute paths and run `agent mcp enable jira-worklog` again (config changes may require re-approval).

### Global

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

Config file: `~/.cursor/mcp.json`

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

Config file: `%USERPROFILE%\.cursor\mcp.json`  
Use doubled backslashes (`\\`) in JSON, or forward slashes (`C:/Users/...`).

When using a global entry without `envFile`, open this project in Cursor (or ensure `.env` can be loaded). Prefer the project config with `envFile` when possible.

`npm run setup` also prints an absolute-path block you can paste.

## UI

### macOS

1. Open **Cursor Settings** (`Cmd+,`).
2. Go to **Tools & MCP** (label may vary slightly by version).
3. Confirm `jira-worklog` appears and shows as connected.
4. Or use **+ Add Custom MCP** / open `mcp.json` from that screen and paste a snippet above.
5. If the server does not appear, reload the window (**Developer: Reload Window**, `Cmd+Shift+P`) or fully quit and reopen Cursor.

### Windows

1. Open **Cursor Settings** (`Ctrl+,`).
2. Go to **Tools & MCP** (label may vary slightly by version).
3. Confirm `jira-worklog` appears and shows as connected.
4. Or use **+ Add Custom MCP** / open `mcp.json` from that screen and paste a snippet above.
5. If the server does not appear, reload the window (**Developer: Reload Window**, `Ctrl+Shift+P`) or fully quit and reopen Cursor.

## Terminal (Cursor Agent CLI)

> **Limitation (current):** Cursor Agent CLI is **not ready** for using this MCP server from a CLI Agent chat. `agent mcp list` may show `jira-worklog: ready` and `list-tools` may list `create_worklog` / `create_issue`, but those tools are not available for the model to call in the CLI session. **Log worklogs from the Cursor IDE Agent** instead.

Cursor CLI reads the **same** `mcp.json` as the editor, but it does **not** expand `${workspaceFolder}`. Use the absolute-path project config above (or a global absolute-path entry) if you still want CLI-side status checks. There is no `mcp add` command — edit the file, then manage servers with:

### macOS / Linux (bash/zsh)

```bash
# From the project directory (so project mcp.json is discovered)
agent mcp list
agent mcp list-tools jira-worklog
agent mcp enable jira-worklog
```

### Windows (PowerShell or Command Prompt)

```powershell
# From the project directory
agent mcp list
agent mcp list-tools jira-worklog
agent mcp enable jira-worklog
```

Expect `jira-worklog: ready` and tools `create_worklog` and `create_issue` from these management commands. That does **not** mean a CLI Agent chat can invoke them.

Use the shell commands above (`agent mcp list`, `agent mcp list-tools`, `agent mcp enable` / `disable`). Slash commands such as `/mcp list` are not a reliable way to manage MCP in the Agent CLI — prefer `agent mcp …`.

## Verify

| Check | Expected |
|-------|----------|
| Settings → Tools & MCP | `jira-worklog` connected (IDE enablement is separate from CLI) |
| Ask **IDE** Agent to log a worklog (use `USE_FAKE_JIRA=true` to avoid real Jira) | Tool runs successfully — **this is the supported path** |
| `agent mcp list` | `jira-worklog: ready` (setup/diagnostics only; if Connection failed, use absolute paths — see above) |
| `agent mcp list-tools jira-worklog` | `create_worklog`, `create_issue` (listing only — CLI Agent cannot invoke them yet) |

## Official docs

- [Cursor MCP](https://cursor.com/docs/mcp)
- [Cursor CLI MCP](https://cursor.com/docs/cli/mcp)
