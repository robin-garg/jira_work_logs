# Hermes Agent

Connect this repo’s MCP server to [Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp) using **global** YAML config.

## Prerequisites

1. `npm run setup`
2. Configure [Jira credentials](../../README.md#configure-jira-credentials) in `.env`
3. `hermes` on your `PATH`

## Configure (global)

```bash
npm run configure-clients -- --hermes
```

| OS | Global path |
|----|-------------|
| macOS | `~/.hermes/config.yaml` |
| Windows | `%USERPROFILE%\.hermes\config.yaml` |

Override with `$HERMES_HOME` / `%HERMES_HOME%` if set.

### Manual / CLI

**macOS**

```bash
hermes mcp add jira-worklog -- node /Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js
```

```yaml
mcp_servers:
  jira-worklog:
    command: "node"
    args:
      - "/Users/YOUR_USER/path/to/jira_work_logs/dist/interfaces/mcp/server.js"
    enabled: true
```

**Windows (PowerShell)**

```powershell
hermes mcp add jira-worklog -- node C:\Users\YOUR_USER\path\to\jira_work_logs\dist\interfaces\mcp\server.js
```

```yaml
mcp_servers:
  jira-worklog:
    command: "node"
    args:
      - "C:\\Users\\YOUR_USER\\path\\to\\jira_work_logs\\dist\\interfaces\\mcp\\server.js"
    enabled: true
```

After editing a running session: `/reload-mcp`

## Verify

| Check | Expected |
|-------|----------|
| Hermes MCP listing | `jira-worklog` present |
| Tools | `create_worklog`, `create_issue` |

## Official docs

- [Hermes MCP](https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp)
- [MCP config reference](https://hermes-agent.nousresearch.com/docs/reference/mcp-config-reference)
