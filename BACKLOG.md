# Backlog

Future work for this project. Pick an item when ready to implement, move it to **In progress**, then to **Done**.

## Backlog

- [ ] **Support scoped Atlassian API tokens**
  - Today we only work with unscoped tokens against the site base URL (`https://your-domain.atlassian.net`).
  - Scoped tokens require Atlassian’s gateway (`api.atlassian.com/...`), which this app does not use yet.
  - Goal: accept scoped tokens and call Jira via the gateway so users are not forced to create unscoped tokens.

- [ ] **Share email/token when company and client use the same Atlassian account** _(lower priority)_
  - Today `COMPANY_*` and `CLIENT_*` each require their own email and API token even if both sites use the same Atlassian account.
  - Goal: allow a shared email/token (or fallback defaults) when only the base URLs differ, so users do not duplicate credentials.

## In progress

_(none)_

## Done

_(none)_
