const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

const {
  buildOpenLoopStateFromProposal,
  saveOpenLoopState,
} = require('../dist/storage/openLoopStates');

// ── empty state ──────────────────────────────────────────────────────────────

const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'worldloops-loop-list-empty-'));

const emptyResult = spawnSync(
  process.execPath,
  ['dist/scripts/loopList.js'],
  {
    env: { ...process.env, WORLDLOOPS_DIR: emptyDir },
    encoding: 'utf8',
  }
);

assert.strictEqual(emptyResult.status, 0, `expected exit 0, got ${emptyResult.status}: ${emptyResult.stderr}`);
assert.ok(
  emptyResult.stdout.trim() === 'No open loops found.',
  `expected empty-state message, got: ${JSON.stringify(emptyResult.stdout)}`
);

// ── populated state ──────────────────────────────────────────────────────────

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'worldloops-loop-list-'));
process.env.WORLDLOOPS_DIR = tmpDir;

const candidate = {
  idempotencyKey: 'gmail-loop-list-test',
  entityType: 'work_signal',
  source: 'gmail',
  currentState: 'open',
  proposedState: 'needs_reply',
  reason: 'follow-up needed',
  approvalRequired: true,
  actionHint: 'Draft a reply to the customer',
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

// ── compact table (default) ──────────────────────────────────────────────────

const tableResult = execFileSync(
  process.execPath,
  ['dist/scripts/loopList.js'],
  {
    env: { ...process.env, WORLDLOOPS_DIR: tmpDir },
    encoding: 'utf8',
  }
);

// must NOT be JSON
assert.throws(
  () => JSON.parse(tableResult),
  'default output should not be valid JSON'
);

// must contain key columns
assert.ok(tableResult.includes(loop.id), 'table should include loop id');
assert.ok(tableResult.includes(loop.status), 'table should include status');
assert.ok(tableResult.includes(loop.severity), 'table should include severity');
assert.ok(tableResult.includes('Draft a reply'), 'table should include truncated title');
assert.ok(tableResult.includes('UPDATED AT'), 'table should include header');

// ── --json flag ──────────────────────────────────────────────────────────────

const jsonOutput = execFileSync(
  process.execPath,
  ['dist/scripts/loopList.js', '--json'],
  {
    env: { ...process.env, WORLDLOOPS_DIR: tmpDir },
    encoding: 'utf8',
  }
);

const parsed = JSON.parse(jsonOutput);

assert.strictEqual(parsed.ok, true);
assert.strictEqual(parsed.source, 'worldloops.local');
assert.strictEqual(parsed.count, 1);
assert.strictEqual(parsed.loops.length, 1);
assert.strictEqual(parsed.loops[0].id, loop.id);
assert.strictEqual(parsed.loops[0].status, loop.status);
assert.strictEqual(parsed.loops[0].severity, loop.severity);
assert.strictEqual(parsed.safety.externalWrite, false);
assert.ok(parsed.capabilityBoundary, '--json output should include capabilityBoundary');
assert.ok(parsed.path, '--json output should include path');

console.log('loopList tests passed');
