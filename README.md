# WorldLoops

**OpenClaw sees the signals. WorldLoops connects the loops.**

Website: https://worldloops.ai

WorldLoops is a public ClawHub skill, API wrapper, and adapter example set for turning connected work signals into governed open-loop proposals.

This public repository contains:

- OpenClaw skill metadata
- public signal adapters
- input/output schemas
- safe examples and fixtures
- a thin API wrapper for the WorldLoops brief API

It does not contain the private WorldLoops reasoning engine.

## How it works

OpenClaw connectors and tools observe work signals.

WorldLoops adapters convert those signals into a common signal shape.

The WorldLoops API returns:

- brief
- open loops
- proposal candidates
- safety metadata

## Safety

WorldLoops does not send messages.
WorldLoops does not send emails.
WorldLoops does not create calendar events.
WorldLoops does not modify external systems.

`externalWrite` remains `false`.

## Environment

By default, WorldLoops uses the production API:

WORLDLOOPS_API_BASE_URL=https://api.worldloops.ai

You do not need to set this value for the default demo flow.

To use a different backend, override it with:

WORLDLOOPS_API_BASE_URL=https://your-worldloops-api.example.com

Optional:

WORLDLOOPS_API_KEY=your_api_key

## Example

Install and build:

npm install
npm run build

Run a reconciliation brief using included fixtures:

npm run brief:reconcile -- \
  --gmail-event scripts/fixtures/openclaw-gmail-webhook.json \
  --calendar-event scripts/fixtures/openclaw-calendar-events.json \
  --gog-gmail scripts/fixtures/gog-gmail-messages.json \
  --gog-calendar scripts/fixtures/gog-calendar-events.json

## Public boundary

This public skill exposes adapters and schemas.

The private WorldLoops reasoning engine remains behind the WorldLoops API.

Public:

- signal types
- adapter examples
- schemas
- fixtures
- API wrapper

Private:

- open-loop detection logic
- cross-source scoring
- canonicalization
- proposal generation internals
- learning and governance internals
