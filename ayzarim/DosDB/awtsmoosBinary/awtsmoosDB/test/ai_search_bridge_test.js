// B"H
/**
 * @file ai_search_bridge_test.js
 * @description
 * Verifies the AI search bridge opens a parallel AwtsmoosDB vessel and exposes
 * a fast comment indexing/search contract without disturbing DosDB tests.
 */

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createAiSearchDb } = require("../../../aiSearch/index.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-ai-search-"));
const ai = createAiSearchDb(root);

assert.ok(ai.awtsmoosDb, "parallel AwtsmoosDB should be available");
assert.ok(ai.path.endsWith("ai-search.awtsdb"), "default AI search DB name should be used");

const indexed = ai.indexCommentRecord({
    id: "comment-1",
    aliasId: "rebbe",
    parentId: "post-7",
    content: "The anchored inline spark searches the living subsection.",
    metadata: { section: 7 }
});

assert.equal(indexed.id, "comment-1");
assert.equal(indexed.embedding.length, 384);
assert.equal(indexed.metadata.embeddingProvider, "awtsmoosdb-js-fallback");
assert.equal(indexed.metadata.embeddingModel, "bge-small-en-v1.5-q8_0");
assert.equal(indexed.metadata.ggufFile, "bge-small-en-v1.5-q8_0.gguf");
assert.ok(indexed.metadata.lexicalSignature, "lexical signature should be stored for repair/search metadata");
assert.equal(indexed.metadata.textLength, indexed.text.length);

const results = ai.searchCommentRecords("inline subsection");
assert.equal(results.length, 1);
assert.equal(results[0].record.id, "comment-1");
assert.ok(results[0].score >= 2);

const stats = ai.stats();
assert.equal(stats.count, 1);
assert.equal(stats.embeddedCount, 1);
assert.equal(stats.hasAwtsmoosDb, true);
assert.ok(stats.latestIndexedAt > 0);

console.log('B"H ai_search_bridge_test passed');
