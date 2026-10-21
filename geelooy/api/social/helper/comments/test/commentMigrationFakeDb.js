//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file commentMigrationFakeDb.js
 * @description Fake old comment DB extracted verbatim from commentMigration.test.js.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

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

module.exports = { fakeOldCommentDb };