# Hermes Agent

Connect this repo’s MCP server to [Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp).

Hermes stores MCP config in **YAML** under `mcp_servers`.

## Prerequisites

1. Complete [Quick start](../../README.md#quick-start-after-cloning) (`npm run setup`) so `dist/interfaces/mcp/server.js` exists.
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`.
3. Hermes installed (`hermes` on your `PATH`).

## Config file

| Scope | Path |
|-------|------|
| Global | `~/.hermes/config.yaml` (or `$HERMES_HOME/config.yaml`) |

```yaml
mcp_servers:
  jira-worklog:
    command: "node"
    args:
      - "/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"
```

Optional env / timeouts:

```yaml
mcp_servers:
  jira-worklog:
    command: "node"
    args:
      - "/absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js"
    env: {}
    enabled: true
    timeout: 120
    connect_timeout: 60
```

## Terminal (preferred)

```bash
hermes mcp add jira-worklog -- node /absolute/path/to/jira_work_logs/dist/interfaces/mcp/server.js
hermes mcp catalog
```

After editing config from a running session:

```text
/reload-mcp
```

Or restart Hermes.

Other useful commands: `hermes mcp configure <name>`, `hermes mcp` (interactive picker).

## UI / session

There is no separate Desktop MCP settings UI for Hermes. Use the CLI, edit `config.yaml`, then `/reload-mcp` in the session.

## Verify

| Check | Expected |
|-------|----------|
| Config / `hermes mcp` listing | `jira-worklog` present |
| Tools callable in a session | `create_worklog`, `create_issue` |

Use `USE_FAKE_JIRA=true` for a safe smoke test.

## Official docs

- [Hermes MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)
- [MCP config reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
