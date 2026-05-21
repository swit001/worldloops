# 🦞 WorldLoops

AI agents can answer from a snapshot.

WorldLoops tracks what remains unresolved.

It turns real work signals into governed open loops — detecting unfinished responsibility, classifying severity, proposing the next transition, adjudicating whether approval is required, recording decisions, and committing local state transitions with receipts.

`externalWrite:false` is preserved throughout.

**WorldLoops is an execution guard for AI agents — not a todo list.**

---

## 🚀 Try it

```bash
clawhub install worldloops --force
cd ~/.openclaw/workspace/skills/worldloops
npm run wow
npm run doctor
```

Expected result:

```
🦞 WorldLoops found 6 open loops

📧 Proposal follow-up — To Do
📅 Workshop preparation — Preparing
💬 Pricing plan review — To Do
📄 Missing ROI assumptions — Blocked
🛠 Approval before release — Waiting for review
🤝 Customer follow-up — To Do

✅ 0 emails sent
✅ 0 calendar events changed
✅ 0 chat messages posted
✅ 0 files modified
✅ 0 project changes made

Everything is local.
Everything is reviewable.
Nothing executes without approval.
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

```bash
npm run wow
npm run doctor
npm run wow:developer
npm run loop:list
npm run proposal:list
npm run state:check
npm run receipts:verify
```

For messenger-friendly output (Telegram, Slack, Discord, WhatsApp, SMS, and mobile chat):

```bash
npm run wow:mobile
npm run doctor:mobile
npm run brief:messenger -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
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
