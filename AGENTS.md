# Agent instructions

Guidance for AI agents working in this repo.

## Backlog (`BACKLOG.md`)

This project keeps a durable task list in `BACKLOG.md`. Use it for work that should survive across chats — not the in-session todo list.

### Sections

| Section | Meaning |
|---------|---------|
| **Backlog** | Ideas and future work not started yet |
| **In progress** | The task currently being worked on |
| **Done** | Completed work (keep brief; archive detail in git history if needed) |

### How to use it

1. **Adding work** — When the user asks to track something for later, append it under **Backlog** as an unchecked item (`- [ ]`) with a short title and a few bullets for context/goal.
2. **Starting work** — When the user asks to pick up backlog work (or names a specific item):
   - Read `BACKLOG.md`
   - Move the chosen item from **Backlog** to **In progress** (still unchecked until finished)
   - Prefer one item in **In progress** at a time unless the user says otherwise
3. **Finishing work** — When the item is done:
   - Mark it checked (`- [x]`)
   - Move it from **In progress** to **Done**
4. **Do not invent backlog items** — Only add tasks when the user asks, or when they clearly want a follow-up tracked for later.

### Example prompts the agent should recognize

- “Add X to the backlog”
- “Pick the next / highest priority item from BACKLOG.md”
- “Work on the scoped API token task from the backlog”
