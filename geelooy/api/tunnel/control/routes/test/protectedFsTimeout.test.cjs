// B"H
const assert = require("assert");
const { boundedTunnelTimeout, ONE_DAY_MS } = require("../protectedFs.js");

assert.strictEqual(boundedTunnelTimeout(7200000), 7200000);
assert.strictEqual(boundedTunnelTimeout(999), 1000);
assert.throws(() => boundedTunnelTimeout(ONE_DAY_MS + 1), /timeout_too_large/);
console.log("BHY protected fs timeout tests passed");
