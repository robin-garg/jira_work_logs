# Codex (CLI and ChatGPT desktop)

[Codex CLI](https://developers.openai.com/codex/mcp), the Codex IDE extension, and **ChatGPT desktop** (Codex) share one **global** config: `~/.codex/config.toml`. Configure once.

Codex uses **TOML**, not JSON.

## Prerequisites

1. `npm run setup`
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`
3. `codex` on your `PATH` (recommended for auto-configure)

## Configure (global)

```bash
npm run configure-clients -- --codex
```

| OS | Global path |
|----|-------------|
| macOS | `~/.codex/config.toml` |
| Windows | `%USERPROFILE%\.codex\config.toml` |

### Manual / CLI

**macOS**

```bash
codex mcp add jira-worklog -- node /Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js
codex mcp list
codex mcp get jira-worklog
```

```toml
[mcp_servers.jira-worklog]
command = "node"
args = ["/Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
enabled = true
```

**Windows (PowerShell)**

```powershell
codex mcp add jira-worklog -- node C:\Users\YOUR_USER\path\to\jira_work_logs\dist\interfaces\mcp\server.js
codex mcp list
```

```toml
[mcp_servers.jira-worklog]
command = "node"
args = ["C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"]
enabled = true
```

## Verify

| Check | Expected |
|-------|----------|
| `codex mcp list` | `jira-worklog` listed |
| ChatGPT desktop / Codex UI | Tools available after reload |
| Tool use | `create_worklog`, `create_issue` |

ChatGPT **on the web** does not use this local file.

## Official docs

- [Codex MCP](https://developers.openai.com/codex/mcp)
