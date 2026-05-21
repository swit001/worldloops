---
name: worldloops
description: Agent Execution Guard by WorldLoops — a safe-by-default responsibility layer for AI agents that turns scattered work signals into governed open loops while preserving externalWrite:false.
version: "1.7.0"
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

## Quick start

```bash
openclaw skills install worldloops
cd ~/.openclaw/workspace/skills/worldloops
npm run demo
npm run doctor
```

---

## Example messenger output

```bash
npm run demo
```

```
🦞 WorldLoops Guard

1 open loop detected

🚨 High — Gmail callback requested
State: needs_response

Proposal:
Review claim context and decide whether to call back or prepare a written response.

Adjudication:
requires_approval

Receipt:
local proposal recorded

✅ Safe
externalWrite: false
No email sent. No external system changed.
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
npm run wow:mobile
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

### Fast demo

When the user asks for any of the following:
- "real signal governance demo"
- "WorldLoops demo"
- "agent execution guard demo"
- "run the guard demo"
- "show me the open loop demo"

Run this command immediately:

```bash
npm run demo
```

Do not inspect `package.json` first.
Do not search the workspace first.
Do not print raw JSON.
Return only the messenger-friendly summary.

The output will be a concise, human-readable summary — safe for Telegram, Slack, Discord, WhatsApp, SMS, and mobile chat surfaces.

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
npm run --silent brief:reconcile -- \
  --gmail-event scripts/fixtures/openclaw-gmail-webhook.json \
  --calendar-event scripts/fixtures/openclaw-calendar-events.json \
  --gog-gmail scripts/fixtures/gog-gmail-messages.json \
  --gog-calendar scripts/fixtures/gog-calendar-events.json \
  --message-read scripts/fixtures/openclaw-message-read.json
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

The skill returns safe JSON containing:

- `brief`
- `openLoops`
- `proposalCandidates`
- `safety.externalWrite`
- `mode`
- `source`
- `metadata`

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
