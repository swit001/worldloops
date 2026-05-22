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
const https = __importStar(require("node:https"));
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const openclawIntake_1 = require("../openclawIntake");
const FIXTURE_PATH = 'scripts/fixtures/openclaw-signal-intake/mixed-observations.json';
const MAX_LENGTH = 4096;
const TRUNCATION_SUFFIX = '\n… truncated for Telegram test output';
function loadToken() {
    if (process.env.TELEGRAM_BOT_TOKEN) {
        return process.env.TELEGRAM_BOT_TOKEN.trim();
    }
    const envFile = path.join(process.env.HOME ?? '', '.claude', 'channels', 'telegram', '.env');
    if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        const match = /^TELEGRAM_BOT_TOKEN\s*=\s*(.+)$/m.exec(content);
        if (match)
            return match[1].trim();
    }
    throw new Error('TELEGRAM_BOT_TOKEN not found. Set env var or add to ~/.claude/channels/telegram/.env');
}
function telegramRequest(token, method, body, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${token}/${method}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            },
        }, (res) => {
            let raw = '';
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(raw));
                }
                catch {
                    reject(new Error(`JSON parse error: ${raw.slice(0, 200)}`));
                }
            });
        });
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}
function telegramGet(token, method, params, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const query = Object.entries(params)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&');
        const req = https.request({
            hostname: 'api.telegram.org',
            path: `/bot${token}/${method}${query ? '?' + query : ''}`,
            method: 'GET',
        }, (res) => {
            let raw = '';
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(raw));
                }
                catch {
                    reject(new Error(`JSON parse error: ${raw.slice(0, 200)}`));
                }
            });
        });
        req.setTimeout(timeoutMs, () => {
            req.destroy(new Error(`Request timeout after ${timeoutMs}ms`));
        });
        req.on('error', reject);
        req.end();
    });
}
async function sendMessage(token, chatId, text) {
    await telegramRequest(token, 'sendMessage', { chat_id: chatId, text });
}
function truncate(text) {
    if (text.length <= MAX_LENGTH)
        return text;
    const cutoff = MAX_LENGTH - TRUNCATION_SUFFIX.length;
    return text.slice(0, cutoff) + TRUNCATION_SUFFIX;
}
function runBrief() {
    const fixturePath = path.resolve(process.cwd(), FIXTURE_PATH);
    if (!fs.existsSync(fixturePath)) {
        return `Error: fixture not found at ${fixturePath}`;
    }
    let observations;
    try {
        observations = (0, openclawIntake_1.loadObservations)(fixturePath);
    }
    catch (err) {
        return `Error loading fixture: ${String(err)}`;
    }
    let summary;
    try {
        summary = (0, openclawIntake_1.runIntake)(observations);
    }
    catch (err) {
        return `Error running intake: ${String(err)}`;
    }
    const lines = [];
    lines.push('WorldLoops Morning Brief');
    lines.push('');
    lines.push(`OpenClaw observed ${summary.total} candidate signals.`);
    lines.push('');
    lines.push('WorldLoops adjudication:');
    lines.push(`- ${summary.accepted} accepted as new open loops`);
    if (summary.state_transition > 0) {
        lines.push(`- ${summary.state_transition} state transition${summary.state_transition > 1 ? 's' : ''} applied`);
    }
    lines.push(`- ${summary.suppressed} suppressed as noise / no-action / promotional`);
    lines.push(`- ${summary.attached_context} attached as related context`);
    lines.push(`- ${summary.needs_review} needs review`);
    const accepted = summary.results.filter(r => r.verdict === 'accepted');
    if (accepted.length > 0) {
        lines.push('');
        lines.push('Open loops created or changed:');
        for (const r of accepted) {
            const transitionKey = `openclaw-${r.observation.source}-${r.observation.sourceId}`;
            const transition = summary.results.find(t => t.verdict === 'state_transition' &&
                t.stateTransition?.canonicalKey === transitionKey &&
                t.stateTransition.transitionApplied);
            if (transition?.stateTransition) {
                lines.push(`- ${r.openLoopTitle} (${transition.stateTransition.note})`);
            }
            else {
                lines.push(`- ${r.openLoopTitle}`);
            }
        }
    }
    if (summary.morningBriefLines.length > 0) {
        lines.push('');
        for (const line of summary.morningBriefLines) {
            lines.push(line);
        }
    }
    lines.push('');
    lines.push('externalWrite:false');
    return truncate(lines.join('\n'));
}
const BRIEF_TRIGGERS = ['/brief', '/worldloops', '오늘 내가 할 일이 뭐야', '뭐 빠진 거 없어'];
function isBriefRequest(text) {
    const lower = text.toLowerCase().trim();
    return BRIEF_TRIGGERS.some(t => lower.startsWith(t.toLowerCase()));
}
async function handleUpdate(token, update) {
    const message = update.message;
    if (!message)
        return;
    const chatId = message.chat?.id;
    const text = message.text;
    if (!chatId || !text)
        return;
    const trimmed = text.trim();
    if (trimmed === '/start') {
        await sendMessage(token, chatId, "WorldLoops Telegram test bot is running. Send /brief or ask '오늘 내가 할 일이 뭐야?'");
        return;
    }
    if (trimmed === '/status') {
        let version = 'unknown';
        try {
            const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
            version = pkg.version ?? 'unknown';
        }
        catch {
            // leave as unknown
        }
        await sendMessage(token, chatId, [
            'WorldLoops Telegram test bot: running',
            `version: ${version}`,
            'externalWrite:false',
        ].join('\n'));
        return;
    }
    if (isBriefRequest(trimmed) || !trimmed.startsWith('/')) {
        const reply = runBrief();
        await sendMessage(token, chatId, reply);
        return;
    }
    // Unknown command
    await sendMessage(token, chatId, "Unknown command. Try /brief, /status, or send '오늘 내가 할 일이 뭐야?'");
}
async function poll(token, offset) {
    // timeout=30 → 35s socket timeout to give Telegram time to respond
    const response = (await telegramGet(token, 'getUpdates', { offset, timeout: 30, allowed_updates: 'message' }, 35000));
    if (!response.ok) {
        if (response.error_code === 409) {
            throw new Error('Polling conflict (409): another bot process is already polling this token. Stop it first.');
        }
        throw new Error(`getUpdates failed [${response.error_code ?? '?'}]: ${response.description ?? JSON.stringify(response)}`);
    }
    const updates = response.result ?? [];
    const nextOffset = updates.length > 0 ? updates[updates.length - 1].update_id + 1 : offset;
    return { updates, nextOffset };
}
async function main() {
    let token;
    try {
        token = loadToken();
    }
    catch (err) {
        process.stderr.write(`Error: ${String(err)}\n`);
        process.exit(1);
    }
    console.log('WorldLoops Telegram test bot starting...');
    console.log('Polling for messages. Send /brief or a message to @WorldLoops_bot.');
    console.log('Press Ctrl+C to stop.\n');
    let offset = 0;
    for (;;) {
        try {
            const { updates, nextOffset } = await poll(token, offset);
            offset = nextOffset;
            for (const update of updates) {
                try {
                    await handleUpdate(token, update);
                }
                catch (err) {
                    process.stderr.write(`Error handling update ${update.update_id}: ${String(err)}\n`);
                }
            }
        }
        catch (err) {
            const msg = String(err);
            if (msg.includes('409')) {
                process.stderr.write(`Fatal: ${msg}\n`);
                process.exit(1);
            }
            process.stderr.write(`Polling error (retrying in 5s): ${msg}\n`);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}
main();
//# sourceMappingURL=telegramTestBot.js.map