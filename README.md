# 🦞 WorldLoops — Agent Execution Guard

AI agents can answer from a snapshot.

WorldLoops tracks what remains unresolved.

It turns real work signals into governed open loops — detecting unfinished responsibility, classifying severity, proposing the next transition, adjudicating whether approval is required, recording decisions, and committing local state transitions with receipts.

`externalWrite:false` is preserved throughout.

**WorldLoops is an execution guard for AI agents — not a todo list.**

---

## Architecture

OpenClaw reads signals.
WorldLoops guards execution.

WorldLoops does not need to own every connector.
If a host agent can read a signal, it can pass it to Agent Execution Guard.

```
OpenClaw (reads Gmail, Calendar, Slack, GitHub)
    ↓
already-read payload
    ↓
Agent Execution Guard (WorldLoops)
    ↓
governed open loop → proposal → approval → local transition → receipt
```

---

## OpenClaw Signal Handoff

OpenClaw reads. Agent Execution Guard governs.

No connectors added.
No OAuth added.
No external write.

A host agent (OpenClaw, gog, or any other) places an already-read payload into `.worldloops/inbox/`.
Agent Execution Guard consumes it locally and produces a governed receipt.

```
.worldloops/inbox/openclaw-gmail-live.json      ← host agent places this
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

Supported handoff paths:

```
.worldloops/inbox/openclaw-gmail-live.json
.worldloops/inbox/openclaw-calendar-live.json
.worldloops/inbox/openclaw-slack-live.json
.worldloops/inbox/openclaw-github-live.json
```

Redacted payload examples: [`examples/handoff/`](./examples/handoff/)

---

## 📋 Daily Brief

Get one compact Agent Execution Guard summary from all three local handoff sources.

OpenClaw/gog/host tools read Gmail, Calendar, and Slack.
Agent Execution Guard reads only the local payload files they produce.
No Gmail, Calendar, or Slack API call is made by WorldLoops.
`externalWrite:false` is preserved throughout.

Non-English action phrases such as Korean review requests are supported by the detector.

### Expected payload locations

```
.worldloops/inbox/openclaw-gmail-live.json
.worldloops/inbox/openclaw-calendar-live.json
.worldloops/inbox/openclaw-slack-live.json
```

### Run

```bash
npm run guard:daily
npm run brief:daily
```

Default schedule: **09:00 local time**. Default delivery channel: **local**.

### Example output — payloads connected

```
🦞 Agent Execution Guard Daily Brief

Sources:
✅ Gmail
✅ Calendar
✅ Slack

Open loops:

⚠️ Gmail — Review requested
From: Test Reviewer <reviewer@example.com>
Subject: Please review the submitted document
Why: review request detected
Evidence: "Please review the submitted document and send updates by EOD."
Action: Review the submitted document or reply if needed
Adjudication: requires_approval

📅 Calendar — Important context
Event: Flight to Seoul (KE 24)
When: May 21, 12:40 PM local time
Location: SFO
Reason: travel event detected, no action proposed

💬 Slack — Action requested
From: Dana
Channel: #product
Why: review or approval request detected
Evidence: "Can you review this before release?"
Action: Review and comment
Adjudication: requires_approval

✅ Safe
externalWrite:false
No email, draft, calendar event, Slack message, or external change made.

Daily Brief schedule: 09:00 local time — Delivery channel: local
```

### Example output — Gmail no-action with samples

```
📧 Gmail — No actionable loop detected
Checked: 3 messages
Sample:
- From: deals@shop.example.com / Subject: 50% off this weekend only — limited offer!
- From: noreply@digest.example.com / Subject: Your daily digest — top stories
Reason: no reply, deadline, approval, review, or follow-up request detected
Note: messages appear informational or promotional
```

### Example output — Slack not connected

```
⬜ Slack — not connected
Reason: no Slack payload found
Next: configure OpenClaw channels.slack, then save payload to:
.worldloops/inbox/openclaw-slack-live.json
```

### Example output — payloads not connected yet

```
🦞 Agent Execution Guard Daily Brief

No local handoff payloads found yet.

Add payloads here:
- Gmail: .worldloops/inbox/openclaw-gmail-live.json
- Calendar: .worldloops/inbox/openclaw-calendar-live.json
- Slack: .worldloops/inbox/openclaw-slack-live.json

Then run:
npm run guard:daily

Source systems stay untouched.
externalWrite:false

Daily Brief schedule: 09:00 local time — Delivery channel: local
```

### Preferences

```bash
npm run brief:preferences
npm run brief:preferences:set -- --time 08:30
npm run brief:preferences:set -- --channel telegram
npm run brief:preferences:set -- --channel local
```

Daily Brief delivery channels include local, Telegram, Slack, Discord, SMS, and email.

### Delivery

```bash
npm run brief:deliver
npm run brief:deliver -- --dry-run
npm run brief:deliver -- --channel telegram
```

Actual delivery to remote channels (Telegram, Slack, Discord, SMS, email) requires a host scheduler or integration.
WorldLoops does not install cron, launchd, or background daemons.
A host scheduler (e.g. OpenClaw) may call `npm run brief:deliver` at the configured time.

If no integration is active, the command exits 0 with a delivery-ready message.

If payload files are missing, the brief shows short onboarding instructions with expected file paths.

---

## 🚀 Quick Start

```bash
clawhub install worldloops
cd ~/.openclaw/workspace/skills/worldloops
npm run demo
```

### Optional Safety Check

```bash
npm run doctor
```

Expected result:

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

For the broader open-loop showcase:

```bash
npm run wow
```

---

## 🧭 What WorldLoops does

WorldLoops does not just list tasks.

It turns real work signals into governed open loops:

- detects unfinished responsibility
- classifies severity
- proposes the next transition
- adjudicates whether approval is required
- records user decisions
- commits local state transitions
- creates receipts
- preserves `externalWrite:false`

---

## 🔁 From signal to governed transition

```
Signal
  → Open Loop
    → Severity
      → Proposal
        → Adjudication
          → User Approval
            → Local Transition
              → Receipt
                → externalWrite:false
```

**Example real signal:**

A Gmail message says:
> "Please give me a call back. It is important that we discuss your injuries and this incident. Claim No. 26-99-554236."

**WorldLoops produces:**

```
🚨 High — Claim contact request
State: needs_response
Proposal: prepare callback or written response plan
Adjudication: requires_approval
Boundary: local_proposal_only
Safety: externalWrite:false
```

Messenger-friendly output for Telegram, Slack, Discord, WhatsApp, SMS, and mobile chat:

```bash
npm run brief:messenger -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
```

**After user approval:**

```
Decision receipt created.
Loop transitioned locally.
No email sent.
No call made.
No external system changed.
```

This is the key product difference.

Normal assistants summarize what they see.
WorldLoops tracks what remains unresolved, governs what should happen next, and records every safe transition.

---

## 🚨 Severity-aware open loops

WorldLoops classifies detected open loops by severity:

- **Critical / High** → escalated immediately, requires approval
- **Medium** → surfaced for review, proposal generated
- **Low** → tracked but not escalated

High-severity loops (like a legal claim follow-up) trigger proposals with `adjudication: requires_approval`.

---

## 🧑‍⚖️ Proposals, adjudication, and approval

When an open loop requires action, WorldLoops creates a proposal:

- what action is proposed
- why it is required
- what checks should be performed first
- whether approval is required (`requiredReview: true`)
- what boundary applies (`local_proposal_only`, `read_only`, etc.)

No proposal executes automatically.
Human approval is required before any local transition is committed.

---

## 🧾 Receipts and audit trail

Every approved decision creates a receipt:

- transition receipt (records the loop state change)
- proposal decision receipt (records the approval or rejection)

Receipts are verifiable with:

```bash
npm run receipts:verify
npm run state:check
```

---

## 🛡 Safety boundary

WorldLoops does not send emails.
WorldLoops does not post chat messages.
WorldLoops does not create calendar events.
WorldLoops does not modify project tools.
WorldLoops does not silently change external systems.

By default:

```
externalWrite:false
```

Proposal is not execution.
Approval is not external write.
Plan is not execution.
Contract is not external write.

---

## 🧰 Useful commands

Default demo (Agent Execution Guard compact):

```bash
npm run demo
npm run guard:demo
```

Daily Brief (all local inbox sources):

```bash
npm run guard:daily
npm run brief:daily
npm run brief:preferences
npm run brief:preferences:set -- --time 08:30
npm run brief:preferences:set -- --channel telegram
npm run brief:deliver
npm run brief:deliver -- --dry-run
npm run brief:deliver -- --channel telegram
```

Broader open-loop showcase:

```bash
npm run wow
```

Doctor and state:

```bash
npm run doctor
npm run doctor:mobile
npm run state:check
npm run receipts:verify
```

Developer tools:

```bash
npm run wow:developer
npm run loop:list
npm run proposal:list
```

Messenger-friendly adapter output:

```bash
npm run brief:messenger -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
```

For governed adapter invocation (already-read OpenClaw payloads):

```bash
npm run guard:adapter -- --source gmail --input examples/adapters/openclaw-gmail-claim.json
npm run guard:adapter -- --source gmail --input examples/adapters/openclaw-gmail-claim.json --compact
npm run guard:gmail -- --input examples/adapters/openclaw-gmail-claim.json
npm run guard:calendar -- --input examples/adapters/openclaw-calendar-prep.json
npm run guard:slack -- --input examples/adapters/openclaw-slack-review-request.json
npm run guard:github -- --input examples/adapters/openclaw-github-pr-review.json
```

For adapter developers:

```bash
npm run adapter:validate -- examples/adapters/slack-message.json
npm run adapter:test -- examples/adapters/slack-message.json
npm run brief:reconcile -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
```

---

## 🧑‍💻 For developers

WorldLoops is a local, safe-by-default world state layer for agent execution.

Signals become loops.
Loops become proposals.
Proposals become decisions.
Decisions become plans.
Plans become contracts.
Execution remains governed.

---

## 📚 Advanced docs

- Adapter guide: [ADAPTER_GUIDE.md](./ADAPTER_GUIDE.md)
- Community adapter guide: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Release history: GitHub Releases
- Changelog: [CHANGELOG.md](./CHANGELOG.md)

---

## 🚫 What WorldLoops is not

WorldLoops is not:

- a chatbot
- a todo app
- a Zapier clone
- an uncontrolled automation runner
- a tool that lets agents freely write to external systems
- a replacement for human judgment

WorldLoops keeps humans in control without making them the bottleneck.

---

## 🔗 Links

- Website: https://worldloops.ai
- API: https://api.worldloops.ai
- ClawHub: worldloops

---

Give agents a world, not just tools.

Close the loop.
Keep the world safe.
