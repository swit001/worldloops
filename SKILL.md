---
name: worldloops
description: Executable world layer for OpenClaw that detects open loops, proposes governed transitions, and keeps agent execution safe with externalWrite:false.
version: "0.8.0"
homepage: https://github.com/swit001/worldloops
metadata: {"openclaw":{"requires":{"bins":["node","npm"]},"envVars":[{"name":"WORLDLOOPS_API_BASE_URL","required":false,"description":"Optional WorldLoops API base URL override. Defaults to https://api.worldloops.ai."},{"name":"WORLDLOOPS_API_KEY","required":false,"description":"Optional bearer token for hosted WorldLoops API."}],"emoji":"🌐","homepage":"https://github.com/swit001/worldloops","skillKey":"worldloops","tags":["openclaw","clawhub","agentic-ai","world-model","executable-world","open-loops","open-loop-management","workflow","human-in-the-loop","safe-by-default","auditable-runtime","stateful-loop-management"]}}
---

# WorldLoops for OpenClaw

Executable world layer for OpenClaw that detects open loops, proposes governed transitions, and keeps agent execution safe with `externalWrite: false`.

Most agents answer from a snapshot. WorldLoops manages open loops as state.

WorldLoops is signal-first and designed to inspect work signals without waiting for a user prompt. It surfaces governed open-loop proposals for human-in-the-loop review. Safe-by-default means proposal is not execution, approval is not external write, and `externalWrite: false` is the default posture.

Use this skill when the user wants to detect open loops from scattered work signals and convert them into governed proposal candidates for stateful open-loop management.

WorldLoops is not a chatbot, task bot, or uncontrolled automation trigger.

It is a governed world-model layer for interpreting work signals safely — with the Auditable Open-Loop Runtime milestone completed in v0.4.0.

## Safety boundary

WorldLoops does not send messages.
WorldLoops does not send emails.
WorldLoops does not create calendar events.
WorldLoops does not modify external systems.

`externalWrite` remains `false`.

## Runtime invocation

When the user asks you to run this skill, do the following:

1. Change into the skill directory: `{baseDir}`
2. Run the command with `--silent`
3. Use provided local payload files when available
4. If no payload files are provided, use the included fixture files
5. Return the JSON result directly
6. Do not modify external systems

Safe default command from the skill directory:

npm run --silent brief:reconcile -- \
  --gmail-event scripts/fixtures/openclaw-gmail-webhook.json \
  --calendar-event scripts/fixtures/openclaw-calendar-events.json \
  --gog-gmail scripts/fixtures/gog-gmail-messages.json \
  --gog-calendar scripts/fixtures/gog-calendar-events.json \
  --message-read scripts/fixtures/openclaw-message-read.json


## Notification Preferences

> **Runtime MVP — v0.2.7**

WorldLoops stores notification preferences locally at `.worldloops/notification_prefs.json`. Users control time, frequency, severity thresholds, and quiet hours.

Users configure the entrypoints. WorldLoops does not auto-install background scheduling.

```bash
npm run notifications:init     # create default prefs file
npm run notifications:show     # print current prefs as JSON
npm run notifications:set -- dailyBrief.time 09:00
npm run notifications:set -- proactiveDiscovery.minSeverity high
npm run notifications:set -- quietHours.enabled true
```

## Proactive Discovery

> **Runtime MVP — v0.2.7**

`discovery:run` reads notification preferences and surfaces only candidates that match the configured severity threshold. It applies duplicate suppression using `.worldloops/notification_state.json`.

```bash
npm run discovery:run -- --gmail-event scripts/fixtures/openclaw-gmail-webhook.json
```

High-severity candidates can be surfaced before the scheduled brief. Quiet hours suppress non-critical notifications. No external writes. Discovery proposes — it does not act.

## Scheduled Daily Brief

> **Runtime MVP — v0.2.7**

`brief:daily` reads notification preferences, respects quiet hours, and produces a daily brief output as JSON with `safety.externalWrite=false`.

```bash
npm run brief:daily -- \
  --gmail-event scripts/fixtures/openclaw-gmail-webhook.json \
  --calendar-event scripts/fixtures/openclaw-calendar-events.json
```

This release does not auto-install cron or launchd. Users may connect `brief:daily` to a scheduler manually if they choose.

A daily brief includes important open loops, uncertain threads, upcoming meetings, required decisions, and signals since the last brief. The brief is a proposal, not an execution. No external writes. User approval is required for any resulting action.

## Default API

By default, WorldLoops uses:

https://api.worldloops.ai

You do not need to set `WORLDLOOPS_API_BASE_URL` for the default demo flow.

To use a different backend, set:

WORLDLOOPS_API_BASE_URL=https://your-worldloops-api.example.com

Optional:

WORLDLOOPS_API_KEY=your_api_key

## Auditable Open-Loop Runtime

Runtime MVP — v0.4.0

WorldLoops now supports persistent local open-loop state, capability-scoped execution boundaries, severity-based adjudication, and stuck-loop timeout reconciliation.

Useful local commands:

    npm run loop:list
    npm run loop:transition -- <loopId> doing "started local follow-up"
    npm run capability:show
    npm run loop:reconcile

All of these commands preserve externalWrite:false and do not write to Gmail, Calendar, Slack, GitHub, or any external system.

## Proposal Review Decisions

New in v0.8.0 — proposals can now receive local review decisions.

**Core principles:**

- Proposal ≠ Execution
- Approval ≠ Execution

A proposal can be approved, rejected, snoozed, or escalated. None of these decisions execute an external action. They update local proposal state and create local decision receipts only.

### Decision commands

    npm run proposal:decide -- <proposal-id> approve
    npm run proposal:decide -- <proposal-id> reject
    npm run proposal:decide -- <proposal-id> snooze
    npm run proposal:decide -- <proposal-id> escalate
    npm run proposal:decide -- <proposal-id> repropose   # snoozed/escalated → proposed
    npm run proposal:review                              # human-readable review summary
    npm run proposal:review -- --json                    # structured JSON review
    npm run proposal:receipts                            # list decision receipts
    npm run proposal:receipts -- --json                  # structured JSON receipts

### Decision statuses

- `proposed` — awaiting a decision
- `approved` — approved by reviewer (does not execute anything)
- `rejected` — rejected, proposal kept locally
- `snoozed` — deferred, can be re-proposed
- `escalated` — escalated, can be re-proposed

Terminal states: `approved` and `rejected` cannot be transitioned in v0.8.0.

### Decision receipts

Receipts are stored locally under `.worldloops/proposal_decision_receipts.json`. Each receipt includes proposalId, templateId, decision, previousStatus, newStatus, actor, note, boundaryCrossed, externalWrite, createdAt, and source.

### Safety boundary

`externalWrite: false` preserved. No external writes. All state is local.

---

## Proposal Templates Foundation

New in v0.7.0 — generic proposal templates for common agent intentions.

**Core principle: Proposal ≠ Execution**

Templates do not execute actions. They standardize agent intent into local, reviewable proposal objects before any commit or external write is considered.

### Initial templates

| Template ID | Risk | Description |
|---|---|---|
| `file-write` | medium | Propose a file write — does not write any file |
| `api-call` | high | Propose an API call — does not call any API |
| `state-transition` | medium | Propose a state change — does not transition anything |
| `human-review` | low | Propose human inspection before any commit |
| `notification-draft` | medium | Propose a notification draft — does not send any message |
| `escalation` | high | Propose escalation to a human owner — does not execute escalation |

### Commands

    npm run proposal:templates                        # human-readable template list
    npm run proposal:templates -- --json              # structured JSON list
    npm run proposal:create -- <template-id>          # create proposal (human-readable)
    npm run proposal:create -- <template-id> --json   # create proposal (JSON)
    npm run proposal:list                             # list local proposals (human-readable)
    npm run proposal:list -- --json                   # list local proposals (JSON)
    npm run proposal:show -- <proposal-id>            # show proposal detail (human-readable)
    npm run proposal:show -- <proposal-id> --json     # show proposal detail (JSON)

### Safety boundary

All proposals are stored locally under `.worldloops/proposals.json`. No external writes. `externalWrite: false` is preserved. `requiredReview: true` is set on every proposal.

Templates do not send messages, call APIs, write files, or transition state. They produce a local proposal object only.

### Intentionally deferred

- Rollback mechanism
- Whitelist auto-approval
- External writes
- External DB or state adapter
- Connector expansion
- Domain-specific templates
- `loop:update`

---

## Loop Lifecycle UX

New in v0.6.0 — governed transitions, human-readable loop inspection, and lifecycle review.

### Cross-session state persistence

WorldLoops persists open-loop state locally to `.worldloops/open_loop_states.json`. Loops survive agent restarts and shell restarts. No external DB or remote memory adapter is needed. `externalWrite: false` is preserved across sessions.

    npm run loop:list          # see all loops from any prior session
    npm run loop:show -- <id>  # inspect a specific loop
    npm run loop:review        # lifecycle summary

### loop:show — human-readable

    npm run loop:show -- <loopId>           # human-readable (default)
    npm run loop:show -- <loopId> --json    # structured JSON

### loop:transition — governed lifecycle

Both formats supported:

    npm run loop:transition -- <loopId> doing
    npm run loop:transition -- <loopId> --to doing
    npm run loop:transition -- <loopId> --to doing --dry-run

Valid transitions: todo→doing, doing→done, doing→snoozed, doing→escalated, snoozed→todo, escalated→doing.

Invalid transitions return `INVALID_LOOP_TRANSITION` with `allowedTransitions`.

### loop:review

    npm run loop:review           # human-readable lifecycle summary
    npm run loop:review -- --json # structured JSON

Outputs count by status, high-severity loops, suggested focus, and externalWrite boundary.

## Loop Inspection UX

Added in v0.5.0 — compact loop list, filters, and summary commands.

**Compact loop list (default)**

    npm run loop:list

Outputs a compact table: id, status, severity, title, source count, updatedAt.

**Full JSON output**

    npm run loop:list -- --json

**Filter by status**

    npm run loop:list -- --status todo
    npm run loop:list -- --status doing
    npm run loop:list -- --status done
    npm run loop:list -- --status snoozed
    npm run loop:list -- --status escalated

**Filter by severity**

    npm run loop:list -- --severity low
    npm run loop:list -- --severity medium
    npm run loop:list -- --severity high
    npm run loop:list -- --severity critical

Filters combine with AND semantics and work with --json. Invalid filter values fail safely.

**Loop summary**

    npm run loop:summary

Summarizes open-loop state counts by status and severity.

    npm run loop:summary -- --json

Structured JSON output with externalWrite:false in the capability boundary.

All Loop Inspection UX commands are local-only. externalWrite remains false.

## Output

The skill returns safe JSON containing:

- `brief`
- `openLoops`
- `proposalCandidates`
- `safety.externalWrite`
- `mode`
- `source`
- `metadata`

## Updating

Existing users can update with:

```
clawhub update worldloops
```

Force reinstall:

```
clawhub install worldloops --force
```

## Important rules

Do not invent missing source data.
Do not send messages.
Do not send emails.
Do not create drafts.
Do not create or update calendar events.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.
Do not implement background daemons.
Do not auto-install cron or launchd.

Return the JSON result directly.
