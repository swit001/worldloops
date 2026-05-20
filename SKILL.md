---
name: worldloops
description: Agent Execution Guard by WorldLoops — a safe-by-default responsibility layer for AI agents that turns scattered work signals into governed open loops while preserving externalWrite:false.
version: "1.6.1"
homepage: https://github.com/swit001/worldloops
metadata: {"openclaw":{"requires":{"bins":["node","npm"]},"envVars":[{"name":"WORLDLOOPS_API_BASE_URL","required":false,"description":"Optional WorldLoops API base URL override. Defaults to https://api.worldloops.ai."},{"name":"WORLDLOOPS_API_KEY","required":false,"description":"Optional bearer token for hosted WorldLoops API."}],"emoji":"🌐","homepage":"https://github.com/swit001/worldloops","skillKey":"worldloops","tags":["openclaw","clawhub","agentic-ai","world-model","executable-world","open-loops","open-loop-management","workflow","human-in-the-loop","safe-by-default","auditable-runtime","stateful-loop-management","agent-execution-guard","execution-governance","execution-contracts","proposal-engine","workflow-governance"]}}
---

# Agent Execution Guard — by WorldLoops

AI agents can answer.
But who keeps track of what is still unfinished?

Agent Execution Guard turns scattered work signals into open loops with clear states — safely.

It helps agents see responsibilities across email, calendar, chat, documents, project tools, and meeting notes.

Nothing is sent.
Nothing is changed.
Nothing executes without approval.

## Try it

```bash
openclaw skills install worldloops
cd ~/.openclaw/workspace/skills/worldloops
npm run wow
npm run doctor
```

## What you will see

```
6 open loops found
Proposal follow-up — To Do
Workshop preparation — Preparing
Pricing plan review — To Do
Missing ROI assumptions — Blocked
Approval needed before release — Waiting for review
Customer follow-up — To Do
```

## Safety

```
0 emails sent
0 calendar events changed
0 chat messages posted
0 files modified
0 project changes made
externalWrite:false enforced
```

## Why it matters

Most agents answer from a snapshot.
WorldLoops manages open loops as state.

It is not another chatbot.
It is a responsibility layer for AI agents.

## Use it when

- an agent needs to track unresolved work
- scattered messages imply responsibilities
- multiple tools contain related work signals
- you want proposals before execution
- you want safe, local, reviewable agent behavior

## Do not use it for

- uncontrolled automation
- silent external writes
- replacing human judgment
- sending emails or messages automatically

## Developer check

```bash
npm run wow:developer
```

---

## Safety boundary

WorldLoops does not send messages.
WorldLoops does not send emails.
WorldLoops does not create calendar events.
WorldLoops does not modify external systems.

`externalWrite` remains `false`.

---

## Runtime invocation

When the user asks you to run this skill, do the following:

1. Change into the skill directory: `{baseDir}`
2. Run the command with `--silent`
3. Use provided local payload files when available
4. If no payload files are provided, use the included fixture files
5. Return the JSON result directly
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

---

## Default API

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

---

## Useful commands

For everyone:

```bash
npm run wow
npm run doctor
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

## Output

The skill returns safe JSON containing:

- `brief`
- `openLoops`
- `proposalCandidates`
- `safety.externalWrite`
- `mode`
- `source`
- `metadata`

---

## Updating

Existing users can update with:

```
clawhub update worldloops
```

Force reinstall:

```
clawhub install worldloops --force
```

---

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
