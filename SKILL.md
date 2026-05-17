---
name: worldloops
description: WorldLoops detects open loops from work signals and returns governed proposal candidates as safe JSON.
version: 1.7.0
homepage: https://github.com/swit001/worldloops-openclaw-skill
metadata: {"openclaw":{"requires":{"bins":["node","npm"]},"envVars":[{"name":"WORLDLOOPS_API_BASE_URL","required":true,"description":"WorldLoops API base URL."},{"name":"WORLDLOOPS_API_KEY","required":false,"description":"Optional bearer token for hosted WorldLoops API."}],"emoji":"🌐","homepage":"https://github.com/swit001/worldloops-openclaw-skill","skillKey":"worldloops"}}
---

# WorldLoops for OpenClaw

Use this skill when the user wants to detect open loops from scattered work signals and convert them into governed proposal candidates.

WorldLoops is not a chatbot, task bot, or uncontrolled automation trigger.

It is a governed world-model layer for interpreting work signals safely.

## Connected reconciliation mode

When the user wants WorldLoops to combine multiple OpenClaw-visible sources into one cross-source brief, use reconciliation mode.

Reconciliation mode combines any available local source payloads and OpenClaw state into one governed WorldLoops brief.

Safe reconciliation command:

npm run --silent openclaw:brief:reconcile -- --commitments --gmail-event <gmail-webhook-payload.json> --calendar-event <calendar-events-payload.json> --gog-gmail <gog-gmail-messages.json> --gog-calendar <gog-calendar-events.json> --json

Example using included fixtures:

npm run --silent openclaw:brief:reconcile -- --commitments --gmail-event scripts/fixtures/openclaw-gmail-webhook.json --calendar-event scripts/fixtures/openclaw-calendar-events.json --gog-gmail scripts/fixtures/gog-gmail-messages.json --gog-calendar scripts/fixtures/gog-calendar-events.json --json

This command does the following:

1. Reads OpenClaw commitments when requested
2. Reads Gmail event payloads when provided
3. Reads Calendar event payloads when provided
4. Reads gog Gmail snapshot payloads when provided
5. Reads gog Calendar snapshot payloads when provided
6. Converts all inputs into WorldLoops signals
7. Sends the combined signals to the WorldLoops brief API
8. Returns one governed reconciliation brief as JSON
9. Preserves the no-external-write safety boundary

Use reconciliation mode when the user asks what is still unresolved across multiple sources.

Do not invent missing source data.
Do not send messages.
Do not send emails.
Do not create drafts.
Do not create or update calendar events.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.

## Connected gog snapshot mode

When the user wants WorldLoops to reconcile Gmail and Calendar snapshots through OpenClaw's bundled `gog` skill, use gog snapshot mode.

The bundled OpenClaw `gog` skill provides Google Workspace commands for Gmail and Calendar. WorldLoops can consume gog-style Gmail and Calendar JSON payloads and convert them into governed WorldLoops signals.

Safe gog snapshot command with local payload files:

npm run --silent openclaw:brief:gog -- --gmail <gog-gmail-messages.json> --calendar <gog-calendar-events.json> --json

Example using included fixtures:

npm run --silent openclaw:brief:gog -- --gmail scripts/fixtures/gog-gmail-messages.json --calendar scripts/fixtures/gog-calendar-events.json --json

This command does the following:

1. Reads local gog Gmail and/or Calendar snapshot JSON files
2. Converts Gmail messages and Calendar events into WorldLoops signals
3. Sends those signals to the WorldLoops brief API
4. Returns open loops and proposal candidates as JSON
5. Preserves the no-external-write safety boundary

Use gog snapshot mode for reconciliation-style analysis.

Gmail event mode answers: what just arrived?  
gog snapshot mode answers: what is still unresolved across recent Gmail and Calendar state?

Do not send emails.
Do not create drafts.
Do not create or update calendar events.
Do not send invites.
Do not write to Gmail, Calendar, Slack, GitHub, SMS, or push channels.

## Connected OpenClaw Calendar event mode

When the user wants WorldLoops to analyze Calendar event payloads from OpenClaw-connected workflows, use Calendar event mode.

Calendar event mode converts a local Calendar event payload into WorldLoops signals and returns a governed brief.

Safe Calendar event command:

npm run --silent openclaw:brief:calendar -- --input <calendar-events-payload.json> --json

Example using the included fixture:

npm run --silent openclaw:brief:calendar -- --input scripts/fixtures/openclaw-calendar-events.json --json

This command does the following:

1. Reads a local Calendar event payload JSON file
2. Converts Calendar events into WorldLoops signals
3. Sends those signals to the WorldLoops brief API
4. Returns open loops and proposal candidates as JSON
5. Preserves the no-external-write safety boundary

Calendar event mode is not a full Calendar reconciliation scan.

Do not invent Calendar events.
Do not create events.
Do not update meetings.
Do not send invites.
Do not write to Calendar, Gmail, Slack, GitHub, SMS, or push channels.

## Connected OpenClaw Gmail event mode

When the user wants WorldLoops to analyze Gmail events received through OpenClaw Gmail Pub/Sub or webhook flows, use Gmail event mode.

Gmail event mode converts an OpenClaw Gmail webhook payload into WorldLoops signals and returns a governed brief.

Safe Gmail event command:

npm run --silent openclaw:brief:gmail -- --input <gmail-webhook-payload.json> --json

Example using the included fixture:

npm run --silent openclaw:brief:gmail -- --input scripts/fixtures/openclaw-gmail-webhook.json --json

This command does the following:

1. Reads a local Gmail webhook payload JSON file
2. Converts Gmail events into WorldLoops signals
3. Sends those signals to the WorldLoops brief API
4. Returns open loops and proposal candidates as JSON
5. Preserves the no-external-write safety boundary

Gmail event mode is not a full inbox reconciliation scan.

Do not invent Gmail events.
Do not send emails.
Do not create drafts.
Do not modify Gmail labels.
Do not write to Gmail, Calendar, Slack, GitHub, SMS, or push channels.

## Connected OpenClaw message mode

When the user wants WorldLoops to analyze recent messages from an OpenClaw-connected channel, use message mode.

Message mode reads OpenClaw channel messages, converts them into WorldLoops signals, and returns a governed brief.

Safe message command:

npm run --silent openclaw:brief:messages -- --channel <channel> --target <target> --limit 50 --json

Example for Slack after the user provides or resolves a channel id:

npm run --silent openclaw:brief:messages -- --channel slack --target channel:C1234567890 --limit 50 --json

This command does the following:

1. Reads recent messages through OpenClaw
2. Converts messages into WorldLoops signals
3. Sends those signals to the WorldLoops brief API
4. Returns open loops and proposal candidates as JSON
5. Preserves the no-external-write safety boundary

Do not invent channel IDs.
Do not send messages.
Do not modify OpenClaw state.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.

## Connected OpenClaw mode

When the user wants WorldLoops to use OpenClaw's local state, use connected mode.

Connected mode currently reads OpenClaw commitments, converts them into WorldLoops signals, and returns a governed brief.

Safe connected command:

npm run --silent openclaw:brief:connected -- --from commitments --all --json

This command does the following:

1. Reads local OpenClaw commitments as JSON
2. Converts commitments into WorldLoops signals
3. Sends those signals to the WorldLoops brief API
4. Returns open loops and proposal candidates as JSON
5. Preserves the no-external-write safety boundary

If no commitments exist, return the empty successful result directly.

Do not invent commitments.
Do not send messages.
Do not modify OpenClaw state.
Do not write to Slack, Gmail, Calendar, GitHub, SMS, or push channels.

## Runtime invocation

When the user asks you to run this skill, do the following:

1. Change into the skill directory: `{baseDir}`
2. Run the command with `--silent` and `--json`
3. Use the user's provided signals file if available
4. If no file is provided, use `./examples/openclaw-signals.json`
5. Return the JSON result directly
6. Do not modify external systems

Safe default command from the skill directory:

npm run --silent openclaw:brief -- --input ./examples/openclaw-signals.json --json

If the user provides a file path:

npm run --silent openclaw:brief -- --input <signals-file.json> --json

Important:

- Use `--silent` so stdout contains JSON only.
- Use `--json` so both success and error responses are machine-readable.
- Do not send messages.
- Do not write to Slack, Gmail, GitHub, Calendar, SMS, or push channels.
- Treat the result as governed state, not execution.

## Runtime packaging

WorldLoops OpenClaw commands run from the compiled `dist/` runtime.

Before packaging, publishing, or copying this skill into an OpenClaw workspace, run:

npm run build

The public-facing OpenClaw commands use `node dist/...` entrypoints, not TypeScript source execution.

## Primary command

Use this command for machine-readable output:

npm run --silent openclaw:brief -- --input <signals-file.json> --json

Example:

npm run --silent openclaw:brief -- --input ./examples/openclaw-signals.json --json

## Input

The input file must contain a top-level signals array.

Supported signal sources:

- slack
- gmail
- calendar
- github
- manual

Each signal should include:

- source
- text
- optional url
- optional createdAt

## Output

On success, WorldLoops returns JSON with:

- ok: true
- brief
- openLoops
- proposalCandidates
- metadata
- safety.externalWrite: false

On failure, WorldLoops returns JSON with:

- ok: false
- error.code
- error.message
- safety.externalWrite: false

## Safety boundary

This skill is local-first and governed by default.

It does not send Slack messages.
It does not send emails.
It does not send SMS or push notifications.
It does not modify external systems.
It does not perform uncontrolled writes.

externalWrite remains false.

## When to use this skill

Use WorldLoops when the user asks:

- What open loops exist across my work signals?
- Which signals need review, reply, prep, or follow-up?
- Which work items should become proposal candidates?
- Can you turn these scattered signals into a governed brief?
- Can you produce machine-readable JSON for OpenClaw?

## When not to use this skill

Do not use this skill to directly send messages, modify tickets, write to Slack, send email, or mutate external systems.

WorldLoops prepares governed state.
It does not execute external actions.
