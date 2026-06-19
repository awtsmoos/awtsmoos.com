// B"H
const assert = require("assert");
const os = require("os");
const path = require("path");
const fs = require("fs");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awt-peruta-test-"));
process.env.__awtsdir = dir;

const usage = require("../usageStore.js");
const first = usage.usageSummary("user-one");
assert.strictEqual(usage.DAILY_FREE_PERUTAS, 100000);
assert.strictEqual(usage.MAX_FREE_BALANCE, 300000);
assert.strictEqual(usage.PURCHASE_URL, "https://awtsmoos.com/compute");
assert(first.perutaBalance >= 100000);
const estimate = usage.estimatePayloadCost({ action: "bulkSearch", maxFiles: 1000000, maxBytes: 1000000000, timeoutMs: 7200000 });
assert(estimate.estimatedPerutas > 0);
const afford = usage.canAfford("user-one", { action: "bulkSearch", maxFiles: 999999999, maxBytes: 999999999999, timeoutMs: 86400000 });
assert.strictEqual(afford.ok, false);
assert(afford.messageForAi.includes("INSUFFICIENT PERUTAS"));
assert(afford.messageForAi.includes("https://awtsmoos.com/compute"));
const charge = usage.chargeUsage({ userId: "user-one", action: "read", bytes: 1000000, ok: true });
assert(charge.chargedPerutas > 0);
assert(charge.balance < first.perutaBalance);
const added = usage.addPerutas("user-one", 25, { kind: "paypal_sandbox_capture", orderId: "TEST" });
assert.strictEqual(added.ok, true);
assert(usage.usageSummary("user-one").lastLedger.some(x => x.kind === "paypal_sandbox_capture"));
console.log("BHY usage peruta tests passed");
