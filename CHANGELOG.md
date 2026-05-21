# Changelog

## v1.6.2 — Messenger-Friendly Output

WorldLoops v1.6.2 adds mobile-friendly output commands for Telegram, Discord, and other messenger-based OpenClaw channels.

New commands:

```
npm run wow:mobile
npm run doctor:mobile
```

These provide short, readable summaries that preserve the same safety posture while avoiding long terminal-style output in chat interfaces.

No runtime behavior changed.
No external writes added.
`externalWrite:false` remains enforced.

### Validation

```
npm run typecheck
npm run build
npm run smoke
npm run wow
npm run wow:mobile
npm run doctor
npm run doctor:mobile
npm run wow:developer
npm run state:check
npm run receipts:verify
```

---

## v1.6.1 — Landing & README Simplification

WorldLoops v1.6.1 simplifies the GitHub README and ClawHub landing page around the current 5-Minute Wow Experience.

This release makes WorldLoops easier to understand for first-time users by focusing on:

- what WorldLoops does
- why open loops matter
- how to try the demo
- what makes it different from normal assistants
- the safety boundary
- current useful commands

No runtime behavior changed.

### Safety

- No external writes
- No connectors added
- No command behavior changed
- `externalWrite:false` posture preserved

### Validation

```
npm run typecheck
npm run build
npm run smoke
npm run wow
npm run doctor
npm run wow:developer
npm run state:check
npm run receipts:verify
```

---

## v1.6.0 — 5-Minute Wow Experience

WorldLoops v1.6.0 introduces a first-run experience designed to make the value of open-loop management clear in under five minutes.

AI agents are good at answering. But they often lose track of what is still unfinished.

WorldLoops now includes a local demo that shows how scattered signals across email, calendar, chat, documents, project tools, and meeting notes become accountable open loops with clear states.

### Highlights

- Added `npm run wow` — non-technical day-in-the-life demo
- Added email, calendar, chat, document, project tool, and meeting note demo signals
- Added `npm run doctor` — friendly safety check output
- Added `npm run wow:developer` — developer verification summary
- Added `examples/wow/day-in-the-life.json` — readable demo fixture
- Updated README for first-time users
- Preserved `externalWrite:false` everywhere

### Safety

- No external writes
- No connectors added
- No OAuth required
- No emails sent
- No chat messages posted
- No calendar events created
- No project changes made
- No files modified by the demo except local WorldLoops state if explicitly intended
- Everything remains local and reviewable

### Validation

```
npm run typecheck
npm run build
npm run smoke
npm run wow
npm run doctor
npm run wow:developer
npm run state:check
npm run receipts:verify
```

---

## v1.5.0

Adapter SDK, Community Adapter Submission, and Adapter Test Harness (v1.1–v1.3 milestones consolidated).

See git history for full details.
