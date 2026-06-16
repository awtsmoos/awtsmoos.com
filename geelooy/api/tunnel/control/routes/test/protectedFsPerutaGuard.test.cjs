// B"H
const assert = require("assert");
const { PURCHASE_URL, canAfford } = require("../../core/usageStore.js");

const got = canAfford("new-free-user", { action: "bulk", maxFiles: 999999999, maxBytes: 999999999999, timeoutMs: 86400000 });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.purchaseUrl, PURCHASE_URL);
assert(got.messageForAi.includes("INSUFFICIENT PERUTAS"));
assert(got.messageForAi.includes("DO NOT KEEP RETRYING"));
console.log("BHY protected fs peruta guard tests passed");
