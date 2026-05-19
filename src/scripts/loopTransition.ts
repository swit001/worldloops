import 'dotenv/config';
import { transitionOpenLoopState } from '../storage/openLoopStates';
import type { OpenLoopStatus } from '../types/openLoopState';

const VALID_STATUSES: OpenLoopStatus[] = ['todo', 'doing', 'done', 'snoozed', 'escalated'];

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function main(): void {
  const [, , id, status, ...noteParts] = process.argv;

  if (!id || !status) {
    console.error('Usage: npm run loop:transition -- <loopId> <todo|doing|done|snoozed|escalated> [note]');
    process.exit(1);
  }

  if (!VALID_STATUSES.includes(status as OpenLoopStatus)) {
    console.error(`Invalid status: ${status}`);
    console.error(`Valid statuses: ${VALID_STATUSES.join(', ')}`);
    process.exit(1);
  }

  const updated = transitionOpenLoopState(id, status as OpenLoopStatus, {
    actor: 'worldloops.local',
    note: noteParts.length > 0 ? noteParts.join(' ') : null,
  });

  printJson({
    ok: true,
    source: 'worldloops.local',
    loop: updated,
    safety: { externalWrite: false },
  });
}

main();
