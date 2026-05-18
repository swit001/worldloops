---
name: worldloops
description: Executable world layer for OpenClaw that detects open loops, proposes governed transitions, and keeps agent execution safe with externalWrite:false.
version: 0.2.6
homepage: https://github.com/swit001/worldloops
metadata: {"openclaw":{"requires":{"bins":["node","npm"]},"envVars":[{"name":"WORLDLOOPS_API_BASE_URL","required":false,"description":"Optional WorldLoops API base URL override. Defaults to https://api.worldloops.ai."},{"name":"WORLDLOOPS_API_KEY","required":false,"description":"Optional bearer token for hosted WorldLoops API."}],"emoji":"🌐","homepage":"https://github.com/swit001/worldloops","skillKey":"worldloops","tags":["openclaw","clawhub","agentic-ai","world-model","executable-world","open-loops","workflow","human-in-the-loop"]}}
---

# WorldLoops for OpenClaw

Executable world layer for OpenClaw that detects open loops, proposes governed transitions, and keeps agent execution safe with `externalWrite: false`.

WorldLoops is signal-first and promptless by design. It surfaces governed open-loop proposals for human-in-the-loop review, without waiting for a user prompt. Safe-by-default means proposal is not execution, and external writes are disabled by default.

Use this skill when the user wants to detect open loops from scattered work signals and convert them into governed proposal candidates.

WorldLoops is not a chatbot, task bot, or uncontrolled automation trigger.

It is a governed world-model layer for interpreting work signals safely.

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


## Proactive Discovery

> **Direction — v0.2.6**
>
> WorldLoops should not wait for the user to ask "what did I miss?" It discovers important signals across Gmail, Calendar, Slack, GitHub, and projects periodically or on signal arrival, then surfaces unresolved or uncertain candidates for user review.

When a signal arrives, WorldLoops inspects it for unresolved state and surfaces open-loop candidates proactively. Each candidate is presented with suggested actions:

- **Review** — inspect the candidate and decide
- **Snooze** — defer for a set period
- **Dismiss** — mark as not actionable
- **Mark handled** — record that the loop was resolved

Safe-by-default: no external writes. Proactive discovery proposes — it does not act.

Full runtime implementation is planned for a future release.

## Scheduled Daily Brief

> **Direction — v0.2.6**
>
> WorldLoops can be configured to surface a daily brief at a scheduled time (e.g., 9:00 AM) summarizing the most important open loops, uncertain threads, upcoming meetings, preparation items, and decisions that require user attention.

A daily brief includes:

- important open loops requiring action
- uncertain threads needing inspection
- upcoming meetings and preparation items
- required user decisions
- signals that arrived since the last brief

The brief is a proposal, not an execution. No external writes. User approval is required for any resulting action. Configurable scheduled brief runtime is planned for a future release.

## Default API

By default, WorldLoops uses:

https://api.worldloops.ai

You do not need to set `WORLDLOOPS_API_BASE_URL` for the default demo flow.

To use a different backend, set:

WORLDLOOPS_API_BASE_URL=https://your-worldloops-api.example.com

Optional:

WORLDLOOPS_API_KEY=your_api_key

## Output

The skill returns safe JSON containing:

- `brief`
- `openLoops`
- `proposalCandidates`
- `safety.externalWrite`
- `mode`
- `source`
- `metadata`

## Important rules

Do not invent missing source data.
Do not send messages.
Do not send emails.
Do not create drafts.
Do not create or update calendar events.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.

Return the JSON result directly.
