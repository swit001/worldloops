'use strict';

const assert = require('node:assert');
const { spawnSync } = require('node:child_process');

function runWowMobile() {
  return spawnSync(process.execPath, ['dist/scripts/demoWowMobile.js'], { encoding: 'utf8' });
}

{
  const result = runWowMobile();
  assert.strictEqual(result.status, 0, 'wow:mobile exits 0');
  assert.ok(result.stdout.includes('6 open loops'), 'wow:mobile includes 6 open loops');
  assert.ok(result.stdout.includes('Nothing executes without approval'), 'wow:mobile includes safety message');
  assert.ok(result.stdout.includes('0 emails sent'), 'wow:mobile includes email safety');
  assert.ok(result.stdout.includes('0 calendar events changed'), 'wow:mobile includes calendar safety');
  console.log('wow:mobile: all assertions passed');
}
