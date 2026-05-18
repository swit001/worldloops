"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const transitionReceipts_1 = require("../storage/transitionReceipts");
function printJson(value) {
    console.log(JSON.stringify(value, null, 2));
}
function main() {
    const receipts = (0, transitionReceipts_1.loadTransitionReceipts)();
    printJson({
        ok: true,
        source: 'worldloops.local',
        path: (0, transitionReceipts_1.getTransitionReceiptsPath)(),
        count: receipts.length,
        receipts,
        safety: { externalWrite: false },
    });
}
main();
//# sourceMappingURL=receiptList.js.map