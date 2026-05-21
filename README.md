# 🦞 WorldLoops

AI agents can answer questions.

But real work is not finished when an answer is generated.

WorldLoops helps agents remember, track, and govern unfinished responsibilities across email, calendar, chat, documents, project tools, and meeting notes.

It turns scattered signals into open loops with clear states.

✅ Nothing is sent.
✅ Nothing is changed.
✅ Nothing executes without approval.

**WorldLoops is a responsibility layer and execution guard for AI agents.**

---

## 🚀 Try the 5-minute demo

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

## 🧭 What WorldLoops sees

A normal assistant may see:

- an email
- a calendar event
- a chat message
- a document TODO
- a project review request
- a meeting note

WorldLoops sees unfinished responsibilities:

- Proposal follow-up — To Do
- Workshop preparation — Preparing
- Pricing plan review — To Do
- Missing ROI assumptions — Blocked
- Approval needed before release — Waiting for review
- Customer follow-up — To Do

---

## ✨ Why it is different

Most agents answer from a snapshot.

WorldLoops manages open loops as state.

| | Normal assistant | WorldLoops |
|---|---|---|
| Input | Summarizes messages | Finds unfinished responsibilities |
| Mode | Reacts to prompts | Tracks open loops |
| Action | Calls tools directly | Proposes governed transitions |
| Safety | Can act too freely with write access | Preserves `externalWrite:false` |
| Oversight | Needs constant supervision | Keeps work visible and reviewable |

---

## 🔁 What is an open loop?

An open loop is an unfinished responsibility hidden inside a work signal.

Examples:

- an email that requires a reply
- a meeting that requires preparation
- a chat message asking for review
- a document with an unresolved TODO
- a project change waiting for approval
- a customer follow-up that has not happened yet

WorldLoops turns these signals into stateful, reviewable open loops.

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

## 🧰 Current capabilities

WorldLoops can help agents:

- detect unfinished responsibilities
- turn work signals into open loops
- keep local open-loop state
- propose next steps
- review proposals before execution
- create local execution plans and contracts
- inspect state health
- verify receipts
- run a friendly first-time demo

All of this remains local and safe by default.

---

## 🧑‍💻 Useful commands

For everyone:

```bash
npm run wow
npm run doctor
```

### 💬 For Telegram / Discord / mobile

```bash
npm run wow:mobile
npm run doctor:mobile
```

Use these when WorldLoops is called through a messenger channel such as Telegram or Discord.

For developers:

```bash
npm run wow:developer
npm run loop:list
npm run proposal:list
npm run state:check
npm run receipts:verify
```

For adapter developers:

```bash
npm run adapter:validate -- examples/adapters/slack-message.json
npm run adapter:test -- examples/adapters/slack-message.json
```

---

## 📦 Install from ClawHub

```bash
clawhub install worldloops --force
cd ~/.openclaw/workspace/skills/worldloops
```

---

## 🔧 For developers

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
