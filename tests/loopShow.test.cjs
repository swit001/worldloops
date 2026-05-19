const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'worldloops-loop-show-'));
process.env.WORLDLOOPS_DIR = tmpDir;

const {
  buildOpenLoopStateFromProposal,
  saveOpenLoopState,
} = require('../dist/storage/openLoopStates');

const candidate = {
  idempotencyKey: 'gmail-loop-show-test',
  entityType: 'work_signal',
  source: 'gmail',
  currentState: 'open',
  proposedState: 'needs_reply',
  reason: 'follow-up needed',
  approvalRequired: true,
  actionHint: 'Draft a reply',
  severity: 'high',
};

const signals = [
  {
    source: 'gmail',
    text: 'Please reply to this customer.',
    createdAt: '2026-05-18T00:00:00.000Z',
  },
];

const loop = buildOpenLoopStateFromProposal(candidate, signals);
saveOpenLoopState(loop);

const output = execFileSync(
  process.execPath,
  ['dist/scripts/loopShow.js', loop.id],
  {
    env: {
      ...process.env,
      WORLDLOOPS_DIR: tmpDir,
    },
    encoding: 'utf8',
  }
);

const json = JSON.parse(output);

assert.strictEqual(json.ok, true);
assert.strictEqual(json.source, 'worldloops.local');
assert.strictEqual(json.loop.id, loop.id);
assert.strictEqual(json.loop.canonicalKey, 'gmail-loop-show-test');
assert.strictEqual(json.loop.status, 'todo');
assert.strictEqual(json.loop.severity, 'high');
assert.strictEqual(json.loop.adjudication.action, 'require_approval');
assert.strictEqual(json.loop.sourceSignals.length, 1);
assert.strictEqual(json.loop.sourceSignals[0].source, 'gmail');
assert.strictEqual(json.loop.safety.externalWrite, false);
assert.strictEqual(json.safety.externalWrite, false);
assert.strictEqual(json.capabilityBoundary.externalWrite, false);

const missingResult = spawnSync(
  process.execPath,
  ['dist/scripts/loopShow.js', 'missing-loop-id'],
  {
    env: {
      ...process.env,
      WORLDLOOPS_DIR: tmpDir,
    },
    encoding: 'utf8',
  }
);

assert.strictEqual(missingResult.status, 1);

const missingJson = JSON.parse(missingResult.stdout);

assert.strictEqual(missingJson.ok, false);
assert.strictEqual(missingJson.error.code, 'LOOP_NOT_FOUND');
assert.strictEqual(missingJson.safety.externalWrite, false);
assert.ok(Array.isArray(missingJson.availableLoopIds));
assert.strictEqual(missingJson.availableLoopIds.length, 1);

console.log('loopShow tests passed');
