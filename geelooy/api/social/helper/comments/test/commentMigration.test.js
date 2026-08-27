// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { migrateParentCommentsToAwtsmoosDb } = require("../commentMigration.js");
const { searchCommentSearchRecords } = require("../commentAwtsmoosDbBridge.js");
const {
    getCommentsByAliasAtVerseSection,
    getAuthorsCommentingAtVerseSectionInParent,
    getVerseSectionsCommentedByAuthorInParent
} = require("../commentRetrieval.js");

function fakeOldCommentDb() {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-comment-migration-"));
    const store = new Map();
    return {
        directory,
        store,
        async get(filePath) {
            const value = store.get(filePath);
            if (value && typeof value === "object" && !Array.isArray(value)) return Object.keys(value);
            return value || [];
        },
        async getObjectKeys(filePath) { return Object.keys(store.get(filePath) || {}); },
        async getObjectKey(filePath, key) { return store.get(filePath)?.[key] || []; },
        seed(filePath, value) { store.set(filePath, value); }
    };
}

(async () => {
    const db = fakeOldCommentDb();
    const $i = { db, $_GET: {} };
    const parentBase = "/social/heichelos/h1/comments/atSeries/s1/atPost/post1";
    const aliasAPath = `${parentBase}/aliasA`;
    const aliasBPath = `${parentBase}/aliasB`;

    db.seed(parentBase, ["aliasA", "aliasB"]);
    db.seed(aliasAPath, {
        root: [{ content: "Legacy root comment searchable forever.", dayuh: { verseSection: "root" } }],
        7: [{ id: "legacy-7", content: "Legacy verse seven binary spark.", dayuh: { verseSection: 7, subSection: 2 } }]
    });
    db.seed(aliasBPath, { 7: [{ content: "Another migrated comment.", dayuh: { verseSection: 7 } }] });

    const report = await migrateParentCommentsToAwtsmoosDb({
        $i,
        heichelId: "h1",
        seriesId: "s1",
        parentType: "post",
        parentId: "post1",
        postId: "post1"
    });

    assert.equal(report.success, true);
    assert.equal(report.aliasesSeen, 2);
    assert.equal(report.migrated, 3);
    assert.equal(report.indexed, 3);
    assert.equal(report.sharded, 0);
    assert.equal(report.packedMirrorWritten, false);
    assert.equal(report.skipped, 0);
    assert.equal(report.errors.length, 0);

    const found = await searchCommentSearchRecords({ $i, heichelId: "h1", seriesId: "s1", query: "binary" });
    assert.equal(found.success.length, 1);
    assert.equal(found.success[0].record.id, "legacy-7");
    assert.equal(found.success[0].record.metadata.storageEngine, "awtsmoosDb");
    assert.equal(found.success[0].record.metadata.storageFormat, "single-authority-comment-tree");
    assert.equal(found.success[0].record.metadata.storageType, "search-sidecar");
    assert.equal(found.success[0].record.metadata.duplicateCommentStorage, false);
    assert.equal(found.success[0].record.metadata.migration.source, "legacy-comment-paths");
    assert.equal(found.success[0].record.metadata.migration.packedMirrorWritten, false);

    const migratedGenerated = await searchCommentSearchRecords({ $i, heichelId: "h1", seriesId: "s1", query: "forever" });
    assert.equal(migratedGenerated.success.length, 1);
    assert.ok(migratedGenerated.success[0].record.id.startsWith("BH_migrated_aliasA_root_0"));

    db.store.delete(parentBase);
    db.store.delete(aliasAPath);
    db.store.delete(aliasBPath);

    const noFallbackComments = await getCommentsByAliasAtVerseSection({
        $i,
        aliasId: "aliasA",
        heichelId: "h1",
        seriesId: "s1",
        parentType: "post",
        parentId: "post1",
        postId: "post1",
        verseSection: "7"
    });
    assert.equal(noFallbackComments.success.length, 0);
    assert.notEqual(noFallbackComments.fallbackSource, "packed-comment-shard");

    const noFallbackAuthors = await getAuthorsCommentingAtVerseSectionInParent({
        $i,
        heichelId: "h1",
        seriesId: "s1",
        parentType: "post",
        parentId: "post1",
        postId: "post1",
        verseSection: "7"
    });
    assert.deepEqual(noFallbackAuthors.success.sort(), []);

    const noFallbackSections = await getVerseSectionsCommentedByAuthorInParent({
        $i,
        aliasId: "aliasA",
        heichelId: "h1",
        seriesId: "s1",
        parentType: "post",
        parentId: "post1",
        postId: "post1"
    });
    assert.deepEqual(noFallbackSections.success.sort(), []);

    console.log('B"H commentMigration.test passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
