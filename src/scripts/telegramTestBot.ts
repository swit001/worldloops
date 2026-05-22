import * as https from 'node:https';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadObservations, runIntake } from '../openclawIntake';
import type { IntakeSummary, AdjudicationResult } from '../openclawIntake';

const OPENCLAW_INBOX = path.join(process.env.HOME ?? '', '.openclaw/workspace/.worldloops/inbox');

const DEMO_FIXTURE_PATH = 'scripts/fixtures/openclaw-signal-intake/demo-observations.json';
const INTERPRETED_OBSERVATIONS = '.worldloops/inbox/openclaw-observations.json';
const MAX_LENGTH = 4096;
const TRUNCATION_SUFFIX = '\n… truncated for Telegram test output';

function loadToken(): string {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    return process.env.TELEGRAM_BOT_TOKEN.trim();
  }
  const envFile = path.join(process.env.HOME ?? '', '.claude', 'channels', 'telegram', '.env');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    const match = /^TELEGRAM_BOT_TOKEN\s*=\s*(.+)$/m.exec(content);
    if (match) return match[1].trim();
  }
  throw new Error(
    'TELEGRAM_BOT_TOKEN not found. Set env var or add to ~/.claude/channels/telegram/.env'
  );
}

function telegramRequest(
  token: string,
  method: string,
  body: Record<string, unknown>,
  timeoutMs = 10000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw) as Record<string, unknown>);
          } catch {
            reject(new Error(`JSON parse error: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function telegramGet(
  token: string,
  method: string,
  params: Record<string, unknown>,
  timeoutMs = 10000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/${method}${query ? '?' + query : ''}`,
        method: 'GET',
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk: Buffer) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(raw) as Record<string, unknown>);
          } catch {
            reject(new Error(`JSON parse error: ${raw.slice(0, 200)}`));
          }
        });
      }
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function sendMessage(token: string, chatId: number, text: string): Promise<void> {
  await telegramRequest(token, 'sendMessage', { chat_id: chatId, text });
}

function truncate(text: string): string {
  if (text.length <= MAX_LENGTH) return text;
  const cutoff = MAX_LENGTH - TRUNCATION_SUFFIX.length;
  return text.slice(0, cutoff) + TRUNCATION_SUFFIX;
}

function srcEmoji(source: string): string {
  if (source === 'gmail' || source === 'email') return '📧';
  if (source === 'calendar') return '🗓️';
  if (source === 'slack') return '💬';
  return '📌';
}

function evField(ev: Record<string, unknown>, key: string): string {
  return typeof ev[key] === 'string' ? (ev[key] as string) : '';
}

function shortActor(actor: string | null | undefined): string {
  if (!actor) return '';
  const m = /^(.+?)\s*<[^>]+>$/.exec(actor);
  return m ? m[1].trim() : actor;
}

function fmtDue(dueAt: string | undefined): string {
  if (!dueAt) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d+)?([+-]\d{2}:\d{2}|Z)?/.exec(dueAt);
  if (!m) return dueAt;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[parseInt(m[2]) - 1];
  const day = parseInt(m[3]);
  const h = parseInt(m[4]);
  const min = m[5];
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const tzMap: Record<string, string> = { '+09:00': 'KST', '-07:00': 'PDT', '-08:00': 'PST', 'Z': 'UTC' };
  const tz = m[6] ? (tzMap[m[6]] ?? m[6]) : '';
  return `${month} ${day}, ${h12}:${min} ${ampm}${tz ? ' ' + tz : ''}`;
}

function actionFromText(text: string): string {
  const parts = text.split('. ');
  const triggers = ['must ', 'need to ', 'needs to ', 'required', 'confirm ', 'check ', 'attend ', 'decide ', 'submit ', 'delegate ', 'file '];
  for (const s of parts) {
    if (triggers.some(t => s.toLowerCase().includes(t))) {
      return s.replace(/^Josh (must|needs? to|should) /i, '').trim().slice(0, 120);
    }
  }
  return '';
}

function buildLoopEntry(r: AdjudicationResult, adjLabel: string): string {
  const obs = r.observation;
  const ev = obs.evidence;
  const emoji = srcEmoji(obs.source);
  const srcLabel = obs.source.charAt(0).toUpperCase() + obs.source.slice(1);
  const lines: string[] = [`${emoji} ${srcLabel} — ${obs.title}`];

  if (obs.source === 'gmail' || obs.source === 'email') {
    const from = shortActor(obs.actor);
    if (from) lines.push(`From: ${from}`);
    const subj = evField(ev, 'subject') || evField(ev, 'title');
    if (subj && subj !== obs.title) lines.push(`Subject: ${subj}`);
    lines.push(`Why: ${obs.text.split('. ')[0].slice(0, 130)}`);
    const snippet = evField(ev, 'snippet');
    if (snippet) lines.push(`Evidence: ${snippet.slice(0, 100)}`);
    const action = actionFromText(obs.text);
    if (action) lines.push(`Action: ${action}`);
  } else if (obs.source === 'calendar') {
    const evTitle = evField(ev, 'title');
    if (evTitle && evTitle !== obs.title) lines.push(`Event: ${evTitle}`);
    const when = fmtDue(obs.dueAt) || evField(ev, 'start');
    if (when) lines.push(`When: ${when}`);
    const loc = evField(ev, 'location');
    if (loc) lines.push(`Location: ${loc}`);
    lines.push(`Why: ${obs.text.split('. ')[0].slice(0, 130)}`);
    const action = actionFromText(obs.text);
    lines.push(`Action: ${action || 'Attend'}`);
  } else if (obs.source === 'slack') {
    const from = shortActor(obs.actor);
    if (from) lines.push(`From: ${from}`);
    const channel = evField(ev, 'channel');
    if (channel) lines.push(`Channel: #${channel}`);
    lines.push(`Why: ${obs.text.split('. ')[0].slice(0, 130)}`);
    const snippet = evField(ev, 'snippet') || evField(ev, 'message') || evField(ev, 'text');
    if (snippet) lines.push(`Evidence: "${snippet.slice(0, 100)}"`);
    const action = actionFromText(obs.text);
    if (action) lines.push(`Action: ${action}`);
  }

  lines.push(`Adjudication: ${adjLabel}`);
  lines.push(`Safety: externalWrite:false`);
  return lines.join('\n');
}

function buildContextEntry(r: AdjudicationResult): string {
  const obs = r.observation;
  const ev = obs.evidence;
  const emoji = srcEmoji(obs.source);
  if (obs.source === 'gmail' || obs.source === 'email') {
    const subj = evField(ev, 'subject') || evField(ev, 'title') || obs.title;
    return `${emoji} ${subj}`;
  }
  if (obs.source === 'calendar') {
    const evTitle = evField(ev, 'title') || obs.title;
    const when = fmtDue(obs.dueAt);
    return `${emoji} ${evTitle}${when ? ` — ${when}` : ''}`;
  }
  if (obs.source === 'slack') {
    const channel = evField(ev, 'channel');
    const snippet = evField(ev, 'snippet') || obs.text.slice(0, 60);
    return `${emoji} ${channel ? `#${channel}` : 'Slack'} — ${snippet.slice(0, 80)}`;
  }
  return `${emoji} ${obs.title}`;
}

function buildBriefOutput(summary: IntakeSummary, mode: string): string {
  const lines: string[] = [];
  lines.push('🛡️ WorldLoops Brief');
  lines.push(`mode: ${mode}`);

  const newLoops = summary.results.filter(r => r.verdict === 'accepted');
  const alreadyTracked = summary.results.filter(
    r => r.verdict === 'suppressed' &&
         r.suppressionReason === 'duplicate_signal' &&
         r.observation.observationIntent === 'new_loop'
  );
  const contextItems = summary.results.filter(r => r.verdict === 'attached_context');
  const suppressedNoise = summary.results.filter(
    r => r.verdict === 'suppressed' && r.suppressionReason !== 'duplicate_signal'
  );

  // 🧭 New open loops
  lines.push('');
  lines.push('🧭 New open loops');
  if (newLoops.length === 0) {
    lines.push('None.');
  } else {
    for (const r of newLoops) {
      lines.push('');
      lines.push(buildLoopEntry(r, 'new_loop'));
    }
  }

  // 🔁 Already tracked open loops
  if (alreadyTracked.length > 0) {
    lines.push('');
    lines.push('🔁 Already tracked open loops');
    for (const r of alreadyTracked) {
      lines.push('');
      lines.push(buildLoopEntry(r, 'already_tracked'));
    }
  }

  // 📎 Context
  if (contextItems.length > 0) {
    lines.push('');
    lines.push('📎 Context');
    for (const r of contextItems) {
      lines.push(`  ${buildContextEntry(r)}`);
    }
  }

  // 🧹 Suppressed
  if (suppressedNoise.length > 0) {
    lines.push('');
    lines.push('🧹 Suppressed');
    for (const r of suppressedNoise) {
      const reason = r.suppressionReason === 'promotional_or_informational' ? 'promotional/no action' :
                     r.suppressionReason === 'negative_intent_no_action' ? 'no action required' :
                     (r.suppressionReason ?? 'suppressed');
      lines.push(`  - ${r.observation.title} — ${reason}`);
    }
  }

  // Footer
  lines.push('');
  lines.push('✅ Safe');
  lines.push('externalWrite:false');
  lines.push('No email, draft, calendar event, Slack message, or external change made.');

  return truncate(lines.join('\n'));
}

async function handleBriefWithProgress(
  token: string,
  chatId: number,
  filePath: string,
  mode: string
): Promise<void> {
  await sendMessage(token, chatId,
    'Reading interpreted OpenClaw observations…\nexternalWrite:false'
  );

  let observations;
  try {
    observations = loadObservations(filePath);
  } catch (err) {
    await sendMessage(token, chatId,
      `Error loading observations: ${String(err)}\nexternalWrite:false`
    );
    return;
  }

  const n = observations.length;
  await sendMessage(token, chatId,
    `Loaded ${n} interpreted candidate${n !== 1 ? 's' : ''}.\nexternalWrite:false`
  );

  await sendMessage(token, chatId,
    'WorldLoops is adjudicating candidates…\nexternalWrite:false'
  );

  let summary;
  try {
    summary = runIntake(observations);
  } catch (err) {
    await sendMessage(token, chatId,
      `Error running intake: ${String(err)}\nexternalWrite:false`
    );
    return;
  }

  const { accepted, attached_context: context, suppressed } = summary;
  await sendMessage(token, chatId,
    `WorldLoops found ${accepted} open loop${accepted !== 1 ? 's' : ''}, ${context} context item${context !== 1 ? 's' : ''}, ${suppressed} suppressed.\nexternalWrite:false`
  );

  await sendMessage(token, chatId, buildBriefOutput(summary, mode));
}

async function handleBriefCommand(token: string, chatId: number): Promise<void> {
  const filePath = path.resolve(process.cwd(), INTERPRETED_OBSERVATIONS);

  if (!fs.existsSync(filePath)) {
    await sendMessage(token, chatId, [
      'No interpreted OpenClaw observations found yet.',
      'Ask OpenClaw to observe first, then write surfaced candidates to .worldloops/inbox/openclaw-observations.json.',
      '',
      'To test with demo data: /demo',
      'To run raw inbox diagnostic (not recommended for user brief): /live',
      '',
      'externalWrite:false',
    ].join('\n'));
    return;
  }

  await handleBriefWithProgress(token, chatId, filePath, 'interpreted-observations');
}

async function handleDemoCommand(token: string, chatId: number): Promise<void> {
  const filePath = path.resolve(process.cwd(), DEMO_FIXTURE_PATH);

  if (!fs.existsSync(filePath)) {
    await sendMessage(token, chatId, [
      'Demo fixture not found.',
      `Expected: ${DEMO_FIXTURE_PATH}`,
      'externalWrite:false',
    ].join('\n'));
    return;
  }

  await handleBriefWithProgress(token, chatId, filePath, 'demo-fixture');
}

function runLiveDiagnostic(): string {
  try {
    const result = spawnSync(
      'node',
      ['dist/scripts/guardDaily.js', '--inbox', OPENCLAW_INBOX],
      { encoding: 'utf8', timeout: 30000, cwd: process.cwd() }
    );
    if (result.error) {
      return `Error running live diagnostic: ${result.error.message}`;
    }
    const output = ((result.stdout ?? '') + (result.stderr ?? '')).trim();
    return truncate(output || 'No output from live diagnostic.');
  } catch (err) {
    return `Error running live diagnostic: ${String(err)}`;
  }
}

function runSource(): string {
  const cwd = process.cwd();

  const interpretedAbs = path.resolve(cwd, INTERPRETED_OBSERVATIONS);
  const interpretedExists = fs.existsSync(interpretedAbs);

  const liveFiles = ['openclaw-gmail-live.json', 'openclaw-calendar-live.json', 'openclaw-slack-live.json'];
  const liveStatuses = liveFiles.map(f => {
    const exists = fs.existsSync(path.join(OPENCLAW_INBOX, f));
    return `  ${f}  ${exists ? 'exists' : 'not found'}`;
  });

  const demoAbs = path.resolve(cwd, DEMO_FIXTURE_PATH);
  const demoExists = fs.existsSync(demoAbs);

  const lines: string[] = [
    'WorldLoops input source check',
    '',
    'Interpreted observations (/brief):',
    `  ${INTERPRETED_OBSERVATIONS}  ${interpretedExists ? 'exists' : 'not found'}`,
    '  Written by OpenClaw after its observation pass.',
    '',
    'Raw live inbox diagnostic (/live):',
    `  ${OPENCLAW_INBOX}`,
    ...liveStatuses,
    '',
    'Demo fixture (/demo):',
    `  ${DEMO_FIXTURE_PATH}  ${demoExists ? 'exists' : 'not found'}`,
    '',
    'externalWrite:false',
  ];

  return lines.join('\n');
}

const BRIEF_TRIGGERS = [
  '/brief',
  '/worldloops',
  '오늘 내가 할 일이 뭐야',
  '뭐 빠진 거 없어',
  '어제 열린 루프 중 닫힌 거 있어',
];

function isBriefRequest(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return BRIEF_TRIGGERS.some(t => lower.startsWith(t.toLowerCase()));
}

async function handleUpdate(token: string, update: Record<string, unknown>): Promise<void> {
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return;

  const chatId = (message.chat as Record<string, unknown> | undefined)?.id as number | undefined;
  const text = message.text as string | undefined;

  if (!chatId || !text) return;

  const trimmed = text.trim();

  if (trimmed === '/start') {
    await sendMessage(
      token,
      chatId,
      'WorldLoops Telegram demo wrapper is running.\nSend /help to see available commands.'
    );
    return;
  }

  if (trimmed === '/help') {
    await sendMessage(token, chatId, [
      'WorldLoops Telegram demo wrapper',
      '',
      'Commands:',
      '/status — bot version and status',
      '/source — show all three input paths and their status',
      '/brief — adjudicate OpenClaw interpreted observations',
      '/worldloops — same as /brief',
      '/demo — adjudicate demo fixture',
      '/live — raw inbox diagnostic, not recommended for user-facing brief',
      '',
      'externalWrite:false',
    ].join('\n'));
    return;
  }

  if (trimmed === '/status') {
    let version = 'unknown';
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8')
      ) as { version?: string };
      version = pkg.version ?? 'unknown';
    } catch {
      // leave as unknown
    }
    await sendMessage(token, chatId, [
      'WorldLoops Telegram test bot: running',
      `version: ${version}`,
      'externalWrite:false',
    ].join('\n'));
    return;
  }

  if (trimmed === '/source') {
    await sendMessage(token, chatId, runSource());
    return;
  }

  if (trimmed === '/reset-demo') {
    await sendMessage(token, chatId, [
      '/reset-demo: not implemented',
      '',
      '.worldloops/ contains real user state (open loops, proposals, receipts).',
      'Deleting from this directory without isolated demo state is unsafe.',
      '',
      'To clear the demo inbox manually:',
      '  rm .worldloops/inbox/openclaw-observations.json',
      '',
      'externalWrite:false',
    ].join('\n'));
    return;
  }

  if (trimmed === '/demo') {
    await handleDemoCommand(token, chatId);
    return;
  }

  if (trimmed === '/live') {
    await sendMessage(token, chatId, [
      'Raw diagnostic mode — this reads shallow live handoff payloads and may include noise.',
      'For user-facing quality, use interpreted OpenClaw observations with /brief.',
      '',
      'externalWrite:false',
    ].join('\n'));
    await sendMessage(token, chatId, runLiveDiagnostic());
    return;
  }

  if (isBriefRequest(trimmed) || !trimmed.startsWith('/')) {
    await handleBriefCommand(token, chatId);
    return;
  }

  await sendMessage(
    token,
    chatId,
    "Unknown command. Send /help for available commands."
  );
}

interface TelegramUpdate {
  update_id: number;
  [key: string]: unknown;
}

interface GetUpdatesResponse {
  ok: boolean;
  result?: TelegramUpdate[];
  error_code?: number;
  description?: string;
}

async function poll(
  token: string,
  offset: number
): Promise<{ updates: TelegramUpdate[]; nextOffset: number }> {
  // timeout=30 → 35s socket timeout to give Telegram time to respond
  const response = (await telegramGet(
    token,
    'getUpdates',
    { offset, timeout: 30, allowed_updates: 'message' },
    35000
  )) as unknown as GetUpdatesResponse;

  if (!response.ok) {
    if (response.error_code === 409) {
      throw new Error(
        'Polling conflict (409): another bot process is already polling this token. Stop it first.'
      );
    }
    throw new Error(`getUpdates failed [${response.error_code ?? '?'}]: ${response.description ?? JSON.stringify(response)}`);
  }

  const updates = response.result ?? [];
  const nextOffset =
    updates.length > 0 ? updates[updates.length - 1].update_id + 1 : offset;

  return { updates, nextOffset };
}

async function main(): Promise<void> {
  let token: string;
  try {
    token = loadToken();
  } catch (err) {
    process.stderr.write(`Error: ${String(err)}\n`);
    process.exit(1);
  }

  console.log('WorldLoops Telegram demo wrapper starting...');
  console.log('Polling for messages. Send /help to your bot for available commands.');
  console.log('Press Ctrl+C to stop.\n');

  let offset = 0;

  for (;;) {
    try {
      const { updates, nextOffset } = await poll(token, offset);
      offset = nextOffset;
      for (const update of updates) {
        try {
          await handleUpdate(token, update as Record<string, unknown>);
        } catch (err) {
          process.stderr.write(`Error handling update ${update.update_id}: ${String(err)}\n`);
        }
      }
    } catch (err) {
      const msg = String(err);
      if (msg.includes('409')) {
        process.stderr.write(`Fatal: ${msg}\n`);
        process.exit(1);
      }
      process.stderr.write(`Polling error (retrying in 5s): ${msg}\n`);
      await new Promise<void>(r => setTimeout(r, 5000));
    }
  }
}

main();
