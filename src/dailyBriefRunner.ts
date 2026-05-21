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

interface EvidenceData {
  snippet?: string;
  subject?: string;
  from?: string;
  title?: string;
  start?: string;
  end?: string;
  text?: string;
  channel?: string;
  user?: string;
  itemCount?: number;
}

export interface SourceResult {
  id: SourceId;
  label: string;
  emoji: string;
  file: string;
  found: boolean;
  ok: boolean;
  candidates: ProposalCandidate[];
  summaryLines: string[];
}

function truncate(s: string, maxLen = 120): string {
  return s.length <= maxLen ? s : s.slice(0, maxLen - 1) + '…';
}

function extractEvidence(sourceId: SourceId, raw: unknown): EvidenceData {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const obj = raw as Record<string, unknown>;

  if (sourceId === 'gmail') {
    const messages = Array.isArray(obj.messages) ? obj.messages : [];
    const first = messages[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      const msg = first as Record<string, unknown>;
      const subject = typeof msg.subject === 'string' ? msg.subject : undefined;
      const from = typeof msg.from === 'string' ? msg.from : undefined;
      const raw_snippet = typeof msg.snippet === 'string' ? msg.snippet :
                          typeof msg.body === 'string' ? msg.body : undefined;
      const snippet = raw_snippet ? truncate(raw_snippet) : undefined;
      return { subject, from, snippet, itemCount: messages.length };
    }
    return { itemCount: messages.length };
  }

  if (sourceId === 'calendar') {
    const events = Array.isArray(obj.events) ? obj.events : [];
    const first = events[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      const evt = first as Record<string, unknown>;
      const title = typeof evt.summary === 'string' ? evt.summary :
                    typeof evt.title === 'string' ? evt.title : undefined;
      const start = typeof evt.start === 'string' ? evt.start : undefined;
      const end = typeof evt.end === 'string' ? evt.end : undefined;
      return { title, start, end, itemCount: events.length };
    }
    return { itemCount: events.length };
  }

  if (sourceId === 'slack') {
    const messages = Array.isArray(obj.messages) ? obj.messages :
                     Array.isArray(obj.items) ? obj.items : [];
    const channel = typeof obj.channel === 'string' ? obj.channel : undefined;
    const first = messages[0];
    if (typeof first === 'object' && first !== null && !Array.isArray(first)) {
      const msg = first as Record<string, unknown>;
      const raw_text = typeof msg.text === 'string' ? msg.text : undefined;
      const text = raw_text ? truncate(raw_text) : undefined;
      const user = typeof msg.user === 'string' ? msg.user :
                   typeof msg.username === 'string' ? msg.username : undefined;
      return { text, channel, user, itemCount: messages.length };
    }
    return { channel, itemCount: messages.length };
  }

  return {};
}

function buildSummaryLines(
  sourceId: SourceId,
  label: string,
  emoji: string,
  candidates: ProposalCandidate[],
  evidence: EvidenceData
): string[] {
  if (candidates.length === 0) {
    const lines: string[] = [];
    lines.push(`${emoji} ${label} — No actionable loop detected`);
    if (evidence.itemCount !== undefined) {
      const unit = sourceId === 'calendar' ? 'event' : 'message';
      const plural = evidence.itemCount === 1 ? unit : `${unit}s`;
      lines.push(`Checked: ${evidence.itemCount} ${plural}`);
    }
    lines.push(`Reason: no prep, deadline, approval, or follow-up language detected`);
    return lines;
  }

  const first = candidates[0];
  const lines: string[] = [];

  let headerLabel: string;
  if (sourceId === 'gmail') headerLabel = 'Follow-up needed';
  else if (sourceId === 'calendar') headerLabel = 'Preparation needed';
  else headerLabel = 'Action requested';
  lines.push(`${emoji} ${label} — ${headerLabel}`);

  const whyDefault =
    sourceId === 'gmail' ? 'follow-up or reply request detected' :
    sourceId === 'calendar' ? 'preparation or action item detected' :
    'review or approval request detected';
  lines.push(`Why: ${first.reason || whyDefault}`);

  let evidenceText: string | undefined;
  if (sourceId === 'gmail') evidenceText = evidence.snippet;
  else if (sourceId === 'calendar') evidenceText = evidence.title
    ? `${evidence.title}${evidence.start ? ` at ${evidence.start}` : ''}`
    : undefined;
  else if (sourceId === 'slack') evidenceText = evidence.text;

  lines.push(`Evidence: ${evidenceText ? `"${evidenceText}"` : 'not available in payload'}`);

  const actionDefault =
    sourceId === 'gmail' ? 'Draft a reply or follow-up' :
    sourceId === 'calendar' ? 'Prepare agenda or review action items' :
    'Review the referenced item and add comments or approval';
  lines.push(`Action: ${first.actionHint || actionDefault}`);

  lines.push(`Adjudication: ${first.approvalRequired ? 'requires_approval' : 'informational'}`);

  return lines;
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
    return { id: sourceId, label, emoji, file, found: false, ok: false, candidates: [], summaryLines: [] };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
  } catch {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLines: [`❌ ${label} — Error reading payload`],
    };
  }

  const evidence = extractEvidence(sourceId, raw);
  const normalized = normalizePayload(sourceId, raw);
  const validation = validateAdapterSignal(normalized);

  if (!validation.ok) {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLines: [`❌ ${label} — Invalid payload`],
    };
  }

  try {
    const signal = toWorldLoopsSignal(validation.signal);
    const result = await callWorldLoopsBrief({ signals: [signal], mode: 'reconciliation' });
    const candidates = result.proposalCandidates ?? [];
    return {
      id: sourceId, label, emoji, file, found: true, ok: result.ok, candidates,
      summaryLines: buildSummaryLines(sourceId, label, emoji, candidates, evidence),
    };
  } catch {
    return {
      id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
      summaryLines: [`⚠️ ${label} — Guard check unavailable`],
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
    lines.push('No local handoff payloads found yet.');
    lines.push('');
    lines.push('Add payloads here:');
    for (const src of SOURCES) {
      lines.push(`- ${src.label}: ${DEFAULT_INBOX_DIR}/${src.file}`);
    }
    lines.push('');
    lines.push('Then run:');
    lines.push('npm run guard:daily');
    lines.push('');
    lines.push('Source systems stay untouched.');
    lines.push('externalWrite:false');
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
    for (const line of r.summaryLines) {
      lines.push(line);
    }
    lines.push('');
  }

  return lines;
}
