import { loadOpenLoopStates, getOpenLoopStatesPath } from '../storage/openLoopStates';
import { getCapabilityBoundary } from '../policy/capabilityBoundary';

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function main(): void {
  const loops = loadOpenLoopStates();

  printJson({
    ok: true,
    source: 'worldloops.local',
    path: getOpenLoopStatesPath(),
    count: loops.length,
    loops,
    capabilityBoundary: getCapabilityBoundary(),
    safety: { externalWrite: false },
  });
}

main();
