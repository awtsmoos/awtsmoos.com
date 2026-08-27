// B"H
const assert = require("assert");
const { buildFsPayload } = require("../tunnelPayload.js");

function req(GET) { return { paramKinds: { GET } }; }

const payload = buildFsPayload(req({
  action: "bulk",
  maxFiles: "2500000",
  maxResults: "1500000",
  pageSize: "1000000",
  maxChars: "900000000",
  totalMaxChars: "1200000000",
  maxBytes: "987654321",
  timeoutMs: "7200000",
  maxInlineBytes: "500000000"
}));

assert.strictEqual(payload.maxFiles, 2500000);
assert.strictEqual(payload.maxResults, 1500000);
assert.strictEqual(payload.pageSize, 1000000);
assert.strictEqual(payload.maxChars, 900000000);
assert.strictEqual(payload.totalMaxChars, 1200000000);
assert.strictEqual(payload.maxBytes, 987654321);
assert.strictEqual(payload.timeoutMs, 7200000);
assert.strictEqual(payload.maxInlineBytes, 500000000);
console.log("BHY tunnel payload no-hard-cap tests passed");
