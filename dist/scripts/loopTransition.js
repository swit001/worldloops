"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const openLoopStates_1 = require("../storage/openLoopStates");
const capabilityBoundary_1 = require("../policy/capabilityBoundary");
const VALID_STATUSES = ['todo', 'doing', 'done', 'snoozed', 'escalated'];
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function main() {
    const [, , id, status, ...noteParts] = process.argv;
    if (!id || !status) {
        console.error('Usage: npm run loop:transition -- <loopId> <todo|doing|done|snoozed|escalated> [note]');
        process.exit(1);
    }
    if (!VALID_STATUSES.includes(status)) {
        console.error(`Invalid status: ${status}`);
        console.error(`Valid statuses: ${VALID_STATUSES.join(', ')}`);
        process.exit(1);
    }
    const updated = (0, openLoopStates_1.transitionOpenLoopState)(id, status, {
        actor: 'worldloops.local',
        note: noteParts.length > 0 ? noteParts.join(' ') : null,
    });
    printJson({
        ok: true,
        source: 'worldloops.local',
        loop: updated,
        capabilityBoundary: (0, capabilityBoundary_1.getCapabilityBoundary)(),
        safety: { externalWrite: false },
    });
}
main();
//# sourceMappingURL=loopTransition.js.map