import { spawnSync } from 'node:child_process';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

console.log('\nsmoke:reconcile\n');

const result = spawnSync(
  'npm',
  [
    'run',
    '--silent',
    'brief:reconcile',
    '--',
    '--gmail-event',
    'scripts/fixtures/openclaw-gmail-webhook.json',
    '--calendar-event',
    'scripts/fixtures/openclaw-calendar-events.json',
    '--gog-gmail',
    'scripts/fixtures/gog-gmail-messages.json',
    '--gog-calendar',
    'scripts/fixtures/gog-calendar-events.json'
  ],
  {
    encoding: 'utf8',
    env: {
      ...process.env,
      WORLDLOOPS_API_BASE_URL:
        process.env.WORLDLOOPS_API_BASE_URL || 'https://worldloops-api.vercel.app',
    },
  }
);

assert(result.status === 0, `expected exit 0\n${result.stdout}\n${result.stderr}`);

let parsed;
try {
  parsed = JSON.parse(result.stdout);
} catch (err) {
  throw new Error(`stdout is not JSON:\n${result.stdout}\n${err}`);
}

assert(typeof parsed.ok === 'boolean', 'ok should be boolean');
assert(parsed.safety?.externalWrite === false, 'externalWrite should be false');

if (parsed.ok) {
  assert(Array.isArray(parsed.openLoops), 'openLoops should be an array');
  assert(Array.isArray(parsed.proposalCandidates), 'proposalCandidates should be an array');
}

console.log('  PASS  public reconcile command returns stable JSON');
console.log('  PASS  safety.externalWrite is false');
console.log('\n2 tests — 2 passed, 0 failed\n');
