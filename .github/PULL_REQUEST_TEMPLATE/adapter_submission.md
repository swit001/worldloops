## Community Adapter Submission

**Source:** <!-- e.g. linear, notion, jira, pagerduty -->
**SourceType:** <!-- e.g. issue, task, ticket, alert -->
**Fixture file:** `examples/adapters/community/<source>-<sourceType>.example.json`

---

## Description

<!-- Briefly describe the connector and what kind of signal this adapter reads. -->

---

## Fixture Validation

- [ ] Fixture is in `examples/adapters/community/`
- [ ] Filename follows convention: `<source>-<sourceType>.example.json`
- [ ] `externalWrite` is `false`
- [ ] `text` is a non-empty string
- [ ] `observedAt` is a valid ISO 8601 timestamp
- [ ] `metadata.adapterStatus` is set to `"community"`
- [ ] No real credentials, tokens, or personal data in the fixture

## Test Results

- [ ] `npm run adapter:validate -- examples/adapters/community/<file>.example.json` exits with `ok: true`
- [ ] `npm run test:adapter-community` passes
- [ ] `npm run smoke` passes

## Safety

- [ ] No new connectors added
- [ ] No external writes
- [ ] `externalWrite: false` preserved

---

<!-- See CONTRIBUTING.md for the full submission guide and ADAPTER_GUIDE.md for the AdapterSignal field reference. -->
