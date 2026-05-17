import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';

import type { Signal } from '../types';
import { callWorldLoopsBrief } from '../brief';
import { gmailWebhookToSignals } from '../adapters/openclawGmail';
import { calendarEventsToSignals } from '../adapters/openclawCalendar';
import { gogGmailToSignals, gogCalendarToSignals } from '../adapters/gogSnapshot';

function getFlagValue(flag: string): string | undefined {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function loadJson<T>(filePath: string): T {
  const resolved = path.resolve(filePath);
  return JSON.parse(fs.readFileSync(resolved, 'utf8')) as T;
}

async function main(): Promise<void> {
  const gmailEventInput = getFlagValue('--gmail-event');
  const calendarEventInput = getFlagValue('--calendar-event');
  const gogGmailInput = getFlagValue('--gog-gmail');
  const gogCalendarInput = getFlagValue('--gog-calendar');

  const signals: Signal[] = [];
  const sources: string[] = [];

  if (gmailEventInput) {
    signals.push(...gmailWebhookToSignals(loadJson(gmailEventInput)));
    sources.push('openclaw.gmail_event');
  }

  if (calendarEventInput) {
    signals.push(...calendarEventsToSignals(loadJson(calendarEventInput)));
    sources.push('openclaw.calendar_event');
  }

  if (gogGmailInput) {
    signals.push(...gogGmailToSignals(loadJson(gogGmailInput)));
    sources.push('gog.gmail_snapshot');
  }

  if (gogCalendarInput) {
    signals.push(...gogCalendarToSignals(loadJson(gogCalendarInput)));
    sources.push('gog.calendar_snapshot');
  }

  if (signals.length === 0) {
    printJson({
      ok: false,
      error: {
        code: 'MISSING_SIGNALS',
        message:
          'Provide at least one input: --gmail-event, --calendar-event, --gog-gmail, or --gog-calendar.',
      },
      safety: {
        externalWrite: false,
      },
    });
    process.exit(1);
  }

  const result = await callWorldLoopsBrief({
    signals,
    mode: 'reconciliation',
  });

  printJson({
    ...result,
    mode: 'reconciliation',
    source: 'worldloops.public',
    metadata: {
      ...(result.metadata ?? {}),
      signalCount: signals.length,
      sources,
    },
    safety: {
      ...(result.safety ?? {}),
      externalWrite: false,
    },
  });
}

main().catch((err: unknown) => {
  printJson({
    ok: false,
    error: {
      code: 'WORLDLOOPS_PUBLIC_BRIEF_FAILED',
      message: err instanceof Error ? err.message : String(err),
    },
    safety: {
      externalWrite: false,
    },
  });

  process.exit(1);
});
