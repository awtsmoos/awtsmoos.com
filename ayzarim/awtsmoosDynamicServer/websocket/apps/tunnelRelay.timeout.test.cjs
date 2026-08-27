// B"H
const assert = require("assert");
const { FOUR_MINUTES_MS, ONE_DAY_MS, boundedTimeout } = require("./tunnelRelay.js");

assert.equal(boundedTimeout(), FOUR_MINUTES_MS);
assert.equal(boundedTimeout(1), 1000);
assert.equal(boundedTimeout(FOUR_MINUTES_MS + 1), FOUR_MINUTES_MS + 1);
assert.equal(boundedTimeout(ONE_DAY_MS), ONE_DAY_MS);
assert.equal(boundedTimeout(ONE_DAY_MS + 999999), ONE_DAY_MS);
assert.equal(boundedTimeout("7200000"), 7200000);
assert.equal(boundedTimeout("not-a-number"), FOUR_MINUTES_MS);

console.log(JSON.stringify({ ok: true, suite: "tunnel-relay-timeout", maxTimeoutMs: ONE_DAY_MS }, null, 2));
