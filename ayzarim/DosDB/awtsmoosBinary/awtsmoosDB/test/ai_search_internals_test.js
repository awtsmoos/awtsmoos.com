// B"H
/**
 * @file ai_search_internals_test.js
 * @description Tests record normalization and memory-index behavior directly.
 */

const assert = require("assert");
const { normalizeAiSearchRecord } = require("../../../aiSearch/recordShape.js");
const { createMemoryIndex, scoreRecord } = require("../../../aiSearch/memoryIndex.js");

const normalized = normalizeAiSearchRecord({
  commentId: "c-7",
  author: "maggid",
  postId: "post-1",
  dayuh: { content: "   Hidden   sparks    return   " },
  metadata: { source: "unit" },
  embedding: [1, 2, 3]
});

assert.equal(normalized.id, "c-7");
assert.equal(normalized.aliasId, "maggid");
assert.equal(normalized.parentId, "post-1");
assert.equal(normalized.text, "Hidden sparks return");
assert.equal(normalized.metadata.source, "unit");
assert.equal(normalized.metadata.textLength, normalized.text.length);
assert.ok(normalized.metadata.lexicalSignature);
assert.deepEqual(normalized.embedding, [1, 2, 3]);

const index = createMemoryIndex();
index.upsert({ id: "b", text: "alpha beta", metadata: {} });
index.upsert({ id: "a", text: "alpha beta", metadata: {} });
index.upsert({ id: "c", text: "gamma", metadata: { tag: "beta" } });

assert.equal(scoreRecord({ text: "alpha beta", metadata: {} }, "alpha missing"), 1);
assert.deepEqual(index.search("alpha beta").map(item => item.record.id), ["a", "b", "c"]);
assert.deepEqual(index.search("beta").map(item => item.record.id), ["a", "b", "c"]);
assert.equal(index.search("").length, 3);
assert.equal(index.all().length, 3);

console.log('B"H ai_search_internals_test passed');
