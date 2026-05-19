import { loadOpenLoopStates, getOpenLoopStatesPath } from '../storage/openLoopStates';
import { getCapabilityBoundary } from '../policy/capabilityBoundary';

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function printTable(loops: ReturnType<typeof loadOpenLoopStates>): void {
  if (loops.length === 0) {
    console.log('No open loops found.');
    return;
  }

  const cols = {
    id: 36,
    status: 10,
    severity: 8,
    title: 40,
    sourceCount: 7,
    updatedAt: 24,
  };

  const header = [
    'ID'.padEnd(cols.id),
    'STATUS'.padEnd(cols.status),
    'SEVERITY'.padEnd(cols.severity),
    'TITLE'.padEnd(cols.title),
    'SRCS'.padEnd(cols.sourceCount),
    'UPDATED AT',
  ].join('  ');

  const divider = [
    '-'.repeat(cols.id),
    '-'.repeat(cols.status),
    '-'.repeat(cols.severity),
    '-'.repeat(cols.title),
    '-'.repeat(cols.sourceCount),
    '-'.repeat(cols.updatedAt),
  ].join('  ');

  console.log(header);
  console.log(divider);

  for (const loop of loops) {
    const row = [
      loop.id.padEnd(cols.id),
      loop.status.padEnd(cols.status),
      loop.severity.padEnd(cols.severity),
      truncate(loop.title, cols.title).padEnd(cols.title),
      String(loop.sourceSignals.length).padEnd(cols.sourceCount),
      loop.updatedAt,
    ].join('  ');
    console.log(row);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');

  const loops = loadOpenLoopStates();

  if (jsonMode) {
    printJson({
      ok: true,
      source: 'worldloops.local',
      path: getOpenLoopStatesPath(),
      count: loops.length,
      loops,
      capabilityBoundary: getCapabilityBoundary(),
      safety: { externalWrite: false },
    });
  } else {
    printTable(loops);
  }
}

main();
