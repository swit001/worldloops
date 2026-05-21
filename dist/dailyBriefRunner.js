"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOURCES = exports.DEFAULT_INBOX_DIR = void 0;
exports.processSource = processSource;
exports.processAllSources = processAllSources;
exports.buildBriefLines = buildBriefLines;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const brief_1 = require("./brief");
const validateAdapterSignal_1 = require("./adapter/validateAdapterSignal");
const toWorldLoopsSignal_1 = require("./adapter/toWorldLoopsSignal");
const gogGmail_1 = require("./adapters/gogGmail");
const gogCalendar_1 = require("./adapters/gogCalendar");
const slackPayload_1 = require("./adapters/slackPayload");
exports.DEFAULT_INBOX_DIR = '.worldloops/inbox';
exports.SOURCES = [
    { id: 'gmail', file: 'openclaw-gmail-live.json', label: 'Gmail', emoji: '⚠️' },
    { id: 'calendar', file: 'openclaw-calendar-live.json', label: 'Calendar', emoji: '📅' },
    { id: 'slack', file: 'openclaw-slack-live.json', label: 'Slack', emoji: '💬' },
];
function normalizePayload(sourceId, raw) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
        return raw;
    if (sourceId === 'gmail' && (0, gogGmail_1.isGogGmailPayload)(raw)) {
        return (0, gogGmail_1.gogGmailToAdapterSignal)(raw);
    }
    if (sourceId === 'calendar' && (0, gogCalendar_1.isGogCalendarPayload)(raw)) {
        return (0, gogCalendar_1.gogCalendarToAdapterSignal)(raw);
    }
    if (sourceId === 'slack' && (0, slackPayload_1.isSlackHostPayload)(raw)) {
        return (0, slackPayload_1.slackPayloadToAdapterSignal)(raw);
    }
    const obj = raw;
    if (!obj.source)
        obj.source = sourceId;
    if (!obj.sourceType)
        obj.sourceType = 'message';
    if (obj.externalWrite === undefined)
        obj.externalWrite = false;
    if (!obj.observedAt)
        obj.observedAt = new Date().toISOString();
    return raw;
}
function buildSummaryLine(sourceId, label, emoji, candidates) {
    if (candidates.length === 0) {
        return `${emoji} ${label} — No actionable loop detected`;
    }
    const first = candidates[0];
    let defaultReason;
    if (sourceId === 'gmail')
        defaultReason = 'Follow-up needed';
    else if (sourceId === 'calendar')
        defaultReason = 'Preparation needed';
    else
        defaultReason = 'Action requested';
    return `${emoji} ${label} — ${first.reason || defaultReason}`;
}
async function processSource(sourceId, file, label, emoji, inboxDir) {
    const filePath = path.join(inboxDir, file);
    const found = fs.existsSync(filePath);
    if (!found) {
        return { id: sourceId, label, emoji, file, found: false, ok: false, candidates: [], summaryLine: '' };
    }
    let raw;
    try {
        raw = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    }
    catch {
        return {
            id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
            summaryLine: `❌ ${label} — Error reading payload`,
        };
    }
    const normalized = normalizePayload(sourceId, raw);
    const validation = (0, validateAdapterSignal_1.validateAdapterSignal)(normalized);
    if (!validation.ok) {
        return {
            id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
            summaryLine: `❌ ${label} — Invalid payload`,
        };
    }
    try {
        const signal = (0, toWorldLoopsSignal_1.toWorldLoopsSignal)(validation.signal);
        const result = await (0, brief_1.callWorldLoopsBrief)({ signals: [signal], mode: 'reconciliation' });
        const candidates = result.proposalCandidates ?? [];
        return {
            id: sourceId, label, emoji, file, found: true, ok: result.ok, candidates,
            summaryLine: buildSummaryLine(sourceId, label, emoji, candidates),
        };
    }
    catch {
        return {
            id: sourceId, label, emoji, file, found: true, ok: false, candidates: [],
            summaryLine: `⚠️ ${label} — Guard check unavailable`,
        };
    }
}
async function processAllSources(inboxDir) {
    const results = [];
    for (const src of exports.SOURCES) {
        results.push(await processSource(src.id, src.file, src.label, src.emoji, inboxDir));
    }
    return results;
}
function buildBriefLines(results) {
    const lines = [];
    const foundResults = results.filter(r => r.found);
    const missingResults = results.filter(r => !r.found);
    if (foundResults.length === 0) {
        lines.push('No local handoff payloads found.');
        lines.push('');
        lines.push('Expected files:');
        for (const src of exports.SOURCES) {
            lines.push(`- ${exports.DEFAULT_INBOX_DIR}/${src.file}`);
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
            lines.push(`No ${r.label} payload found. Save a host-read payload to ${exports.DEFAULT_INBOX_DIR}/openclaw-${r.id}-live.json.`);
        }
    }
    lines.push('');
    lines.push('Open loops:');
    for (const r of foundResults) {
        lines.push(r.summaryLine);
    }
    return lines;
}
//# sourceMappingURL=dailyBriefRunner.js.map