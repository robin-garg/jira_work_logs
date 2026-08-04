# HTTP API (Node.js / Express)

Optional Express server that exposes the same worklog and issue flows over HTTP. This was the original Node.js practice surface; the primary product is now the [MCP server](README.md).

Credentials and fake mode come from `.env` — see the [main README](README.md) for setup and API token steps.

## Run

```bash
# Development (TypeScript with auto-reload)
npm run dev

# Production-style (compiled output)
npm run build
npm start
```

The server listens on `PORT` from `.env` (default `3000`).

On startup it logs both company and client base URLs, so both instance configs should be present when using the API (unless `USE_FAKE_JIRA=true`).

## Endpoints

### `GET /health`

Health check.

Example response:

```json
{
  "status": "OK",
  "timestamp": "2026-08-04T10:00:00.000Z",
  "uptime": 12.345
}
```

### `POST /worklog`

Same payload as the MCP `create_worklog` tool.

```json
{
  "type": "company",
  "issueId": "PROJ-123",
  "message": "Implemented login fix",
  "timeSpent": "1h 30m",
  "date": "2026-08-04"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | `company` or `client` |
| `issueId` | Yes | Jira issue key |
| `message` | Yes | Worklog comment |
| `timeSpent` | Yes | Duration in Jira format |
| `date` | No | Worklog date |

### `POST /issue`

Same payload as the MCP `create_issue` tool.

```json
{
  "type": "company",
  "projectKey": "PROJ",
  "summary": "Fix login redirect",
  "issueType": "Task",
  "description": "Users land on the wrong page after login",
  "labels": ["frontend"],
  "priority": "High",
  "assignToMe": true
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | `company` or `client` |
| `projectKey` | Yes | Jira project key |
| `summary` | Yes | Issue title |
| `issueType` | Yes | Issue type name |
| `description` | No | Description text |
| `labels` | No | Array of label strings |
| `priority` | No | Priority name |
| `assignToMe` | No | Assign to the authenticated user |

## Environment

Uses the same Jira variables as MCP, plus:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP listen port | `3000` |
| `USE_FAKE_JIRA` | Use `FakeJiraService` instead of real Jira | `false` |

## Related

- [CLI](CLI.md) — same flows from the terminal
- [Validation examples](VALIDATION_EXAMPLES.md) — config validation samples
