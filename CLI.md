# CLI

Command-line interface for the same worklog and issue flows as the MCP server. Useful for smoke-testing credentials and scripting without an MCP client.

Credentials and fake mode come from `.env` — see the [main README](README.md) for setup and API token steps.

## Run

```bash
npm run cli -- [options]
npm run cli -- create-issue [options]
```

Requires dependencies installed (`npm install` or `npm run setup`) and a configured `.env`.

## Log a worklog

Default command — logs time to an existing issue:

```bash
npm run cli -- --type company --issueId PROJ-123 --message "Test worklog" --timeSpent "1m"
```

| Option | Description |
|--------|-------------|
| `--type` | `company` or `client` |
| `--issueId` | Jira issue key (for example `PROJ-123`) |
| `--message` | Worklog comment |
| `--timeSpent` | Duration in Jira format (for example `2h 30m`, `1m`) |
| `--date` | Optional worklog date |

## Create an issue

```bash
npm run cli -- create-issue --type company --projectKey PROJ --summary "Fix login redirect" --issueType Task --description "Users land on the wrong page after login"
```

Assign the new issue to yourself:

```bash
npm run cli -- create-issue --type company --projectKey PROJ --summary "Fix login redirect" --issueType Task --assignToMe
```

| Option | Description |
|--------|-------------|
| `--type` | `company` or `client` |
| `--projectKey` | Jira project key (for example `PROJ`) |
| `--summary` | Issue title |
| `--issueType` | Issue type name (for example `Task`, `Bug`, `Story`) |
| `--description` | Optional description |
| `--labels` | Optional labels (space-separated) |
| `--priority` | Optional priority name (for example `High`) |
| `--assignToMe` | Assign to the authenticated Jira user |

## Fake Jira

Set `USE_FAKE_JIRA=true` in `.env` to exercise the CLI without calling real Jira.
