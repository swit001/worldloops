---
name: worldloops
description: Agent Execution Guard by WorldLoops — a safe-by-default responsibility layer for AI agents that turns scattered work signals into governed open loops while preserving externalWrite:false.
version: "1.8.2"
homepage: https://github.com/swit001/worldloops
metadata: {"openclaw":{"requires":{"bins":["node","npm"]},"envVars":[{"name":"WORLDLOOPS_API_BASE_URL","required":false,"description":"Optional WorldLoops API base URL override. Defaults to https://api.worldloops.ai."},{"name":"WORLDLOOPS_API_KEY","required":false,"description":"Optional bearer token for hosted WorldLoops API."}],"emoji":"🌐","homepage":"https://github.com/swit001/worldloops","skillKey":"worldloops","tags":["openclaw","clawhub","agentic-ai","world-model","executable-world","open-loops","open-loop-management","workflow","human-in-the-loop","safe-by-default","auditable-runtime","stateful-loop-management","agent-execution-guard","execution-governance","execution-contracts","proposal-engine","workflow-governance"]}}
---

# Agent Execution Guard

Agent Execution Guard is a WorldLoops skill for OpenClaw.

It turns signals from tools, messages, and workflows into governed open loops:

Signal → Open Loop → Proposal → Approval → Local Transition → Receipt

It helps agents avoid unsafe or premature execution by keeping action proposals inside a safe, auditable boundary.

---

## Why it matters

Most agents answer from a snapshot.
WorldLoops tracks what remains unresolved.

When an email, calendar event, Slack message, or GitHub notification implies unfinished responsibility, Agent Execution Guard surfaces it as a governed open loop — not a silent side effect.

Every proposed action requires approval before any local transition is committed.
No external system is changed.
`externalWrite:false` is preserved throughout.

---

## Quick Start

```bash
clawhub install worldloops
cd ~/.openclaw/workspace/skills/worldloops
npm run demo
```

### Optional Safety Check

```bash
npm run doctor
```

---

## Example demo output

```bash
npm run demo
```

```
🦞 Agent Execution Guard

🚨 High — Gmail callback requested
State: open

Proposal:
Review claim context and decide whether to call back or prepare a written response. This is a local planning action only — do not initiate any call, email, or external communication without an explicit decision.

Adjudication:
requires_approval

✅ Safe
externalWrite:false
No email, draft, call, or external change made.
```

---

## Safety posture

Agent Execution Guard does not send emails.
Agent Execution Guard does not post chat messages.
Agent Execution Guard does not create calendar events.
Agent Execution Guard does not modify external systems.

```
✅ 0 emails sent
✅ 0 calendar events changed
✅ 0 chat messages posted
✅ 0 files modified
✅ 0 project changes made
✅ externalWrite:false enforced
```

OpenClaw reads signals.
WorldLoops guards execution.

WorldLoops does not need to own every connector.
If a host agent can read a signal, it can pass it to Agent Execution Guard.

---

## OpenClaw Signal Handoff

OpenClaw reads. Agent Execution Guard governs.

No connectors added.
No OAuth added.
No external write.

A host agent (OpenClaw, gog, or any other) reads signals from Gmail, Calendar, Slack, or GitHub.
It places the already-read payload as a local JSON file.
Agent Execution Guard receives that payload, normalizes it into an `AdapterSignal`, and produces a governed receipt.

```
OpenClaw / gog reads Gmail / Calendar / Slack / GitHub
    ↓
already-read payload → .worldloops/inbox/openclaw-gmail-live.json
    ↓
npm run guard:gmail -- --input .worldloops/inbox/openclaw-gmail-live.json --compact
    ↓
Agent Execution Guard
    ↓
governed open loop → proposal → receipt
externalWrite:false
```

### Accepted local payload formats

Agent Execution Guard can consume local payloads in these forms:

- **AdapterSignal JSON** — fully normalized signal with `source`, `sourceType`, `text`, `observedAt`, `externalWrite:false`
- **OpenClaw-style handoff payloads** — already-normalized payloads from OpenClaw host agents
- **gog-style Gmail payloads** — `{ "messages": [...] }` output from gog Gmail reads
- **gog-style Calendar payloads** — `{ "events": [...] }` output from gog Calendar reads
- **Slack host/plugin payloads** — `{ "channel": "...", "messages": [...] }` output from Slack host tools

gog and OpenClaw read Gmail, Calendar, and Slack.
Agent Execution Guard only consumes the local JSON output they produce.
No Gmail, Calendar, or Slack API call is made by WorldLoops.
`externalWrite:false` is preserved throughout.

### Local handoff directory

Host agents should place payloads here:

```
.worldloops/inbox/openclaw-gmail-live.json
.worldloops/inbox/openclaw-calendar-live.json
.worldloops/inbox/openclaw-slack-live.json
.worldloops/inbox/openclaw-github-live.json
```

The `.worldloops/inbox/` directory is created automatically on first run and is gitignored by default.

Redacted payload examples are in `examples/handoff/`.

---

## Current commands

For everyone:

```bash
npm run demo
npm run guard:demo
npm run wow
npm run doctor
```

For governed adapter invocation (already-read OpenClaw payloads):

```bash
npm run guard:adapter -- --source gmail --input <payload.json>
npm run guard:adapter -- --source gmail --input <payload.json> --compact
npm run guard:gmail -- --input <payload.json>
npm run guard:calendar -- --input <payload.json>
npm run guard:slack -- --input <payload.json>
npm run guard:github -- --input <payload.json>
```

For compact chat-friendly output:

```bash
npm run doctor:mobile
```

For developers:

```bash
npm run wow:developer
npm run loop:list
npm run loop:transition -- <loopId> doing "started local follow-up"
npm run loop:summary
npm run loop:review
npm run proposal:list
npm run proposal:show -- <proposalId>
npm run proposal:decide -- <proposalId> approve
npm run plan:list
npm run contract:list
npm run state:check
npm run receipts:verify
npm run state:repair
npm run capability:show
```

For adapter developers:

```bash
npm run adapter:validate -- examples/adapters/slack-message.json
npm run adapter:test -- examples/adapters/slack-message.json
npm run brief:reconcile -- --adapter-signal examples/adapters/slack-message.json
```

All commands preserve `externalWrite:false` and do not write to Gmail, Calendar, Slack, GitHub, or any external system.

---

## Updating

```
clawhub update worldloops
```

Force reinstall:

```
clawhub install worldloops --force
```

---

## Agent Runtime Instructions

The following section is for OpenClaw agents, not end users.

### Demo routing

When the user asks for a demo, guard demo, execution guard demo, Agent Execution Guard demo, real signal governance demo, WorldLoops guard demo, or open-loop demo, run:

```bash
npm run --silent demo
```

Return only the compact Agent Execution Guard output.

### Runtime invocation

When the user asks you to run this skill, do the following:

1. Change into the skill directory: `{baseDir}`
2. Run the command with `--silent`
3. Use provided local payload files when available
4. If no payload files are provided, use the included fixture files
5. Return the result directly
6. Do not modify external systems

Safe default command from the skill directory:

```
npm run --silent demo
```

For local payload handoff:

```
npm run --silent guard:gmail -- --input <payload.json> --compact
npm run --silent guard:calendar -- --input <payload.json> --compact
npm run --silent guard:slack -- --input <payload.json> --compact
npm run --silent guard:github -- --input <payload.json> --compact
```

### Default API

By default, WorldLoops uses:

```
https://api.worldloops.ai
```

You do not need to set `WORLDLOOPS_API_BASE_URL` for the default demo flow.

To use a different backend, set:

```
WORLDLOOPS_API_BASE_URL=https://your-worldloops-api.example.com
```

Optional:

```
WORLDLOOPS_API_KEY=your_api_key
```

### Output

Default output is compact, messenger-friendly Agent Execution Guard output.
Structured JSON remains available through developer-oriented commands where supported.

### Important rules

Do not invent missing source data.
Do not send messages.
Do not send emails.
Do not create drafts.
Do not create or update calendar events.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.
Do not implement background daemons.
Do not auto-install cron or launchd.

Return the result directly.
