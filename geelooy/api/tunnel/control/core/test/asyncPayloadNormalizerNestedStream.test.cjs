// B"H
const assert = require("assert");
const { normalizeAsyncPayload } = require("../asyncPayloadNormalizer.js");

/**
 * B"H
 * Chapter 825: stderr hidden in params was redeemed from the default stdout.
 */
const page = { action: "commandJobOutputPage", stream: "stdout", params: JSON.stringify({ jobId: "cmdjob_bh", stream: "stderr", offsetChars: 9, maxChars: 77 }) };
normalizeAsyncPayload(page);
assert.equal(page.jobId, "cmdjob_bh");
assert.equal(page.stream, "stderr");
assert.equal(page.offsetChars, 9);
assert.equal(page.maxChars, 77);

const wait = { action: "commandWait", params: { jobId: "cmdjob_wait", waitTimeoutMs: 1 } };
normalizeAsyncPayload(wait);
assert.equal(wait.jobId, "cmdjob_wait");
assert.equal(wait.stream, "stdout");

console.log(JSON.stringify({ ok: true, suite: "async-payload-normalizer-nested-stream" }, null, 2));
