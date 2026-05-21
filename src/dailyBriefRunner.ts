import * as fs from 'node:fs';
import * as path from 'node:path';

import { callWorldLoopsBrief } from './brief';
import { validateAdapterSignal } from './adapter/validateAdapterSignal';
import { toWorldLoopsSignal } from './adapter/toWorldLoopsSignal';
import { isGogGmailPayload, gogGmailToAdapterSignal } from './adapters/gogGmail';
import { isGogCalendarPayload, gogCalendarToAdapterSignal } from './adapters/gogCalendar';
import { isSlackHostPayload, slackPayloadToAdapterSignal } from './adapters/slackPayload';
import type { ProposalCandidate } from './types';

export const DEFAULT_INBOX_DIR = '.worldloops/inbox';

export const SOURCES = [
  { id: 'gmail' as const, file: 'openclaw-gmail-live.json', label: 'Gmail', emoji: '⚠️' },
  { id: 'calendar' as const, file: 'openclaw-calendar-live.json', label: 'Calendar', emoji: '📅' },
  { id: 'slack' as const, file: 'openclaw-slack-live.json', label: 'Slack', emoji: '💬' },
];

export type SourceId = 'gmail' | 'calendar' | 'slack';

export interface SourceResult {
  id: SourceId;
  label: string;
  emoji: string;
  file: string;
  found: boolean;
  ok: boolean;
  candidates: ProposalCandidate[];
  summaryLine: string;
}

function normalizePayload(sourceId: SourceId, raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return raw;

  if (sourceId === 'gmail' && isGogGmailPayload(raw)) {
    return gogGmailToAdapterSignal(raw);
  }
  if (sourceId === 'calendar' && isGogCalendarPayload(raw)) {
    return gogCalendarToAdapterSignal(raw);
  }
  if (sourceId === 'slack' && isSlackHostPayload(raw)) {
    return slackPayloadToAdapterSignal(raw);
  }

  const obj = raw as Record<string, unknown>;
  if (!obj.source) obj.source = sourceId;
  if (!obj.sourceType) obj.sourceType = 'message';
  if (obj.externalWrite === undefined) obj.externalWrite = false;
  if (!obj.observedAt) obj.observedAt = new Date().toISOString();
  return raw;
}

function buildSummaryLine(
  sourceId: SourceId,
  label: string,
  emoji: string,
  candidates: ProposalCandidate[]
): string {
  if (candidates.length === 0) {
    return `${emoji} ${label} — No actionable loop detected`;
  }
  const first = candidates[0];
  let defaultReason: string;
  if (sourceId === 'gmail') defaultReason = 'Follow-up needed';
  else if (sourceId === 'calendar') defaultReason = 'Preparation needed';
  else defaultReason = 'Action requested';
  return `${emoji} ${label} — ${first.reason || defaultReason}`;
}

export async function processSource(
  sourceId: SourceId,
  file: string,
  label: string,
  emoji: string,
  inboxDir: string
): Promise<SourceResult> {
  const filePath = path.join(inboxDir, file);
  const found = fs.existsSync(filePath);

  if (!found) {
    return { id: sourceId, label, emoji, file, found: false, ok: false, candidates: [], summaryLine: '' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  } catch {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLine: `❌ ${label} — Error reading payload`,
    };
  }

  const normalized = normalizePayload(sourceId, raw);
  const validation = validateAdapterSignal(normalized);

  if (!validation.ok) {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLine: `❌ ${label} — Invalid payload`,
    };
  }

  try {
    const signal = toWorldLoopsSignal(validation.signal);
    const result = await callWorldLoopsBrief({ signals: [signal], mode: 'reconciliation' });
    const candidates = result.proposalCandidates ?? [];
    return {
      id: sourceId, label, emoji, file, found: true, ok: result.ok, candidates,
      summaryLine: buildSummaryLine(sourceId, label, emoji, candidates),
    };
  } catch {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLine: `⚠️ ${label} — Guard check unavailable`,
    };
  }
}

export async function processAllSources(inboxDir: string): Promise<SourceResult[]> {
  const results: SourceResult[] = [];
  for (const src of SOURCES) {
    results.push(await processSource(src.id, src.file, src.label, src.emoji, inboxDir));
  }
  return results;
}

export function buildBriefLines(results: SourceResult[]): string[] {
  const lines: string[] = [];
  const foundResults = results.filter(r => r.found);
  const missingResults = results.filter(r => !r.found);

  if (foundResults.length === 0) {
    lines.push('No local handoff payloads found.');
    lines.push('');
    lines.push('Expected files:');
    for (const src of SOURCES) {
      lines.push(`- ${DEFAULT_INBOX_DIR}/${src.file}`);
    }
    lines.push('');
    lines.push('OpenClaw/gog/host tools should read the external systems and save local JSON payloads here.');
    return lines;
  }

  lines.push('Sources:');
  for (const r of results) {
    lines.push(r.found ? `✅ ${r.label}` : `⬜ ${r.label} — missing`);
  }

  if (missingResults.length > 0) {
    lines.push('');
    for (const r of missingResults) {
      lines.push(
        `No ${r.label} payload found. Save a host-read payload to ${DEFAULT_INBOX_DIR}/openclaw-${r.id}-live.json.`
      );
    }
  }

  lines.push('');
  lines.push('Open loops:');
  for (const r of foundResults) {
    lines.push(r.summaryLine);
  }

  return lines;
}
