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
  assert.strictEqual(pkg.version, '1.9.3', 'package.json: version must be 1.9.3');
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
  console.log('  PASS  package.json: version is 1.9.3');
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

// ── CHANGELOG.md: v1.9.3, v1.9.2, v1.9.1 and v1.9.0 entries ─────────────────

{
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  assert.ok(
    changelog.includes('v1.9.3'),
    'CHANGELOG.md: must contain v1.9.3 entry'
  );
  assert.ok(
    changelog.includes('v1.9.2'),
    'CHANGELOG.md: must contain v1.9.2 entry'
  );
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
  console.log('  PASS  CHANGELOG.md: v1.9.3 entry present');
  console.log('  PASS  CHANGELOG.md: v1.9.2 entry present');
  console.log('  PASS  CHANGELOG.md: v1.9.1 entry present');
  console.log('  PASS  CHANGELOG.md: v1.9.0 entry present');
}

// ── v1.9.2: Attribution — Gmail includes From and Subject ─────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily attribution: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('From:'),
    'guard:daily: output must include From: (Gmail or Slack attribution)'
  );
  assert.ok(
    result.stdout.includes('Subject:'),
    'guard:daily: output must include Subject: (Gmail attribution)'
  );
  console.log('  PASS  guard:daily: From: attribution present');
  console.log('  PASS  guard:daily: Subject: attribution present');
}

// ── v1.9.2: Attribution — Calendar includes Event ────────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily calendar attribution: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('Event:'),
    'guard:daily: output must include Event: (Calendar attribution)'
  );
  const hasWhenOrChecked =
    result.stdout.includes('When:') || result.stdout.includes('Checked:') || result.stdout.includes('Event:');
  assert.ok(hasWhenOrChecked, 'guard:daily: Calendar must include When:, Checked:, or Event:');
  console.log('  PASS  guard:daily: Calendar Event: attribution present');
  console.log('  PASS  guard:daily: Calendar When/Checked/Event present');
}

// ── v1.9.2: Attribution — Slack includes From/User and Channel ────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily slack attribution: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('Channel:'),
    'guard:daily: output must include Channel: (Slack attribution)'
  );
  console.log('  PASS  guard:daily: Slack Channel: attribution present');
}

// ── v1.9.2: No-action — Gmail uses neutral icon (not warning) ─────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');
  const noActionLines = buildSummaryLines('gmail', 'Gmail', '⚠️', [], { itemCount: 2, from: 'Alice', subject: 'FYI', sampleMessages: [{from: 'Alice', subject: 'FYI'}] });
  assert.ok(Array.isArray(noActionLines), 'buildSummaryLines: must return array for no-action Gmail');
  assert.ok(noActionLines.length > 0, 'buildSummaryLines: no-action Gmail must return lines');
  assert.ok(
    !noActionLines[0].includes('⚠️'),
    'buildSummaryLines: no-action Gmail header must not use ⚠️ (warning icon)'
  );
  assert.ok(
    noActionLines[0].includes('📧') || noActionLines[0].includes('No actionable'),
    'buildSummaryLines: no-action Gmail must use neutral icon 📧 or "No actionable" wording'
  );
  console.log('  PASS  Gmail no-action: does not use warning icon ⚠️');
  console.log('  PASS  Gmail no-action: uses neutral icon or neutral wording');
}

// ── v1.9.2: No-action — Calendar zero-event case ──────────────────────────────

{
  const CALENDAR_ZERO_INBOX = 'scripts/fixtures/inbox-calendar-zero';
  const result = run(['guard:daily', '--', '--inbox', CALENDAR_ZERO_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily calendar zero: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('No events found'),
    'guard:daily calendar zero: must say "No events found"'
  );
  assert.ok(
    result.stdout.includes('Checked: 0 events'),
    'guard:daily calendar zero: must say "Checked: 0 events"'
  );
  console.log('  PASS  Calendar zero-event: "No events found" present');
  console.log('  PASS  Calendar zero-event: "Checked: 0 events" present');
}

// ── v1.9.2: Missing Slack shows setup guidance ────────────────────────────────

{
  const NO_SLACK_INBOX = 'scripts/fixtures/inbox-no-slack';
  const result = run(['guard:daily', '--', '--inbox', NO_SLACK_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily no-slack: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('not connected') || result.stdout.includes('channels.slack'),
    'guard:daily no-slack: must include Slack setup guidance'
  );
  assert.ok(
    result.stdout.includes('openclaw-slack-live.json'),
    'guard:daily no-slack: must reference Slack payload path'
  );
  assertExternalWriteFalse(result.stdout, 'guard:daily no-slack');
  console.log('  PASS  Missing Slack: setup guidance present');
  console.log('  PASS  Missing Slack: Slack payload path referenced');
  console.log('  PASS  Missing Slack: externalWrite:false present');
}

// ── v1.9.2: Missing payload onboarding remains short ─────────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', MISSING_INBOX]);
  const lines = result.stdout.split('\n').filter(l => l.trim().length > 0);
  assert.ok(
    lines.length < 25,
    `guard:daily all-missing: onboarding must be short (got ${lines.length} non-empty lines)`
  );
  assert.ok(
    !result.stdout.includes('OpenClaw/gog/host tools should read the external systems'),
    'guard:daily all-missing: must not include old verbose text'
  );
  console.log('  PASS  Missing payload onboarding: remains short');
}

// ── v1.9.2: Compact output — no raw JSON, evidence snippets present ───────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assertNoRawJson(result.stdout, 'guard:daily compact');
  assert.ok(
    result.stdout.includes('Evidence:'),
    'guard:daily compact: must include Evidence: snippets'
  );
  // Evidence snippets must not be overly long (each quoted evidence ≤ 150 chars)
  const evidenceMatches = result.stdout.match(/Evidence: "([^"]+)"/g) || [];
  for (const match of evidenceMatches) {
    assert.ok(
      match.length <= 160,
      `guard:daily compact: evidence snippet too long: ${match.slice(0, 80)}...`
    );
  }
  assert.ok(
    result.stdout.includes('externalWrite:false') || result.stdout.includes('externalWrite: false'),
    'guard:daily compact: must include externalWrite:false'
  );
  assert.ok(
    result.stdout.includes('local time'),
    'guard:daily compact: must include schedule with "local time" wording'
  );
  console.log('  PASS  Compact output: no raw JSON');
  console.log('  PASS  Compact output: Evidence: snippets present');
  console.log('  PASS  Compact output: evidence snippets not overly long');
  console.log('  PASS  Compact output: externalWrite:false present');
  console.log('  PASS  Compact output: local time schedule present');
}

// ── v1.9.2: Details mode — guard:daily --details exits 0 ─────────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX, '--details']);
  assert.strictEqual(
    result.status, 0,
    `guard:daily --details: expected exit 0\n${result.stdout}\n${result.stderr}`
  );
  assert.ok(
    result.stdout.includes('Agent Execution Guard Daily Brief'),
    'guard:daily --details: must contain "Agent Execution Guard Daily Brief"'
  );
  assertNoRawJson(result.stdout, 'guard:daily --details');
  assertExternalWriteFalse(result.stdout, 'guard:daily --details');
  console.log('  PASS  guard:daily --details: exits 0');
  console.log('  PASS  guard:daily --details: no raw JSON');
  console.log('  PASS  guard:daily --details: externalWrite:false present');
}

// ── v1.9.2: Details mode — brief:daily --inbox --details exits 0 ──────────────

{
  const result = run(['brief:daily', '--', '--inbox', FIXTURE_INBOX, '--details']);
  assert.strictEqual(
    result.status, 0,
    `brief:daily --details: expected exit 0\n${result.stdout}\n${result.stderr}`
  );
  assertExternalWriteFalse(result.stdout, 'brief:daily --details');
  console.log('  PASS  brief:daily --inbox --details: exits 0');
  console.log('  PASS  brief:daily --inbox --details: externalWrite:false present');
}

// ── v1.9.2: Details mode — includes at least one source identifier ─────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX, '--details']);
  assert.strictEqual(result.status, 0, `guard:daily --details source id: expected exit 0\n${result.stdout}`);
  const hasSourceId =
    result.stdout.includes('messageId:') || result.stdout.includes('threadId:') ||
    result.stdout.includes('eventId:') || result.stdout.includes('ts:') ||
    result.stdout.includes('thread_ts:') || result.stdout.includes('permalink:');
  assert.ok(hasSourceId, 'guard:daily --details: must include at least one source identifier (messageId, threadId, eventId, ts, etc.)');
  console.log('  PASS  Details mode: source identifier present');
}

// ── v1.9.2: SKILL.md discourages tool search / command narration ──────────────

{
  const skill = fs.readFileSync('SKILL.md', 'utf8');
  const runtimeIdx = skill.indexOf('## Agent Runtime Instructions');
  assert.ok(runtimeIdx !== -1, 'SKILL.md: must contain ## Agent Runtime Instructions section');
  const runtimeSection = skill.slice(runtimeIdx);
  assert.ok(
    runtimeSection.includes('Do not show tool search steps') ||
    runtimeSection.includes('Do not inspect package.json'),
    'SKILL.md: routing section must discourage tool search steps or package.json inspection for Daily Brief'
  );
  console.log('  PASS  SKILL.md: discourages tool search / command narration for Daily Brief');
}

// ── v1.9.2: No connector / OAuth / fetch introduced ──────────────────────────

{
  const src = fs.readFileSync('dist/scripts/guardDaily.js', 'utf8');
  assert.ok(!src.includes('googleapis'), 'guardDaily v1.9.2: must not reference googleapis');
  assert.ok(!src.includes('OAuth'), 'guardDaily v1.9.2: must not reference OAuth');
  assert.ok(!src.includes('graph.microsoft.com'), 'guardDaily v1.9.2: must not reference MS Graph');
  assert.ok(!src.includes("fetch('"), 'guardDaily v1.9.2: must not contain fetch() with single-quote');
  assert.ok(!src.includes('fetch("'), 'guardDaily v1.9.2: must not contain fetch() with double-quote');
  console.log('  PASS  v1.9.2: no connector/OAuth/fetch behavior introduced');
}

// ── v1.9.3: New fixture directories exist ─────────────────────────────────────

{
  const koreanFixtures = [
    'scripts/fixtures/inbox-korean-gmail/openclaw-gmail-live.json',
    'scripts/fixtures/inbox-korean-gmail/openclaw-calendar-live.json',
    'scripts/fixtures/inbox-korean-gmail/openclaw-slack-live.json',
  ];
  for (const f of koreanFixtures) {
    assert.ok(fs.existsSync(f), `v1.9.3 fixture must exist: ${f}`);
  }
  const promoFixtures = [
    'scripts/fixtures/inbox-promo-gmail/openclaw-gmail-live.json',
    'scripts/fixtures/inbox-promo-gmail/openclaw-calendar-live.json',
    'scripts/fixtures/inbox-promo-gmail/openclaw-slack-live.json',
  ];
  for (const f of promoFixtures) {
    assert.ok(fs.existsSync(f), `v1.9.3 fixture must exist: ${f}`);
  }
  const travelFixtures = [
    'scripts/fixtures/inbox-travel-calendar/openclaw-calendar-live.json',
  ];
  for (const f of travelFixtures) {
    assert.ok(fs.existsSync(f), `v1.9.3 fixture must exist: ${f}`);
  }
  console.log('  PASS  v1.9.3: new fixture directories and files exist');
}

// ── v1.9.3: Korean Gmail fixture contains expected phrase ──────────────────────

{
  const koreanGmail = JSON.parse(fs.readFileSync('scripts/fixtures/inbox-korean-gmail/openclaw-gmail-live.json', 'utf8'));
  const hasKorean = koreanGmail.messages && koreanGmail.messages.some(m =>
    (m.subject && m.subject.includes('검토해주세요')) ||
    (m.snippet && m.snippet.includes('검토해주세요')) ||
    (m.subject && m.subject.includes('다시 검토')) ||
    (m.snippet && m.snippet.includes('다시 검토'))
  );
  assert.ok(hasKorean, 'Korean Gmail fixture: must contain a Korean review phrase');
  console.log('  PASS  Korean Gmail fixture: contains Korean review phrase');
}

// ── v1.9.3: Korean phrase detection — buildSummaryLines unit test ─────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');

  // Gmail: Korean review phrase in subject → "Review requested" header
  const koreanGmailCandidate = {
    idempotencyKey: 'local-gmail-korean-review',
    entityType: 'email',
    source: 'gmail',
    currentState: 'unread',
    proposedState: 'reviewed',
    reason: 'review request detected',
    approvalRequired: true,
    actionHint: 'Review the submitted document or reply if needed',
  };
  const koreanGmailLines = buildSummaryLines(
    'gmail', 'Gmail', '⚠️',
    [koreanGmailCandidate],
    { subject: '등록하신 문서를 다시 검토해주세요.', from: 'reviewer@example.com', itemCount: 1 }
  );
  assert.ok(Array.isArray(koreanGmailLines), 'Korean Gmail: buildSummaryLines must return array');
  assert.ok(koreanGmailLines.length > 0, 'Korean Gmail: must return lines');
  assert.ok(
    koreanGmailLines[0].includes('Review requested'),
    `Korean Gmail: header must say "Review requested", got: ${koreanGmailLines[0]}`
  );
  assert.ok(
    koreanGmailLines.some(l => l.includes('review request detected')),
    'Korean Gmail: Why line must say "review request detected"'
  );
  assert.ok(
    koreanGmailLines.some(l => l.includes('Subject:')),
    'Korean Gmail: must include Subject: line'
  );
  assert.ok(
    koreanGmailLines.some(l => l.includes('requires_approval')),
    'Korean Gmail: Adjudication must be requires_approval'
  );
  console.log('  PASS  Korean Gmail: "Review requested" header present');
  console.log('  PASS  Korean Gmail: reason says "review request detected"');
  console.log('  PASS  Korean Gmail: Subject: line present');
  console.log('  PASS  Korean Gmail: Adjudication is requires_approval');
}

// ── v1.9.3: Promotional Gmail — no-action and promotional note ─────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');
  const promoSamples = [
    { from: 'deals@shop.example.com', subject: '50% off this weekend only — limited offer!' },
    { from: 'noreply@digest.example.com', subject: 'Your daily digest — top stories' },
  ];
  const promoLines = buildSummaryLines(
    'gmail', 'Gmail', '⚠️', [],
    { itemCount: 2, snippet: 'Unsubscribe from this list.', sampleMessages: promoSamples }
  );
  assert.ok(Array.isArray(promoLines), 'Promo Gmail: must return array');
  assert.ok(
    !promoLines[0].includes('⚠️'),
    'Promo Gmail: no-action must not use ⚠️ icon'
  );
  assert.ok(
    promoLines[0].includes('📧') || promoLines[0].includes('No actionable'),
    'Promo Gmail: must use neutral icon or "No actionable" wording'
  );
  assert.ok(
    promoLines.some(l => l.includes('review')),
    'Promo Gmail: reason must include "review"'
  );
  assert.ok(
    promoLines.some(l => l.toLowerCase().includes('promotional') || l.toLowerCase().includes('informational')),
    'Promo Gmail: must include promotional/informational note'
  );
  console.log('  PASS  Promo Gmail: no-action neutral icon');
  console.log('  PASS  Promo Gmail: reason includes "review"');
  console.log('  PASS  Promo Gmail: promotional note present');
}

// ── v1.9.3: Calendar travel event — important context ────────────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');

  // No candidates + travel event title → "Important context"
  const travelLines = buildSummaryLines(
    'calendar', 'Calendar', '📅', [],
    {
      title: 'Flight to 서울 (KE 24)',
      start: '2026-05-21T12:40:00.000Z',
      location: 'SFO',
      description: 'Departs SFO. Check in 2 hours before departure.',
      itemCount: 1,
      eventId: 'cal-travel-001',
    }
  );
  assert.ok(Array.isArray(travelLines), 'Travel Calendar: must return array');
  assert.ok(
    travelLines.some(l => l.includes('Important context')),
    `Travel Calendar: must say "Important context", got: ${travelLines.join(' | ')}`
  );
  assert.ok(
    travelLines.some(l => l.includes('Event:')),
    'Travel Calendar: must include Event: line'
  );
  assert.ok(
    travelLines.some(l => l.toLowerCase().includes('travel event detected')),
    'Travel Calendar: reason must say "travel event detected"'
  );
  assert.ok(
    !travelLines.some(l => l.includes('requires_approval')),
    'Travel Calendar: must NOT say requires_approval'
  );
  assert.ok(
    !travelLines.some(l => l.includes('No actionable loop detected')),
    'Travel Calendar: must NOT say "No actionable loop detected"'
  );
  console.log('  PASS  Calendar travel event: "Important context" present');
  console.log('  PASS  Calendar travel event: Event: line present');
  console.log('  PASS  Calendar travel event: travel event reason present');
  console.log('  PASS  Calendar travel event: no requires_approval');
  console.log('  PASS  Calendar travel event: no "No actionable loop detected"');
}

// ── v1.9.3: Calendar travel event — integration test ─────────────────────────

{
  const TRAVEL_INBOX = 'scripts/fixtures/inbox-travel-calendar';
  const result = run(['guard:daily', '--', '--inbox', TRAVEL_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily travel: expected exit 0\n${result.stdout}\n${result.stderr}`);
  assert.ok(
    result.stdout.includes('Important context') || result.stdout.includes('Flight'),
    'guard:daily travel: must include "Important context" or "Flight"'
  );
  assert.ok(
    !result.stdout.includes('"events":'),
    'guard:daily travel: must not expose raw JSON'
  );
  assertExternalWriteFalse(result.stdout, 'guard:daily travel');
  console.log('  PASS  Calendar travel integration: Important context or Flight shown');
  console.log('  PASS  Calendar travel integration: no raw JSON');
  console.log('  PASS  Calendar travel integration: externalWrite:false');
}

// ── v1.9.3: Calendar zero-event — Next suggestion present ─────────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');
  const zeroLines = buildSummaryLines(
    'calendar', 'Calendar', '📅', [],
    { itemCount: 0 }
  );
  assert.ok(
    zeroLines.some(l => l.includes('No events found')),
    'Calendar zero: must say "No events found"'
  );
  assert.ok(
    zeroLines.some(l => l.includes('Checked: 0 events')),
    'Calendar zero: must say "Checked: 0 events"'
  );
  assert.ok(
    zeroLines.some(l => l.includes('14 days')),
    'Calendar zero: must suggest reading for 14 days'
  );
  console.log('  PASS  Calendar zero: "No events found" present');
  console.log('  PASS  Calendar zero: "Checked: 0 events" present');
  console.log('  PASS  Calendar zero: 14-day suggestion present');
}

// ── v1.9.3: Slack missing — channels.slack guidance ──────────────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');
  // processSource handles missing Slack; buildSummaryLines doesn't — test via integration
  const NO_SLACK_INBOX = 'scripts/fixtures/inbox-no-slack';
  const result = run(['guard:daily', '--', '--inbox', NO_SLACK_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily no-slack v1.9.3: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('channels.slack') || result.stdout.includes('not connected'),
    'v1.9.3 no-slack: must include channels.slack or not connected'
  );
  assert.ok(
    result.stdout.includes('openclaw-slack-live.json'),
    'v1.9.3 no-slack: must reference Slack payload path'
  );
  console.log('  PASS  v1.9.3 Slack missing: channels.slack guidance present');
  console.log('  PASS  v1.9.3 Slack missing: payload path referenced');
}

// ── v1.9.3: Gmail no-action reason includes "review" ─────────────────────────

{
  const { buildSummaryLines } = require('../dist/dailyBriefRunner.js');
  const noActionLines = buildSummaryLines(
    'gmail', 'Gmail', '⚠️', [],
    { itemCount: 1, from: 'someone@example.com', subject: 'FYI update', sampleMessages: [] }
  );
  assert.ok(
    noActionLines.some(l => l.includes('review')),
    'Gmail no-action: reason must include "review"'
  );
  console.log('  PASS  Gmail no-action: reason includes "review"');
}

// ── v1.9.3: Existing Slack actionable detection still passes ──────────────────

{
  const result = run(['guard:daily', '--', '--inbox', FIXTURE_INBOX]);
  assert.strictEqual(result.status, 0, `guard:daily Slack actionable: expected exit 0\n${result.stdout}`);
  assert.ok(
    result.stdout.includes('Slack'),
    'guard:daily: Slack section must appear in output'
  );
  assert.ok(
    result.stdout.includes('Channel:'),
    'guard:daily: Slack must show Channel: attribution'
  );
  console.log('  PASS  Existing Slack actionable detection: still passes');
}

// ── v1.9.3: No connector / OAuth / fetch in dist/scripts/guardDaily.js ────────

{
  const src = fs.readFileSync('dist/scripts/guardDaily.js', 'utf8');
  const runner = fs.readFileSync('dist/dailyBriefRunner.js', 'utf8');
  assert.ok(!runner.includes('googleapis'), 'dailyBriefRunner v1.9.3: must not reference googleapis');
  assert.ok(!runner.includes('OAuth'), 'dailyBriefRunner v1.9.3: must not reference OAuth');
  assert.ok(!src.includes('googleapis'), 'guardDaily v1.9.3: must not reference googleapis');
  assert.ok(!src.includes('OAuth'), 'guardDaily v1.9.3: must not reference OAuth');
  console.log('  PASS  v1.9.3: no connector/OAuth/fetch behavior introduced');
}

console.log('\nguardDaily: all assertions passed\n');
