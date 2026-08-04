# Codex

Connect this repo’s MCP server to [OpenAI Codex](https://developers.openai.com/codex/mcp) (CLI, IDE extension, and ChatGPT desktop share the same config).

Codex uses **TOML**, not JSON.

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.
3. Codex CLI installed (`codex` on your `PATH`).

## Config file

| Scope | Path |
|-------|------|
| Global | `~/.codex/config.toml` |
| Project | `.codex/config.toml` (trusted projects only) |

Section name must be `mcp_servers` (underscore).

```toml
[mcp_servers.jira-worklog]
command = "node"
args = ["/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
```

Optional:

```toml
[mcp_servers.jira-worklog]
command = "node"
args = ["/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"]
cwd = "/absolute/path/to/jira_work_logs"
enabled = true
```

Setting `cwd` to the repo root helps `dotenv` load `.env`.

## Terminal (preferred)

```bash
codex mcp add jira-worklog -- node /absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js
codex mcp list
codex mcp get jira-worklog
```

To remove:

```bash
codex mcp remove jira-worklog
```

You can still edit `~/.codex/config.toml` by hand for `cwd`, timeouts, or tool filters.

## UI

ChatGPT desktop and the Codex IDE extension read the same `config.toml`. After adding the server via CLI or file, restart or reload the Codex client if tools do not appear.

## Verify

| Check | Expected |
|-------|----------|
| `codex mcp list` | `jira-worklog` listed |
| `codex mcp get jira-worklog` | `command` / `args` point at this repo’s `dist/.../server.js` |
| Agent tool use | `create_worklog`, `create_issue` |

Use `USE_FAKE_JIRA=true` for a safe smoke test.

## Official docs

- [Model Context Protocol (Codex)](https://developers.openai.com/codex/mcp)
