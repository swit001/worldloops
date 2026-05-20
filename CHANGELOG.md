# Changelog

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
