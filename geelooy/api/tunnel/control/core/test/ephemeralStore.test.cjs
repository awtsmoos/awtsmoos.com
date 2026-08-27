// B"H
const assert = require("assert");
const { putEphemeral, getDescriptor, pageEphemeral, searchEphemeral, deleteEphemeral } = require("../ephemeralStore.js");
const { maybeExternalize } = require("../responseModes.js");

const big = { ok: true, action: "bulk", content: "needle ".repeat(20000), returnedCount: 7 };
const wrapped = maybeExternalize(big, { action: "bulk", responseMode: "auto", maxInlineBytes: 1000, ttlSeconds: 1800 });
assert.strictEqual(wrapped.responseMode, "ephemeral");
assert.strictEqual(wrapped.externalized, true);
assert(wrapped.resultRef.startsWith("awtsmoos://turn-result/"));
const id = wrapped.ephemeral.id;
assert(getDescriptor(id));
const page = pageEphemeral(id, { maxBytes: 500 });
assert.strictEqual(page.ok, true);
assert.strictEqual(page.returnedBytes, 500);
assert.strictEqual(page.hasNextPage, true);
const found = searchEphemeral(id, "needle", { limit: 3 });
assert.strictEqual(found.returnedResults, 3);
assert.strictEqual(deleteEphemeral(id).deleted, true);
assert.strictEqual(getDescriptor(id), null);
const human = maybeExternalize(big, { action: "bulk", responseMode: "url", controlBaseUrl: "https://awtsmoos.com/api/tunnel/control/fs/x", maxInlineBytes: 1000 });
assert.strictEqual(human.responseMode, "url");
assert(human.contentUrl.includes("/blob/"));
console.log("BHY ephemeral store/response tests passed");
