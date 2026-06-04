// B"H
/**
 * @file commentMigration.js
 * @chapter The Old Scroll Enters The New Vessel
 * @description
 * Copies legacy comment arrays into the newer comment system: packed shard and
 * AwtsmoosDB search sidecar. The Awtsmoos preserves every spark without
 * duplicating ids already present in the new mirror.
 */

const { getParentCommentsBasePath, getAliasCommentFilePath } = require("./commentPaths.js");
const { indexCommentSearchRecord } = require("./commentAwtsmoosDbBridge.js");
const { readCommentShardRecords, writeCommentShardRecord } = require("./commentShardMirror.js");
const { writeMigrationManifest } = require("../packed/socialPacked.js");

/** @param {object} params @returns {string} */
function stableMigratedId({ comment, aliasId, verseSection, index }) {
    if (comment?.id) return comment.id;
    if (comment?.commentId) return comment.commentId;
    return `BH_migrated_${aliasId}_${verseSection}_${index}`;
}

/** @param {object} params @returns {object} */
function migrationPacket({ sourcePath, aliasId, verseSection, index }) {
    return { version: 2, source: "legacy-comment-paths", sourcePath, aliasId, verseSection, index, migratedAt: Date.now() };
}

/** @param {object} params @returns {Set<string>} */
function existingIds(params) {
    try { return new Set(readCommentShardRecords(params).map(comment => comment?.id).filter(Boolean)); }
    catch (_) { return new Set(); }
}

/** @param {*} value @returns {Array<string>} */
function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

/** @param {object} params @returns {Promise<Array<string>>} */
async function listAliases({ $i, parentBasePath }) {
    try { return names(await $i.db.get(parentBasePath)); }
    catch (_) { return []; }
}

/** @param {object} params @returns {Promise<Array<string>>} */
async function listVerseSections({ $i, aliasPath }) {
    try { return names(await $i.db.getObjectKeys(aliasPath)); }
    catch (_) { return []; }
}

/** @param {object} params @returns {Promise<Array<object>>} */
async function readLegacyComments({ $i, aliasPath, verseSection }) {
    try { const value = await $i.db.getObjectKey(aliasPath, verseSection); return Array.isArray(value) ? value : []; }
    catch (_) { return []; }
}

/** @param {object} params @returns {Promise<object>} */
async function migrateParentCommentsToAwtsmoosDb(params) {
    const { $i, heichelId, seriesId, parentId, parentType = "post", dryRun = false } = params;
    const postId = params.postId || (parentType === "post" ? parentId : undefined);
    if (!$i?.db || !heichelId || !seriesId || !parentId) return { error: true, message: "Missing $i.db, heichelId, seriesId, or parentId" };
    const parentBasePath = getParentCommentsBasePath({ heichelId, seriesId, parentId, parentType, postId });
    const report = makeReport({ dryRun, parentBasePath });
    const aliases = await listAliases({ $i, parentBasePath });
    report.aliasesSeen = aliases.length;
    for (const aliasId of aliases) await copyAliasComments({ ...params, postId, aliasId, report });
    report.migrated = report.copied;
    if (!dryRun) writeManifest({ $i, heichelId, seriesId, parentType, parentId, postId, report });
    return report;
}

/** @param {object} params @returns {object} */
function makeReport({ dryRun, parentBasePath }) {
    return { success: true, dryRun, parentBasePath, aliasesSeen: 0, copied: 0, migrated: 0, indexed: 0, sharded: 0, alreadyPresent: 0, skipped: 0, errors: [] };
}

/** @param {object} params @returns {Promise<void>} */
async function copyAliasComments(params) {
    const { $i, heichelId, seriesId, parentId, parentType, postId, aliasId, report } = params;
    const aliasPath = getAliasCommentFilePath({ heichelId, seriesId, parentId, aliasId, parentType, postId });
    for (const verseSection of await listVerseSections({ $i, aliasPath })) {
        const present = existingIds({ $i, heichelId, seriesId, parentType, parentId, postId, aliasId, verseSection });
        await copyVerseComments({ ...params, aliasPath, verseSection, present, report });
    }
}

/** @param {object} params @returns {Promise<void>} */
async function copyVerseComments(params) {
    const { $i, aliasPath, aliasId, verseSection, present, report } = params;
    const comments = await readLegacyComments({ $i, aliasPath, verseSection });
    for (let index = 0; index < comments.length; index++) {
        const comment = comments[index];
        if (!comment || typeof comment !== "object") { report.skipped++; continue; }
        const id = stableMigratedId({ comment, aliasId, verseSection, index });
        if (present.has(id)) { report.alreadyPresent++; continue; }
        await copyOneComment({ ...params, comment, id, index });
    }
}

/** @param {object} params @returns {Promise<void>} */
async function copyOneComment(params) {
    const { $i, comment, id, aliasId, verseSection, aliasPath, index, report, dryRun } = params;
    const copied = { ...comment, id, author: comment.author || aliasId, verseSection: comment.verseSection ?? verseSection };
    const migration = migrationPacket({ sourcePath: aliasPath, aliasId, verseSection, index });
    if (dryRun) { report.copied++; report.indexed++; report.sharded++; return; }
    const context = { heichelId: params.heichelId, seriesId: params.seriesId, parentType: params.parentType, parentId: params.parentId, postId: params.postId, aliasId, verseSection };
    const indexed = await indexCommentSearchRecord({ $i, comment: copied, ...context, status: "migrated", migration });
    const sharded = writeCommentShardRecord({ $i, comment: copied, context, migration });
    if (indexed?.success) report.indexed++; else report.errors.push({ id, indexed });
    if (sharded?.file || sharded?.skipped) report.sharded++; else report.errors.push({ id, sharded });
    report.copied++;
}

/** @param {object} params @returns {void} */
function writeManifest({ $i, heichelId, seriesId, parentType, parentId, postId, report }) {
    writeMigrationManifest({ $i, manifest: { id: `comments_${heichelId}_${seriesId}_${parentType}_${parentId}_${Date.now()}`, type: "legacyCommentsToNewCommentSystem", heichelId, seriesId, parentType, parentId, postId, ...report, createdAt: Date.now() } });
}

module.exports = { migrateParentCommentsToAwtsmoosDb };
