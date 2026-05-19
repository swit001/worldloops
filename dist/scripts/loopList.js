"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openLoopStates_1 = require("../storage/openLoopStates");
const capabilityBoundary_1 = require("../policy/capabilityBoundary");
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function main() {
    const loops = (0, openLoopStates_1.loadOpenLoopStates)();
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
main();
//# sourceMappingURL=loopList.js.map