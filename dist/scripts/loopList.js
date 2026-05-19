"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const openLoopStates_1 = require("../storage/openLoopStates");
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
        safety: { externalWrite: false },
    });
}
main();
//# sourceMappingURL=loopList.js.map