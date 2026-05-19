"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openLoopStates_1 = require("../storage/openLoopStates");
const capabilityBoundary_1 = require("../policy/capabilityBoundary");
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
}
function printTable(loops) {
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
function main() {
    const args = process.argv.slice(2);
    const jsonMode = args.includes('--json');
    const loops = (0, openLoopStates_1.loadOpenLoopStates)();
    if (jsonMode) {
        printJson({
            ok: true,
            source: 'worldloops.local',
            path: (0, openLoopStates_1.getOpenLoopStatesPath)(),
            count: loops.length,
            loops,
            capabilityBoundary: (0, capabilityBoundary_1.getCapabilityBoundary)(),
            safety: { externalWrite: false },
        });
    }
    else {
        printTable(loops);
    }
}
main();
//# sourceMappingURL=loopList.js.map