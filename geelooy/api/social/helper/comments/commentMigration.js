// B"H
/**
 * @file commentMigration.js
 * @chapter The Swift Ark Of Old Comments
 * @description
 * Fast additive migration from legacy comment JSON into the packed comment
 * mirror. By default it skips search indexing and vectors so the bulk copy is
 * not slowed by transformers, sidecars, or repeated scans. The Awtsmoos first
 * saves the old sparks quickly; indexes can be rebuilt afterward.
 */

const { getParentCommentsBasePath, getAliasCommentFilePath } = require("./commentPaths.js");
const { indexCommentSearchRecord } = require("./commentAwtsmoosDbBridge.js");
const { writeCommentShardRecord } = require("./commentShardMirror.js");
const { writeMigrationManifest } = require("../packed/socialPacked.js");

/** @param {object} params @returns {string} */
function stableMigratedId({ comment, aliasId, verseSection, index }) {
    return comment?.id || comment?.commentId || `BH_migrated_${aliasId}_${verseSection}_${index}`;
}

/** @param {object} params @returns {object} */
function migrationPacket({ sourcePath, aliasId, verseSection, index }) {
    return { version: 4, source: "legacy-comment-fast-copy", sourcePath, aliasId, verseSection, index, migratedAt: Date.now() };
}

/** @param {*} value @returns {Array<string>} */
function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

/** @param {object} params @param {string} event @param {object} data @returns {void} */
function progress(params, event, data = {}) {
    if (typeof params.onProgress === "function") params.onProgress({ event, ...data });
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
    try {
        const value = await $i.db.getObjectKey(aliasPath, verseSection);
        return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
}

/** @param {object} params @returns {object} */
function makeReport({ dryRun, parentBasePath, fastMode, indexSearch }) {
    return {
        success: true,
        dryRun,
        fastMode,
        indexSearch,
        parentBasePath,
        aliasesSeen: 0,
        versesSeen: 0,
        copied: 0,
        migrated: 0,
        indexed: 0,
        sharded: 0,
        vectors: 0,
        vectorSkipped: 0,
        alreadyPresent: 0,
        skipped: 0,
        errors: []
    };
}

/** @param {object} params @returns {Promise<object>} */
async function migrateParentCommentsToAwtsmoosDb(params) {
    const { $i, heichelId, seriesId, parentId, parentType = "post", dryRun = false } = params;
    const postId = params.postId || (parentType === "post" ? parentId : undefined);
    const fastMode = params.fastMode !== false;
    const indexSearch = Boolean(params.indexSearch);
    if (!$i?.db || !heichelId || !seriesId || !parentId) return { error: true, message: "Missing $i.db, heichelId, seriesId, or parentId" };
    const parentBasePath = getParentCommentsBasePath({ heichelId, seriesId, parentId, parentType, postId });
    const report = makeReport({ dryRun, parentBasePath, fastMode, indexSearch });
    progress(params, "parent:start", { heichelId, seriesId, parentType, parentId, parentBasePath, fastMode, indexSearch });
    const aliases = await listAliases({ $i, parentBasePath });
    report.aliasesSeen = aliases.length;
    progress(params, "parent:aliases", { parentId, aliasesSeen: aliases.length });
    for (const aliasId of aliases) await copyAliasComments({ ...params, postId, aliasId, report, fastMode, indexSearch });
    report.migrated = report.copied;
    if (!dryRun) writeManifest({ $i, heichelId, seriesId, parentType, parentId, postId, report });
    progress(params, "parent:done", { parentId, report: compactReport(report) });
    return report;
}

/** @param {object} params @returns {Promise<void>} */
async function copyAliasComments(params) {
    const { $i, heichelId, seriesId, parentId, parentType, postId, aliasId, report } = params;
    const aliasPath = getAliasCommentFilePath({ heichelId, seriesId, parentId, aliasId, parentType, postId });
    const verseSections = await listVerseSections({ $i, aliasPath });
    report.versesSeen += verseSections.length;
    progress(params, "alias:start", { parentId, aliasId, aliasPath, verseCount: verseSections.length });
    for (const verseSection of verseSections) await copyVerseComments({ ...params, aliasPath, verseSection, report });
}

/** @param {object} params @returns {Promise<void>} */
async function copyVerseComments(params) {
    const { $i, aliasPath, aliasId, verseSection, report } = params;
    const comments = await readLegacyComments({ $i, aliasPath, verseSection });
    progress(params, "verse:start", { aliasId, verseSection, commentCount: comments.length });
    for (let index = 0; index < comments.length; index++) {
        const comment = comments[index];
        if (!comment || typeof comment !== "object") { report.skipped++; continue; }
        const id = stableMigratedId({ comment, aliasId, verseSection, index });
        await copyOneComment({ ...params, comment, id, index });
    }
    progress(params, "verse:done", { aliasId, verseSection, totals: compactReport(report) });
}

/** @param {object} params @returns {Promise<void>} */
async function copyOneComment(params) {
    const { comment, id, aliasId, verseSection, aliasPath, index, report, dryRun, indexSearch } = params;
    const copied = { ...comment, id, author: comment.author || aliasId, verseSection: comment.verseSection ?? verseSection };
    const migration = migrationPacket({ sourcePath: aliasPath, aliasId, verseSection, index });
    if (dryRun) { report.copied++; report.sharded++; if (indexSearch) report.indexed++; return; }
    const context = { heichelId: params.heichelId, seriesId: params.seriesId, parentType: params.parentType, parentId: params.parentId, postId: params.postId, aliasId, verseSection };
    const sharded = writeCommentShardRecord({ $i: params.$i, comment: copied, context, migration });
    if (sharded?.file || sharded?.skipped) report.sharded++; else report.errors.push({ id, sharded });
    if (indexSearch) await maybeIndexComment({ ...params, copied, context, migration, id, report });
    report.copied++;
}

/** @param {object} params @returns {Promise<void>} */
async function maybeIndexComment(params) {
    const indexed = await indexCommentSearchRecord({ $i: params.$i, comment: params.copied, ...params.context, status: "migrated", migration: params.migration });
    if (indexed?.success) params.report.indexed++; else params.report.errors.push({ id: params.id, indexed });
    if (indexed?.vector?.success && !indexed.vector.skipped) params.report.vectors++;
    if (indexed?.vector?.skipped) params.report.vectorSkipped++;
}

/** @param {object} report @returns {object} */
function compactReport(report) {
    return { aliasesSeen: report.aliasesSeen, versesSeen: report.versesSeen, copied: report.copied, indexed: report.indexed, sharded: report.sharded, vectors: report.vectors, vectorSkipped: report.vectorSkipped, alreadyPresent: report.alreadyPresent, skipped: report.skipped, errors: report.errors.length };
}

/** @param {object} params @returns {void} */
function writeManifest({ $i, heichelId, seriesId, parentType, parentId, postId, report }) {
    writeMigrationManifest({ $i, manifest: { id: `comments_${heichelId}_${seriesId}_${parentType}_${parentId}_${Date.now()}`, type: "legacyCommentsFastCopy", heichelId, seriesId, parentType, parentId, postId, ...report, createdAt: Date.now() } });
}

module.exports = { migrateParentCommentsToAwtsmoosDb, compactReport };
