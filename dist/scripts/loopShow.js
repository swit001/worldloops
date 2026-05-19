"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openLoopStates_1 = require("../storage/openLoopStates");
const capabilityBoundary_1 = require("../policy/capabilityBoundary");
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function main() {
    const [, , loopId] = process.argv;
    if (!loopId) {
        printJson({
            ok: false,
            error: {
                code: 'MISSING_LOOP_ID',
                message: 'Usage: npm run loop:show -- <loopId>',
            },
            safety: { externalWrite: false },
        });
        process.exit(1);
    }
    const loop = (0, openLoopStates_1.findOpenLoopStateById)(loopId);
    if (!loop) {
        const loops = (0, openLoopStates_1.loadOpenLoopStates)();
        printJson({
            ok: false,
            error: {
                code: 'LOOP_NOT_FOUND',
                message: `Open loop not found: ${loopId}`,
            },
            availableLoopIds: loops.map((item) => ({
                id: item.id,
                canonicalKey: item.canonicalKey,
                title: item.title,
                status: item.status,
                severity: item.severity,
            })),
            capabilityBoundary: (0, capabilityBoundary_1.getCapabilityBoundary)(),
            safety: { externalWrite: false },
        });
        process.exit(1);
    }
    printJson({
        ok: true,
        source: 'worldloops.local',
        loop: {
            id: loop.id,
            canonicalKey: loop.canonicalKey,
            title: loop.title,
            status: loop.status,
            severity: loop.severity,
            owner: loop.owner,
            dueAt: loop.dueAt,
            lastObservedAt: loop.lastObservedAt,
            updatedAt: loop.updatedAt,
            adjudication: loop.adjudication,
            sourceSignals: loop.sourceSignals,
            history: loop.history,
            safety: loop.safety,
        },
        capabilityBoundary: (0, capabilityBoundary_1.getCapabilityBoundary)(),
        safety: { externalWrite: false },
    });
}
main();
//# sourceMappingURL=loopShow.js.map