// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { addOrApproveComment } = require("../commentCreation.js");
const { getCommentsByAliasAtVerseSection } = require("../commentRetrieval.js");
const { searchCommentSearchRecords } = require("../commentAwtsmoosDbBridge.js");

function createFakeDb() {
    const store = new Map();
    return {
        directory: fs.mkdtempSync(path.join(os.tmpdir(), "awts-comment-create-")),
        store,
        async appendToArrayAtKey(filePath, { key, shtar }) {
            const object = store.get(filePath) || {};
            object[key] = Array.isArray(object[key]) ? object[key] : [];
            object[key].push(shtar);
            store.set(filePath, object);
            return { success: true, filePath, key, count: object[key].length };
        },
        async getObjectKey(filePath, key) {
            return store.get(filePath)?.[key] || [];
        },
        async getObjectKeys(filePath) {
            return Object.keys(store.get(filePath) || {});
        },
        async hasObjectKey(filePath, key) {
            return Array.isArray(store.get(filePath)?.[key]);
        },
        async get(filePath) {
            const value = store.get(filePath);
            if (value && typeof value === "object" && !Array.isArray(value)) return Object.keys(value);
            return value;
        },
        async syncKeyInObj(filePath, key) {
            const object = store.get(filePath) || {};
            object[key] = true;
            store.set(filePath, object);
            return { success: true };
        },
        async write(filePath, value) {
            store.set(filePath, value);
            return { success: true };
        }
    };
}

(async () => {
    const $i = {
        $_GET: {},
        $_POST: {
            content: "A searchable direct comment for the old reader.",
            dayuh: JSON.stringify({ verseSection: 5, subSection: 2, semanticFingerprint: "searchable direct" })
        },
        db: createFakeDb(),
        fetchAwtsmoos: async () => []
    };

    const added = await addOrApproveComment({
        $i,
        parentType: "post",
        parentId: "post1",
        postId: "post1",
        heichelId: "h1",
        aliasId: "aliasA",
        userid: "u1",
        seriesId: "s1"
    });

    assert.equal(added.success, true);
    assert.equal(added.details.verseSection, 5);
    assert.equal(added.details.searchIndex.success, true);

    const read = await getCommentsByAliasAtVerseSection({
        $i,
        aliasId: "aliasA",
        parentType: "post",
        parentId: "post1",
        heichelId: "h1",
        postId: "post1",
        seriesId: "s1",
        verseSection: 5
    });

    assert.equal(read.success.length, 1, "existing getObjectKey reader must still see the canonical comment");
    assert.equal(read.success[0].id, added.details.id);
    assert.equal(read.success[0].content, "A searchable direct comment for the old reader.");

    const found = await searchCommentSearchRecords({ $i, query: "searchable", heichelId: "h1", seriesId: "s1" });
    assert.equal(found.success.length, 1);
    assert.equal(found.success[0].record.id, added.details.id);

    console.log('B"H commentCreationSidecarRead.test passed');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
