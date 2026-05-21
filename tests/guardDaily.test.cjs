'use strict';

const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');

const apiEnv = {
  ...process.env,
  WORLDLOOPS_API_BASE_URL: process.env.WORLDLOOPS_API_BASE_URL || 'https://api.worldloops.ai',
};

const FIXTURE_INBOX = 'scripts/fixtures/inbox';
const MISSING_INBOX = 'scripts/fixtures/inbox-nonexistent-empty';

console.log('\nguardDaily tests\n');

// ── helpers ───────────────────────────────────────────────────────────────────

function run(args, env) {
  return spawnSync('npm', ['run', '--silent', ...args], {
    encoding: 'utf8',
    env: env || apiEnv,
  });
}

function assertNoRawJson(output, label) {
  assert.ok(!output.trim().startsWith('{'), `${label}: must not start with raw JSON`);
  assert.ok(!output.includes('"openLoops":'), `${label}: must not contain "openLoops":`);
  assert.ok(!output.includes('"proposalCandidates":'), `${label}: must not contain "proposalCandidates":`);
}

function assertExternalWriteFalse(output, label) {
  assert.ok(
    output.includes('externalWrite: false') || output.includes('externalWrite:false'),
    `${label}: must include externalWrite:false`
  );
}

// ── Fixture files exist and contain no real user data ─────────────────────────

{
  const files = [
    `${FIXTURE_INBOX}/openclaw-gmail-live.json`,
    `${FIXTURE_INBOX}/openclaw-calendar-live.json`,
    `${FIXTURE_INBOX}/openclaw-slack-live.json`,
  ];
  for (const f of files) {
    assert.ok(fs.existsSync(f), `Fixture must exist: ${f}`);
    const content = fs.readFileSync(f, 'utf8');
    assert.ok(!content.includes('@gmail.com'), `${f}: must not contain real Gmail addresses`);
    const parsed = JSON.parse(content);
    assert.ok(typeof parsed === 'object' && parsed !== null, `${f}: must be valid JSON object`);
  }
  console.log('  PASS  fixture files exist and are valid JSON');
  console.log('  PASS  fixture files contain no real user data');
}

// ── guard:daily with all three fixtures exits 0 ───────────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(
    result.status, 0,
    `guard:daily all present: expected exit 0\n${result.stdout}\n${result.stderr}`
  );
  assert.ok(
    result.stdout.includes('Agent Execution Guard Daily Brief'),
    'guard:daily: must contain "Agent Execution Guard Daily Brief"'
  );
  assertNoRawJson(result.stdout, 'guard:daily');
  assertExternalWriteFalse(result.stdout, 'guard:daily');
  assert.ok(
    result.stdout.includes('Gmail'),
    'guard:daily: output must include Gmail source summary'
  );
  assert.ok(
    result.stdout.includes('Calendar'),
    'guard:daily: output must include Calendar source summary'
  );
  assert.ok(
    result.stdout.includes('Slack'),
    'guard:daily: output must include Slack source summary'
  );
  assert.ok(
    !result.stdout.includes('Invalid adapter signal'),
    'guard:daily: must not contain "Invalid adapter signal"'
  );
  console.log('  PASS  guard:daily all present: exits 0');
  console.log('  PASS  guard:daily: contains "Agent Execution Guard Daily Brief"');
  console.log('  PASS  guard:daily: no raw JSON');
  console.log('  PASS  guard:daily: externalWrite:false present');
  console.log('  PASS  guard:daily: Gmail source summary present');
  console.log('  PASS  guard:daily: Calendar source summary present');
  console.log('  PASS  guard:daily: Slack source summary present');
  console.log('  PASS  guard:daily: no "Invalid adapter signal"');
}

// ── brief:daily alias exits 0 ─────────────────────────────────────────────────

{
  const result = run(['brief:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(
    result.status, 0,
    `brief:daily: expected exit 0\n${result.stdout}\n${result.stderr}`
  );
  assert.ok(
    result.stdout.includes('Agent Execution Guard Daily Brief'),
    'brief:daily: must contain "Agent Execution Guard Daily Brief"'
  );
  assertNoRawJson(result.stdout, 'brief:daily');
  assertExternalWriteFalse(result.stdout, 'brief:daily');
  console.log('  PASS  brief:daily: exits 0');
  console.log('  PASS  brief:daily: contains "Agent Execution Guard Daily Brief"');
  console.log('  PASS  brief:daily: no raw JSON');
  console.log('  PASS  brief:daily: externalWrite:false present');
}

// ── all-missing case exits 0 with helpful instructions ────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', MISSING_INBOX]);
  assert.strictEqual(
    result.status, 0,
    `guard:daily all-missing: expected exit 0\n${result.stdout}\n${result.stderr}`
  );
  assert.ok(
    result.stdout.includes('Agent Execution Guard Daily Brief'),
    'guard:daily all-missing: must contain "Agent Execution Guard Daily Brief"'
  );
  assert.ok(
    result.stdout.includes('No local handoff payloads found'),
    'guard:daily all-missing: must say "No local handoff payloads found"'
  );
  assert.ok(
    result.stdout.includes('openclaw-gmail-live.json'),
    'guard:daily all-missing: must list expected Gmail file'
  );
  assert.ok(
    result.stdout.includes('openclaw-calendar-live.json'),
    'guard:daily all-missing: must list expected Calendar file'
  );
  assert.ok(
    result.stdout.includes('openclaw-slack-live.json'),
    'guard:daily all-missing: must list expected Slack file'
  );
  assertExternalWriteFalse(result.stdout, 'guard:daily all-missing');
  assertNoRawJson(result.stdout, 'guard:daily all-missing');
  console.log('  PASS  guard:daily all-missing: exits 0');
  console.log('  PASS  guard:daily all-missing: contains "Agent Execution Guard Daily Brief"');
  console.log('  PASS  guard:daily all-missing: "No local handoff payloads found" present');
  console.log('  PASS  guard:daily all-missing: expected file paths listed');
  console.log('  PASS  guard:daily all-missing: externalWrite:false present');
  console.log('  PASS  guard:daily all-missing: no raw JSON');
}

// ── no connector / OAuth / fetch in dist/scripts/guardDaily.js ────────────────

{
  const src = fs.readFileSync('dist/scripts/guardDaily.js', 'utf8');
  assert.ok(!src.includes('googleapis'), 'guardDaily: must not reference googleapis');
  assert.ok(!src.includes('OAuth'), 'guardDaily: must not reference OAuth');
  assert.ok(!src.includes('graph.microsoft.com'), 'guardDaily: must not reference MS Graph');
  assert.ok(!src.includes("fetch('"), 'guardDaily: must not contain fetch() with single-quote string');
  assert.ok(!src.includes('fetch("'), 'guardDaily: must not contain fetch() with double-quote string');
  console.log('  PASS  guardDaily: no connector/OAuth/fetch behavior introduced');
}

// ── package.json: version, scripts ────────────────────────────────────────────

{
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.strictEqual(pkg.version, '1.9.1', 'package.json: version must be 1.9.1');
  assert.ok(pkg.scripts['guard:daily'], 'package.json: guard:daily script must exist');
  assert.ok(pkg.scripts['brief:daily'], 'package.json: brief:daily script must exist');
  assert.ok(
    pkg.scripts['guard:daily'].includes('guardDaily.js'),
    'package.json: guard:daily must use guardDaily.js'
  );
  assert.ok(
    pkg.scripts['brief:daily'].includes('guardDaily.js'),
    'package.json: brief:daily must alias guardDaily.js'
  );
  assert.ok(pkg.scripts['test:guard-daily'], 'package.json: test:guard-daily script must exist');
  console.log('  PASS  package.json: version is 1.9.1');
  console.log('  PASS  package.json: guard:daily and brief:daily scripts present');
  console.log('  PASS  package.json: both scripts use guardDaily.js');
  console.log('  PASS  package.json: test:guard-daily script present');
}

// ── v1.9.1: Why / Evidence lines present in fixture output ───────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily Why/Evidence: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('Why:'),
    'guard:daily: output must include at least one Why: line'
  );
  assert.ok(
    result.stdout.includes('Evidence:'),
    'guard:daily: output must include at least one Evidence: line'
  );
  assert.ok(
    result.stdout.includes('Action:'),
    'guard:daily: output must include at least one Action: line'
  );
  assert.ok(
    result.stdout.includes('Adjudication:'),
    'guard:daily: output must include at least one Adjudication: line'
  );
  console.log('  PASS  guard:daily: Why: line present');
  console.log('  PASS  guard:daily: Evidence: line present');
  console.log('  PASS  guard:daily: Action: line present');
  console.log('  PASS  guard:daily: Adjudication: line present');
}

// ── v1.9.1: Gmail evidence from payload ──────────────────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  // Gmail fixture has "Please follow up on the proposal we discussed"
  // Evidence line should contain a snippet from that message
  const hasGmailEvidence =
    result.stdout.includes('Evidence:') &&
    (result.stdout.includes('proposal') || result.stdout.includes('follow up') ||
     result.stdout.includes('Follow-up') || result.stdout.includes('follow-up'));
  assert.ok(hasGmailEvidence, 'guard:daily: Gmail evidence must reference fixture snippet');
  console.log('  PASS  guard:daily: Gmail summary includes evidence from payload');
}

// ── v1.9.1: Slack evidence from payload ──────────────────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  // Slack fixture has "Can you review the action items from today's standup"
  const hasSlackEvidence =
    result.stdout.includes('Evidence:') &&
    (result.stdout.includes('standup') || result.stdout.includes('action items') ||
     result.stdout.includes('review'));
  assert.ok(hasSlackEvidence, 'guard:daily: Slack evidence must reference fixture snippet');
  console.log('  PASS  guard:daily: Slack summary includes evidence from payload');
}

// ── v1.9.1: Calendar no-action shows checked count ──────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  // Calendar fixture has 1 event; if no candidates, should show "Checked:" or "Reason:"
  const hasCalendarDetail =
    result.stdout.includes('Checked:') || result.stdout.includes('Reason:') ||
    result.stdout.includes('Calendar — No actionable') || result.stdout.includes('Calendar — Preparation');
  assert.ok(hasCalendarDetail, 'guard:daily: Calendar summary must include checked count or reason');
  console.log('  PASS  guard:daily: Calendar no-action summary includes checked count or reason');
}

// ── v1.9.1: output does not contain raw JSON ─────────────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.ok(!result.stdout.includes('"messages":'), 'guard:daily: must not contain raw "messages": JSON');
  assert.ok(!result.stdout.includes('"events":'), 'guard:daily: must not contain raw "events": JSON');
  assert.ok(!result.stdout.includes('"channel_id":'), 'guard:daily: must not contain raw channel_id JSON');
  console.log('  PASS  guard:daily: output does not contain raw JSON fields');
}

// ── v1.9.1: default schedule says local time, not UTC ────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.ok(
    result.stdout.includes('local time'),
    'guard:daily: default schedule must say "local time"'
  );
  assert.ok(
    !result.stdout.includes('(UTC)'),
    'guard:daily: default schedule must not say "(UTC)"'
  );
  console.log('  PASS  guard:daily: default schedule says "local time"');
  console.log('  PASS  guard:daily: default schedule does not say "(UTC)"');
}

// ── v1.9.1: all-missing output shorter, still has paths and externalWrite ────

{
  const result = run(['guard:daily', '--', '--inbox', MISSING_INBOX]);
  assert.ok(
    result.stdout.includes('openclaw-gmail-live.json'),
    'guard:daily all-missing: must list Gmail path'
  );
  assert.ok(
    result.stdout.includes('openclaw-calendar-live.json'),
    'guard:daily all-missing: must list Calendar path'
  );
  assert.ok(
    result.stdout.includes('openclaw-slack-live.json'),
    'guard:daily all-missing: must list Slack path'
  );
  assertExternalWriteFalse(result.stdout, 'guard:daily all-missing v1.9.1');
  // Should be shorter than before — no long paragraph
  assert.ok(
    !result.stdout.includes('OpenClaw/gog/host tools should read the external systems'),
    'guard:daily all-missing: old verbose text must be removed'
  );
  console.log('  PASS  guard:daily all-missing: three expected paths listed');
  console.log('  PASS  guard:daily all-missing: externalWrite:false present');
  console.log('  PASS  guard:daily all-missing: verbose onboarding text removed');
}

// ── v1.9.1: SKILL.md Daily Brief routing instruction ─────────────────────────

{
  const skill = fs.readFileSync('SKILL.md', 'utf8');
  const runtimeIdx = skill.indexOf('## Agent Runtime Instructions');
  assert.ok(runtimeIdx !== -1, 'SKILL.md: must contain ## Agent Runtime Instructions section');
  const runtimeSection = skill.slice(runtimeIdx);

  assert.ok(
    runtimeSection.includes('npm run --silent guard:daily'),
    'SKILL.md: runtime section must include "npm run --silent guard:daily"'
  );
  assert.ok(
    runtimeSection.includes('Return only the command output'),
    'SKILL.md: must tell agents to return only command output'
  );
  assert.ok(
    runtimeSection.includes('Daily Brief') && runtimeSection.includes('morning brief'),
    'SKILL.md: Daily Brief routing must list trigger phrases'
  );
  console.log('  PASS  SKILL.md: Daily Brief routing instruction present');
  console.log('  PASS  SKILL.md: npm run --silent guard:daily in runtime section');
  console.log('  PASS  SKILL.md: return only command output instruction present');
}

// ── SKILL.md: Daily Brief section present ─────────────────────────────────────

{
  const skill = fs.readFileSync('SKILL.md', 'utf8');
  const runtimeIdx = skill.indexOf('## Agent Runtime Instructions');
  assert.ok(runtimeIdx !== -1, 'SKILL.md: must contain ## Agent Runtime Instructions section');
  const publicSection = skill.slice(0, runtimeIdx);

  assert.ok(
    publicSection.includes('Daily Brief'),
    'SKILL.md: public section must contain Daily Brief'
  );
  assert.ok(
    publicSection.includes('guard:daily'),
    'SKILL.md: must include guard:daily command'
  );
  assert.ok(
    publicSection.includes('brief:daily'),
    'SKILL.md: must include brief:daily command'
  );
  console.log('  PASS  SKILL.md: Daily Brief section present');
  console.log('  PASS  SKILL.md: guard:daily command present');
  console.log('  PASS  SKILL.md: brief:daily command present');
}

// ── v1.9.1: SKILL.md examples use Why / Evidence / local time ────────────────

{
  const skill = fs.readFileSync('SKILL.md', 'utf8');
  const runtimeIdx = skill.indexOf('## Agent Runtime Instructions');
  const publicSection = skill.slice(0, runtimeIdx);

  assert.ok(publicSection.includes('Why:'), 'SKILL.md: example must contain Why:');
  assert.ok(publicSection.includes('Evidence:'), 'SKILL.md: example must contain Evidence:');
  assert.ok(publicSection.includes('Action:'), 'SKILL.md: example must contain Action:');
  assert.ok(publicSection.includes('Adjudication:'), 'SKILL.md: example must contain Adjudication:');
  assert.ok(
    publicSection.includes('09:00 local time'),
    'SKILL.md: example must use "09:00 local time" not UTC'
  );
  assert.ok(
    !publicSection.includes('09:00 (UTC)'),
    'SKILL.md: example must not use "09:00 (UTC)"'
  );
  assert.ok(
    publicSection.includes('No local handoff payloads found yet'),
    'SKILL.md: must contain missing-payload onboarding example'
  );
  assert.ok(publicSection.includes('externalWrite:false'), 'SKILL.md: example must contain externalWrite:false');
  console.log('  PASS  SKILL.md: example contains Why/Evidence/Action/Adjudication');
  console.log('  PASS  SKILL.md: example uses "09:00 local time"');
  console.log('  PASS  SKILL.md: missing-payload onboarding example present');
  console.log('  PASS  SKILL.md: example contains externalWrite:false');
}

// ── v1.9.1: README.md examples use Why / Evidence / local time ───────────────

{
  const readme = fs.readFileSync('README.md', 'utf8');
  assert.ok(readme.includes('Why:'), 'README.md: example must contain Why:');
  assert.ok(readme.includes('Evidence:'), 'README.md: example must contain Evidence:');
  assert.ok(readme.includes('Action:'), 'README.md: example must contain Action:');
  assert.ok(readme.includes('Adjudication:'), 'README.md: example must contain Adjudication:');
  assert.ok(
    readme.includes('09:00 local time'),
    'README.md: example must use "09:00 local time"'
  );
  assert.ok(
    !readme.includes('09:00 (UTC)'),
    'README.md: example must not use "09:00 (UTC)"'
  );
  assert.ok(
    readme.includes('No local handoff payloads found yet'),
    'README.md: must contain missing-payload onboarding example'
  );
  assert.ok(readme.includes('externalWrite:false'), 'README.md: example must contain externalWrite:false');
  console.log('  PASS  README.md: example contains Why/Evidence/Action/Adjudication');
  console.log('  PASS  README.md: example uses "09:00 local time"');
  console.log('  PASS  README.md: missing-payload onboarding example present');
  console.log('  PASS  README.md: example contains externalWrite:false');
}

// ── README.md: Daily Brief section present ────────────────────────────────────

{
  const readme = fs.readFileSync('README.md', 'utf8');
  assert.ok(
    readme.includes('Daily Brief'),
    'README.md: must contain Daily Brief section'
  );
  assert.ok(
    readme.includes('guard:daily'),
    'README.md: must include guard:daily command'
  );
  console.log('  PASS  README.md: Daily Brief section present');
  console.log('  PASS  README.md: guard:daily command present');
}

// ── CHANGELOG.md: v1.9.1 and v1.9.0 entries ─────────────────────────────────

{
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  assert.ok(
    changelog.includes('v1.9.1'),
    'CHANGELOG.md: must contain v1.9.1 entry'
  );
  assert.ok(
    changelog.includes('v1.9.0'),
    'CHANGELOG.md: must contain v1.9.0 entry'
  );
  assert.ok(
    changelog.includes('Daily Brief'),
    'CHANGELOG.md: must mention Daily Brief'
  );
  console.log('  PASS  CHANGELOG.md: v1.9.1 entry present');
  console.log('  PASS  CHANGELOG.md: v1.9.0 entry present');
}

console.log('\nguardDaily: all assertions passed\n');
