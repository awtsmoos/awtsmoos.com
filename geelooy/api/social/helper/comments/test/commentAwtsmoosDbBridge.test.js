// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
    getCommentSearchDb,
    normalizeCommentSearchRecord,
    indexCommentSearchRecord,
    searchCommentSearchRecords
} = require("../commentAwtsmoosDbBridge.js");

const $i = {
    db: {
        directory: fs.mkdtempSync(path.join(os.tmpdir(), "awts-comment-sidecar-"))
    }
};

const record = normalizeCommentSearchRecord({
    comment: {
        id: "c1",
        author: "aliasA",
        content: "<b>Hidden searchable spark</b>",
        dayuh: { verseSection: 3, subSection: 1, semanticFingerprint: "hidden searchable" }
    },
    heichelId: "h1",
    seriesId: "s1",
    parentId: "p1",
    parentType: "post",
    postId: "p1",
    aliasId: "aliasA"
});

assert.equal(record.id, "c1");
assert.equal(record.text, "Hidden searchable spark");
assert.equal(record.coordinate.verseSection, 3);
assert.equal(record.coordinate.subSection, 1);
assert.equal(record.metadata.heichelId, "h1");

const db = getCommentSearchDb($i, { heichelId: "h1", seriesId: "s1" });
assert.equal(db.stats().count, 0);

(async () => {
    const indexed = await indexCommentSearchRecord({
        $i,
        comment: record,
        heichelId: "h1",
        seriesId: "s1",
        parentId: "p1",
        parentType: "post",
        postId: "p1",
        aliasId: "aliasA"
    });
    assert.equal(indexed.success, true);
    assert.equal(indexed.stats.count, 1);
    assert.equal(indexed.stats.embeddedCount, 1);
    assert.ok(Array.isArray(indexed.record.embedding));
    assert.equal(indexed.record.embedding.length, 384);
    assert.equal(indexed.record.metadata.embeddingProvider, 'awtsmoosdb-js-fallback');

    const found = await searchCommentSearchRecords({ $i, query: "searchable", heichelId: "h1", seriesId: "s1" });
    assert.equal(found.success.length, 1);
    assert.equal(found.success[0].record.id, "c1");

    console.log('B"H commentAwtsmoosDbBridge.test passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
