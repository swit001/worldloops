---
name: worldloops
description: Executable world layer for OpenClaw that detects open loops, proposes governed transitions, and keeps agent execution safe with externalWrite:false.
version: "0.5.0"
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

## Loop Inspection UX

New in v0.5.0 — compact loop list, filters, and summary commands.

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
