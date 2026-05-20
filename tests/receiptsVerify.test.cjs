const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { checkReceipts } = require('../dist/state/checkWorldState');

function mkTmp(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `worldloops-receipts-verify-${label}-`));
}

function writeJson(dir, filename, data) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function runReceiptsVerify(dir, extraArgs) {
  return spawnSync(
    process.execPath,
    ['dist/scripts/receiptsVerify.js', ...(extraArgs ?? [])],
    { env: { ...process.env, WORLDLOOPS_DIR: dir }, encoding: 'utf8' }
  );
}

function makeTransReceipt(overrides) {
  return {
    id: `tr-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    proposalId: null,
    sourceSignalsObserved: [],
    normalizedResponsibility: null,
    proposedTransition: null,
    reason: null,
    adjudicationResult: null,
    boundaryCrossed: 'local_commit',
    externalWrite: false,
    actor: null,
    decision: null,
    unresolvedState: null,
    redactions: { applied: false, fields: [] },
    ...overrides,
  };
}

function makeDecReceipt(proposalId, overrides) {
  return {
    id: `dr-${Math.random().toString(36).slice(2)}`,
    proposalId,
    templateId: 'file-write',
    decision: 'approved',
    previousStatus: 'proposed',
    newStatus: 'approved',
    actor: 'worldloops.local',
    note: null,
    boundaryCrossed: 'local_commit',
    externalWrite: false,
    createdAt: new Date().toISOString(),
    source: 'worldloops.local',
    ...overrides,
  };
}

// ── empty / missing .worldloops passes ────────────────────────────────────────

{
  const tmpDir = mkTmp('empty');
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, true, 'empty dir: should pass');
  assert.strictEqual(result.status, 'passed');
  assert.strictEqual(result.summary.filesChecked, 0);
  assert.strictEqual(result.summary.issues, 0);
  assert.strictEqual(result.safety.externalWrite, false);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── valid receipts pass ───────────────────────────────────────────────────────

{
  const tmpDir = mkTmp('valid');
  const propId = 'prop-valid';
  writeJson(tmpDir, 'proposals.json', [
    { id: propId, externalWrite: false },
  ]);
  writeJson(tmpDir, 'transition_receipts.json', [
    makeTransReceipt({ id: 'tr-1', proposalId: propId }),
    makeTransReceipt({ id: 'tr-2', proposalId: null }),
  ]);
  writeJson(tmpDir, 'proposal_decision_receipts.json', [
    makeDecReceipt(propId, { id: 'dr-1' }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, true, 'valid receipts: should pass');
  assert.strictEqual(result.summary.issues, 0);
  assert.strictEqual(result.summary.filesChecked, 2);
  assert.strictEqual(result.safety.externalWrite, false);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── malformed transition_receipts.json fails ─────────────────────────────────

{
  const tmpDir = mkTmp('malformed-trans');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'transition_receipts.json'), '{{bad}}', 'utf8');
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'malformed transition_receipts: should fail');
  assert.ok(result.issues.some((i) => i.code === 'MALFORMED_JSON'), 'should report MALFORMED_JSON');
  assert.strictEqual(result.safety.externalWrite, false);
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── malformed proposal_decision_receipts.json fails ──────────────────────────

{
  const tmpDir = mkTmp('malformed-dec');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'proposal_decision_receipts.json'), 'not json at all', 'utf8');
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'malformed decision receipts: should fail');
  assert.ok(result.issues.some((i) => i.code === 'MALFORMED_JSON'), 'should report MALFORMED_JSON');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── duplicate receipt ids (transition) fail ───────────────────────────────────

{
  const tmpDir = mkTmp('dup-trans-id');
  const receipt = makeTransReceipt({ id: 'tr-dupe' });
  writeJson(tmpDir, 'transition_receipts.json', [receipt, { ...receipt }]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'duplicate transition receipt id: should fail');
  assert.ok(result.issues.some((i) => i.code === 'DUPLICATE_RECEIPT_ID'), 'should report DUPLICATE_RECEIPT_ID');
  assert.ok(result.issues.some((i) => i.referenceId === 'tr-dupe'), 'should include referenceId');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── duplicate receipt ids (decision) fail ────────────────────────────────────

{
  const tmpDir = mkTmp('dup-dec-id');
  const receipt = makeDecReceipt('prop-1', { id: 'dr-dupe' });
  writeJson(tmpDir, 'proposal_decision_receipts.json', [receipt, { ...receipt }]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'duplicate decision receipt id: should fail');
  assert.ok(result.issues.some((i) => i.code === 'DUPLICATE_RECEIPT_ID'), 'should report DUPLICATE_RECEIPT_ID');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── externalWrite violation in transition receipt fails ───────────────────────

{
  const tmpDir = mkTmp('ew-trans');
  writeJson(tmpDir, 'transition_receipts.json', [
    makeTransReceipt({ id: 'tr-bad', externalWrite: true }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'receipt externalWrite:true: should fail');
  assert.ok(result.issues.some((i) => i.code === 'EXTERNAL_WRITE_VIOLATION'), 'should report EXTERNAL_WRITE_VIOLATION');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── externalWrite violation in decision receipt fails ─────────────────────────

{
  const tmpDir = mkTmp('ew-dec');
  writeJson(tmpDir, 'proposal_decision_receipts.json', [
    makeDecReceipt('prop-1', { id: 'dr-bad', externalWrite: true }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'decision receipt externalWrite:true: should fail');
  assert.ok(result.issues.some((i) => i.code === 'EXTERNAL_WRITE_VIOLATION'), 'should report EXTERNAL_WRITE_VIOLATION');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── invalid boundaryCrossed in transition receipt fails ───────────────────────

{
  const tmpDir = mkTmp('bad-boundary-trans');
  writeJson(tmpDir, 'transition_receipts.json', [
    makeTransReceipt({ id: 'tr-bc', boundaryCrossed: 'full_write' }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'invalid boundaryCrossed: should fail');
  assert.ok(result.issues.some((i) => i.code === 'INVALID_BOUNDARY_CROSSED'), 'should report INVALID_BOUNDARY_CROSSED');
  assert.ok(result.issues.some((i) => i.referenceId === 'tr-bc'), 'should include referenceId');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── invalid boundaryCrossed in decision receipt fails ─────────────────────────

{
  const tmpDir = mkTmp('bad-boundary-dec');
  writeJson(tmpDir, 'proposal_decision_receipts.json', [
    makeDecReceipt('prop-1', { id: 'dr-bc', boundaryCrossed: 'external_write_allowed' }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'invalid boundaryCrossed in dec receipt: should fail');
  assert.ok(result.issues.some((i) => i.code === 'INVALID_BOUNDARY_CROSSED'), 'should report INVALID_BOUNDARY_CROSSED');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── valid boundaryCrossed values all pass ─────────────────────────────────────

{
  const tmpDir = mkTmp('valid-boundary');
  writeJson(tmpDir, 'transition_receipts.json', [
    makeTransReceipt({ id: 'tr-ro', boundaryCrossed: 'read_only' }),
    makeTransReceipt({ id: 'tr-lc', boundaryCrossed: 'local_commit' }),
    makeTransReceipt({ id: 'tr-ew', boundaryCrossed: 'external_write' }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, true, 'valid boundary values: should pass');
  assert.ok(!result.issues.some((i) => i.code === 'INVALID_BOUNDARY_CROSSED'), 'should not report INVALID_BOUNDARY_CROSSED');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── decision receipt referencing missing proposal fails ───────────────────────

{
  const tmpDir = mkTmp('dec-missing-prop');
  writeJson(tmpDir, 'proposals.json', [
    { id: 'prop-exists', externalWrite: false },
  ]);
  writeJson(tmpDir, 'proposal_decision_receipts.json', [
    makeDecReceipt('prop-gone', { id: 'dr-orphan' }),
  ]);
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.ok, false, 'decision receipt missing proposal: should fail');
  assert.ok(result.issues.some((i) => i.code === 'RECEIPT_MISSING_PROPOSAL'), 'should report RECEIPT_MISSING_PROPOSAL');
  assert.ok(result.issues.some((i) => i.referenceId === 'prop-gone'), 'should include referenceId');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── --json output is valid JSON ───────────────────────────────────────────────

{
  const tmpDir = mkTmp('json-output');
  const proc = runReceiptsVerify(tmpDir, ['--json']);
  const parsed = JSON.parse(proc.stdout);
  assert.ok(typeof parsed === 'object', '--json: output should be an object');
  assert.ok('ok' in parsed, '--json: output should have ok field');
  assert.ok('status' in parsed, '--json: output should have status field');
  assert.ok('summary' in parsed, '--json: output should have summary field');
  assert.ok('issues' in parsed, '--json: output should have issues field');
  assert.ok('safety' in parsed, '--json: output should have safety field');
  assert.strictEqual(parsed.safety.externalWrite, false, '--json: safety.externalWrite must be false');
  assert.ok(Array.isArray(parsed.issues), '--json: issues should be an array');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── CLI exits 0 on pass, 1 on fail ───────────────────────────────────────────

{
  const passDir = mkTmp('cli-pass');
  const passProc = runReceiptsVerify(passDir, ['--json']);
  assert.strictEqual(passProc.status, 0, 'CLI should exit 0 when passing');
  fs.rmSync(passDir, { recursive: true, force: true });
}

{
  const failDir = mkTmp('cli-fail');
  fs.mkdirSync(failDir, { recursive: true });
  fs.writeFileSync(path.join(failDir, 'transition_receipts.json'), 'garbage', 'utf8');
  const failProc = runReceiptsVerify(failDir, ['--json']);
  assert.strictEqual(failProc.status, 1, 'CLI should exit 1 when failing');
  fs.rmSync(failDir, { recursive: true, force: true });
}

// ── safety.externalWrite is always false ──────────────────────────────────────

{
  const tmpDir = mkTmp('safety');
  const result = checkReceipts({ worldloopsDir: tmpDir });
  assert.strictEqual(result.safety.externalWrite, false, 'safety.externalWrite must always be false');
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log('receiptsVerify tests passed');
