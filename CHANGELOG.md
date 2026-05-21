# Changelog

## v1.9.2 — Attributable Compact Daily Brief

v1.9.2 adds attributable compact Daily Brief output. Gmail items now show sender and subject, Calendar items show event and time, and Slack items show sender/channel context. No-action sources use neutral wording, missing Slack gives setup guidance, and --details provides deeper source identifiers when available.

### New

- Gmail Daily Brief items include `From:` and `Subject:` attribution for actionable loops
- Calendar Daily Brief items include `Event:` and `When:` for actionable loops; `Event:` for no-action loops
- Slack Daily Brief items include `From:` and `Channel:` attribution for actionable loops
- Calendar zero-event case now clearly shown as `No events found` with `Next:` guidance
- No-action Gmail uses neutral `📧` icon instead of warning `⚠️`
- Missing Slack payload shows setup-oriented guidance: configure OpenClaw channels.slack
- `--details` flag: adds source identifiers (messageId, threadId, eventId, ts, thread_ts, permalink) to output
- `npm run guard:daily -- --details` and `npm run brief:daily -- --inbox ... --details` supported

### Changed

- `src/dailyBriefRunner.ts` — `buildSummaryLines` now exported; attribution lines added; `EvidenceData` extended with messageId, threadId, eventId, location, description, ts, thread_ts, permalink, sampleMessages; `processAllSources` and `processSource` accept `details` flag; missing Slack returns setup-guidance summaryLines; `buildBriefLines` includes missing-source summaryLines in Open loops section
- `src/scripts/guardDaily.ts` — `--details` flag parsed and passed to `processAllSources`
- `package.json` — version 1.9.1 → 1.9.2
- `SKILL.md` — version 1.9.1 → 1.9.2; Daily Brief examples updated with attributed output; routing instructions discourage tool search steps and package.json inspection; `--details` commands added
- `README.md` — Daily Brief example updated with attributed output (From, Subject, Event, Channel)
- `CHANGELOG.md` — this entry
- `tests/guardDaily.test.cjs` — new assertions for attribution (From, Subject, Event, Channel), no-action neutral icon, calendar zero-event, missing Slack setup guidance, compact output, details mode, routing discouragement

### Architecture rule preserved

No Gmail, Calendar, or Slack connector added.
No OAuth added.
No external fetch added.
No normalizer behavior changed.
`externalWrite:false` preserved throughout.
No cron, launchd, or daemon installation.

---

## v1.9.1 — Daily Brief Explainability and Timezone Polish

v1.9.1 adds Daily Brief evidence lines, improves explainability for Gmail/Calendar/Slack summaries, changes default schedule wording from UTC to local time, and strengthens runtime routing for Daily Brief requests.

### New

- Daily Brief source summaries now include `Why`, `Evidence`, `Action`, and `Adjudication` lines for actionable sources
- Non-actionable Calendar (and other) sources now show `Checked: N events` and `Reason:` lines
- Evidence snippets are capped at 120 characters; raw JSON is never exposed
- Missing-payload onboarding block is shorter and more mobile-friendly, with source-labeled paths
- SKILL.md Agent Runtime Instructions now include a direct Daily Brief routing section
- Runtime instructions prefer `--silent` commands and instruct agents to return only command output

### Changed

- `src/dailyBriefRunner.ts` — `SourceResult.summaryLines` replaces `summaryLine`; `extractEvidence` and `buildSummaryLines` added
- `src/scripts/guardDaily.ts` — schedule wording: `09:00 (UTC)` → `09:00 local time` (when timezone is default); explicit timezone shown when set
- `src/scripts/briefPreferences.ts` — same timezone display update
- `package.json` — version 1.9.0 → 1.9.1
- `SKILL.md` — version 1.9.0 → 1.9.1; Daily Brief examples updated with Why/Evidence/Action/Adjudication and local time wording; routing instructions strengthened
- `README.md` — Daily Brief examples updated with connected and missing-payload onboarding examples
- `CHANGELOG.md` — this entry
- `tests/guardDaily.test.cjs` — new assertions: Why lines, Evidence lines, Gmail/Slack evidence, Calendar checked count, local time wording, routing instruction
- `tests/briefPreferences.test.cjs` — new assertions: default schedule says local time, not UTC

### Architecture rule preserved

No Gmail, Calendar, or Slack connector added.
No OAuth added.
No external fetch added.
No normalizer behavior changed.
`externalWrite:false` preserved throughout.
No cron, launchd, or daemon installation.

---

## v1.9.0 — Live Handoff Daily Brief

v1.9.0 adds Live Handoff Daily Brief, combining local Gmail, Calendar, and Slack handoff payloads from `.worldloops/inbox/` into one compact Agent Execution Guard summary, with delivery preferences and a delivery-ready command, while preserving `externalWrite:false` and adding no connectors, OAuth, fetch, or external API calls.

### New

- `npm run guard:daily` — reads local inbox payloads and produces a compact Daily Brief including schedule and delivery channel info
- `npm run brief:daily` — aliases `guard:daily`
- `npm run brief:preferences` — shows current Daily Brief preferences (schedule, delivery channel, sources, min severity)
- `npm run brief:preferences:set` — updates preferences via `--time HH:MM`, `--channel <channel>`, `--sources <list>`
- `npm run brief:deliver` — generates and delivers the Daily Brief (`--dry-run`, `--channel <channel>`)
- `src/scripts/guardDaily.ts` — uses shared `dailyBriefRunner`; shows schedule and delivery channel in output
- `src/scripts/briefPreferences.ts` — human-readable preference display
- `src/scripts/briefPreferencesSet.ts` — flag-based preference setter
- `src/scripts/briefDeliver.ts` — delivery-ready output; `local` prints brief; remote channels show "not active in this runtime"
- `src/dailyBriefRunner.ts` — shared source-processing module used by `guardDaily` and `briefDeliver`
- `scripts/fixtures/inbox/` — test fixture directory with redacted inbox payloads
- `tests/guardDaily.test.cjs` — guard:daily test suite
- `tests/briefPreferences.test.cjs` — brief preferences and delivery test suite

### Delivery channels

Daily Brief delivery channels include local, Telegram, Slack, Discord, SMS, and email.
Default channel: `local` (prints to stdout).
Remote channels require a host scheduler or integration to be active.
No cron, launchd, or daemon installation.

### Changed

- `src/types.ts` — `NotificationPrefs.dailyBrief` extended with optional `channel`, `minimumSeverity`, `sources`
- `src/notifications/prefs.ts` — `DEFAULT_PREFS.dailyBrief` extended with new defaults; `VALID_CHANNELS`, `DeliveryChannel`, `DEFAULT_BRIEF_CHANNEL` exported
- `package.json` — version 1.8.2 → 1.9.0; all new scripts and test scripts added
- `SKILL.md` — version 1.8.2 → 1.9.0; Daily Brief section expanded with preferences and delivery docs
- `README.md` — Daily Brief section expanded
- `CHANGELOG.md` — this entry
- `tests/guardAdapter.test.cjs` — version assertions updated to 1.9.0
- `tests/guardHandoff.test.cjs` — version assertions updated to 1.9.0
- `tests/v182PublicListing.test.cjs` — version assertions updated to 1.9.0

### Architecture rule preserved

No Gmail, Calendar, or Slack connector added.
No OAuth added.
No external fetch added.
No normalizer behavior changed.
`externalWrite:false` preserved throughout.
No cron, launchd, or daemon installation.

### Validation

```
npm run typecheck
npm run build
npm run guard:daily
npm run brief:daily -- --inbox scripts/fixtures/inbox
npm run brief:preferences
npm run brief:preferences:set -- --time 08:30
npm run brief:preferences:set -- --channel telegram
npm run brief:deliver -- --dry-run
npm run brief:deliver -- --channel telegram
npm run guard:gmail -- --input scripts/fixtures/gog-gmail-messages.json --compact
npm run guard:calendar -- --input scripts/fixtures/gog-calendar-events.json --compact
npm run guard:slack -- --input scripts/fixtures/slack-messages.json --compact
npm run test:guard-daily
npm run test:brief-preferences
npm run test:guard-adapter
npm run test:guard-handoff
npm run test:messenger
npm run receipts:verify
npm run state:check
```

---

## v1.8.2 — Runtime Instruction and Public Listing Cleanup

v1.8.2 cleans up public runtime instructions and default output documentation. It removes non-English demo trigger phrases from SKILL.md, replaces the legacy brief:reconcile default runtime command with npm run --silent demo, and clarifies that compact Agent Execution Guard output is the default while structured JSON remains available for developer workflows.

### Changes

- `SKILL.md` — version 1.8.1 → 1.8.2; Korean phrase "데모 보여줘" removed from Demo routing; Demo routing simplified; safe default runtime command updated from brief:reconcile to npm run --silent demo; local payload handoff commands added; Output section updated to compact-first wording
- `CHANGELOG.md` — this entry
- `package.json` — version 1.8.1 → 1.8.2; test:v182-public-listing script added
- `tests/v182PublicListing.test.cjs` — new tests: no Korean phrase, correct default command, no brief:reconcile as default, compact-first Output, no JSON-first README wording, version 1.8.2
- `tests/guardAdapter.test.cjs` — version assertions updated to 1.8.2
- `tests/guardHandoff.test.cjs` — version assertions updated to 1.8.2

### Architecture rule preserved

No Gmail, Calendar, or Slack connector added.
No OAuth added.
No external fetch added.
No normalizer behavior changed.
`externalWrite:false` preserved throughout.

### Validation

```
npm run typecheck
npm run build
npm run demo
npm run guard:gmail -- --input scripts/fixtures/gog-gmail-messages.json --compact
npm run guard:calendar -- --input scripts/fixtures/gog-calendar-events.json --compact
npm run guard:slack -- --input scripts/fixtures/slack-messages.json --compact
npm run test:guard-adapter
npm run test:guard-handoff
npm run test:messenger
npm run test:v182-public-listing
npm run receipts:verify
npm run state:check
```

---

## v1.8.1 — Gmail, Calendar, and Slack gog Handoff Adapters

v1.8.1 adds Gmail, Calendar, and Slack gog handoff adapters so `guard:gmail`, `guard:calendar`, and `guard:slack` can consume local gog/OpenClaw JSON payloads without adding connectors, OAuth, external fetches, or external writes.

### Problem fixed

`guard:gmail` failed with `Invalid adapter signal. text: required, must be a non-empty string` when given a gog-style Gmail fixture (`{ "messages": [...] }`) because no `text` field was present.

### New normalizers

- **gog Gmail normalizer** (`src/adapters/gogGmail.ts`) — converts `{ "messages": [...] }` payloads to `AdapterSignal`. Picks the most actionable message by keyword score (reply, callback, deadline, follow-up, claim, approval, review). Extracts subject, from, snippet, thread hint. Metadata includes messageId, threadId, labels, from, subject.
- **gog Calendar normalizer** (`src/adapters/gogCalendar.ts`) — converts `{ "events": [...] }` payloads to `AdapterSignal`. Picks the most actionable event by keyword score (prepare, materials, follow-up, deadline, review, recap). Extracts summary, description, start, end, location. Metadata includes eventId, start, end, location.
- **Slack host payload normalizer** (`src/adapters/slackPayload.ts`) — converts `{ "channel": "...", "messages": [...] }` or single-message Slack payloads to `AdapterSignal`. Picks the most actionable message. Extracts text, channel, user, ts, thread_ts, permalink. Metadata preserves channel, user, ts, thread_ts, permalink.

### Architecture rule preserved

No Gmail, Calendar, or Slack connector added.
No OAuth added.
No external fetch added.
gog and OpenClaw read external systems.
Agent Execution Guard only consumes their local JSON output.
`externalWrite:false` preserved throughout.

### Changes

- `src/adapters/gogGmail.ts` — new gog Gmail → AdapterSignal normalizer
- `src/adapters/gogCalendar.ts` — new gog Calendar → AdapterSignal normalizer
- `src/adapters/slackPayload.ts` — new Slack host payload → AdapterSignal normalizer
- `src/scripts/guardAdapter.ts` — source-specific normalization before AdapterSignal validation
- `scripts/fixtures/slack-messages.json` — new Slack host payload fixture
- `tests/guardAdapter.test.cjs` — new gog Gmail, gog Calendar, Slack host payload tests; version 1.8.1
- `tests/guardHandoff.test.cjs` — new gog Gmail, gog Calendar, Slack host payload tests; version 1.8.1
- `SKILL.md` — OpenClaw Signal Handoff section updated with accepted payload formats; version 1.8.1
- `README.md` — OpenClaw Signal Handoff section updated with accepted payload formats
- `CHANGELOG.md` — this entry
- `package.json` — version 1.8.0 → 1.8.1

### Validation

```
npm run typecheck
npm run build
npm run demo
npm run guard:demo
npm run guard:gmail -- --input scripts/fixtures/gog-gmail-messages.json --compact
npm run guard:calendar -- --input scripts/fixtures/gog-calendar-events.json --compact
npm run guard:slack -- --input examples/adapters/slack-message.json --compact
npm run guard:gmail -- --input examples/handoff/openclaw-gmail-live.redacted.json --compact
npm run guard:calendar -- --input examples/handoff/openclaw-calendar-live.redacted.json --compact
npm run test:guard-adapter
npm run test:guard-handoff
npm run test:messenger
npm run receipts:verify
npm run state:check
```

---

## v1.8.0 — Real OpenClaw Signal Handoff

WorldLoops v1.8.0 documents and formalizes the local handoff convention between OpenClaw host agents and Agent Execution Guard.

### Architecture rule

OpenClaw reads external systems.
Agent Execution Guard receives local payload JSON and governs execution.

No connectors added.
No OAuth added.
No external write.
`externalWrite:false` preserved throughout.

### Changes

- **Quick Start cleanup:** SKILL.md and README Quick Start now use `clawhub install worldloops` and `npm run demo` only. `npm run doctor` moved to an Optional Safety Check section.
- **Local handoff directory convention:** `.worldloops/inbox/` documented as the standard path for host agents to place already-read payloads.
- **Handoff examples:** `examples/handoff/` directory with four redacted payload examples for Gmail, Calendar, Slack, and GitHub.
- **OpenClaw Signal Handoff section:** Added to both SKILL.md and README.md explaining the payload-in / governed receipt-out flow.
- **New tests:** `tests/guardHandoff.test.cjs` — verifies all four guard aliases work with handoff examples, compact output, externalWrite:false, no connector/OAuth behavior, Quick Start cleanliness, and version consistency.
- **Version bump:** 1.7.1 → 1.8.0.

### Handoff flow

```
OpenClaw reads Gmail / Calendar / Slack / GitHub
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

### Validation

```
npm run typecheck
npm run build
npm run demo
npm run guard:demo
npm run test:guard-adapter
npm run test:guard-handoff
npm run test:messenger
npm run receipts:verify
npm run state:check
```

---

## v1.7.1 — Demo Routing Cleanup

WorldLoops v1.7.1 makes Agent Execution Guard the default demo path and removes the old `wow:mobile` route that caused Telegram/OpenClaw to show the legacy 6-open-loop mobile demo.

### Problem

In v1.7.0, `npm run demo` routed through `briefMessenger.js`, which produced a "WorldLoops Guard" header and verbose format. The `wow:mobile` script existed alongside `demo`, causing natural-language demo routing in Telegram/OpenClaw to sometimes surface "WorldLoops found 6 open loops" instead of the compact Agent Execution Guard output.

### Changes

- `npm run demo` now runs: `node dist/scripts/guardAdapter.js --source gmail --input examples/adapters/openclaw-gmail-claim.json --compact`
- `npm run guard:demo` now runs the same compact path
- `wow:mobile` script removed from `package.json`
- `test:wow-mobile` script removed from `package.json`
- SKILL.md Agent Runtime Instructions: added explicit routing guidance for "demo", "show demo", "데모 보여줘", and all guard/execution guard phrases
- README Quick Start: updated expected `npm run demo` output to compact Agent Execution Guard format
- Tests: tightened to require "Agent Execution Guard" header and `externalWrite:false` (no space) for both `demo` and `guard:demo`; assert "WorldLoops found 6 open loops" does not appear in either; assert `wow:mobile` is not in `package.json`

### Expected output

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

### Safety

- No external writes added
- No connectors added
- `externalWrite:false` preserved throughout

### Validation

```
npm run typecheck
npm run build
npm run demo
npm run guard:demo
npm run test:guard-adapter
npm run test:messenger
npm run receipts:verify
npm run state:check
```

---

## v1.7.0 — Agent Execution Guard Adapter Invocation Foundation

WorldLoops v1.7.0 introduces the governed adapter invocation path and cleans up the ClawHub landing.

### Highlights

- ClawHub display name: **Agent Execution Guard**
- Added `npm run demo` and `npm run guard:demo` one-command demo paths
- Added `npm run guard:adapter` — governed adapter invocation for already-read OpenClaw payloads
- Added source aliases: `guard:gmail`, `guard:calendar`, `guard:slack`, `guard:github`
- Added `--compact` flag for mobile-optimized messenger output
- Added 6 OpenClaw payload fixtures under `examples/adapters/`
- Rewrote SKILL.md top section as user-facing ClawHub landing copy
- Moved agent-facing runtime instructions to `## Agent Runtime Instructions`
- README architecture section: "OpenClaw reads signals. WorldLoops guards execution."

### Architecture

```
OpenClaw (reads Gmail, Calendar, Slack, GitHub)
    ↓
already-read payload
    ↓
Agent Execution Guard (WorldLoops)
    ↓
governed open loop → proposal → approval → local transition → receipt
```

WorldLoops does not fetch Gmail, Calendar, Slack, GitHub, or any external system.
It only consumes local payload JSON already provided by OpenClaw or the host agent.

### New commands

```bash
npm run demo
npm run guard:demo
npm run guard:adapter -- --source gmail --input <payload.json>
npm run guard:adapter -- --source gmail --input <payload.json> --compact
npm run guard:gmail -- --input <payload.json>
npm run guard:calendar -- --input <payload.json>
npm run guard:slack -- --input <payload.json>
npm run guard:github -- --input <payload.json>
```

### Compact output shape

```
🦞 Agent Execution Guard

🚨 High — Gmail callback requested
State: needs_response

Proposal:
Review before responding.

Adjudication:
requires_approval

✅ Safe
externalWrite:false
No email, draft, call, or external change made.
```

### New fixtures

- `examples/adapters/openclaw-gmail-claim.json` — high / needs_response / requires_approval
- `examples/adapters/openclaw-gmail-sales-noise.json` — sales noise suppression
- `examples/adapters/openclaw-calendar-prep.json` — medium / preparing
- `examples/adapters/openclaw-slack-review-request.json` — medium / waiting_for_review
- `examples/adapters/openclaw-github-pr-review.json` — medium / review_requested
- `examples/adapters/openclaw-generic-task.json` — generic manual task

### Safety

- No external writes added
- No connectors added
- No OAuth introduced
- `externalWrite:false` preserved throughout

### Validation

```
npm run typecheck
npm run build
npm run demo
npm run guard:demo
npm run test:messenger
npm run test:guard-adapter
npm run receipts:verify
npm run state:check
```

---

## v1.6.4 — Messenger-Friendly Output Hotfix

WorldLoops v1.6.4 adds a messenger-friendly output mode for the real signal governance demo.

This is not Telegram-specific. The fix applies to all messenger-style channels: Telegram, Slack, Discord, WhatsApp, SMS, and mobile chat surfaces.

### Problem

- `brief:reconcile` produced raw JSON — unreadable in messenger interfaces
- No fast demo command existed for messenger channels
- SKILL.md had no fast-path instruction to run the demo without workspace search

### Changes

- Added `--format messenger` flag to `brief:reconcile`
- Added `brief:messenger` npm alias (always uses messenger format)
- Messenger output is concise and human-readable: loop count, source, severity, state, proposal, adjudication, receipt, safety boundary
- Updated `SKILL.md` with a "Fast Messenger Demo" section — skill agents run the command immediately without searching the workspace
- Updated `README.md` with messenger-friendly language

### Messenger output shape

```
🦞 WorldLoops Guard

1 open loop detected

🚨 High — Gmail callback requested
State: open

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

### New commands

```bash
npm run brief:reconcile -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json --format messenger
npm run brief:messenger -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
```

### Validation

```
npm run typecheck
npm run build
npm run brief:reconcile -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json --format messenger
npm run brief:messenger -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
npm run receipts:verify
npm run state:check
npm run test:messenger
```

---

## v1.6.3 — Receipt Alignment & Real Signal Fixtures

WorldLoops v1.6.3 fixes receipt/proposal reference alignment for real AdapterSignal reconciliation and adds real Gmail signal fixtures.

### Highlights

- Fixed `RECEIPT_MISSING_PROPOSAL` warning caused by idempotencyKey vs local proposal UUID mismatch
- Added real Gmail claim/contact request fixture (`gmail-claim-contact-request.example.json`)
- Added working-capital sales outreach suppression fixture (`gmail-working-capital-sales.example.json`)
- Improved consistency between `adapter:test` and `brief:reconcile` — `adapter:test` now labels its mode as `local_heuristic`
- Preserved `externalWrite:false` throughout

### Root cause fixed

`brief:reconcile` was building the transition receipt before creating the local proposal.
The receipt stored `proposalId: candidate.idempotencyKey` (e.g., `gmail:reply:1h07we6`),
but the proposal was stored with a local UUID as its `id`.
The receipt verifier only checked against `proposal.id`, so the receipt appeared orphaned.

### Fix

- Proposals are now created before receipts in `brief:reconcile` and `adapter:test`
- Receipts reference the local proposal UUID (`proposal.id`) via a new optional `proposalId` parameter in `buildTransitionReceipt`
- `receipts:verify` and `state:check` now resolve receipt references against both `proposal.id` and `proposal.idempotencyKey` (backward-compatible fallback)

### Validation

```
npm run typecheck
npm run build
npm run smoke
npm run adapter:validate -- examples/adapters/gmail-claim-contact-request.example.json
npm run adapter:test -- examples/adapters/gmail-claim-contact-request.example.json
npm run brief:reconcile -- --adapter-signal examples/adapters/gmail-claim-contact-request.example.json
npm run receipts:verify
npm run state:check
```

---

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
