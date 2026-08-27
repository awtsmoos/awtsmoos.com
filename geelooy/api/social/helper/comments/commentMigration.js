// B"H
/**
 * @file commentMigration.js
 * @description
 * Legacy comment migration indexes authoritative legacy comment-tree records
 * into the AwtsmoosDB search sidecar only. It does not write packed comment
 * shards, JSONL mirrors, vector copies, migration fallback stores, or any
 * second comment authority.
 */

const { getParentCommentsBasePath, getAliasCommentFilePath } = require("./commentPaths.js");
const { indexCommentSearchRecord } = require("./commentAwtsmoosDbBridge.js");

function stableMigratedId({ comment, aliasId, verseSection, index }) {
    return comment?.id || comment?.commentId || `BH_migrated_${aliasId}_${verseSection}_${index}`;
}

function migrationPacket({ sourcePath, aliasId, verseSection, index }) {
    return { version: 6, source: "legacy-comment-paths", sourcePath, aliasId, verseSection, index, migratedAt: Date.now(), packedMirrorWritten: false };
}

function names(value) {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (value && typeof value === "object") return Object.keys(value).map(String).filter(Boolean);
    return [];
}

function progress(params, event, data = {}) {
    if (typeof params.onProgress === "function") params.onProgress({ event, ...data });
}

async function listAliases({ $i, parentBasePath }) {
    try { return names(await $i.db.get(parentBasePath)); } catch (_) { return []; }
}

async function listVerseSections({ $i, aliasPath }) {
    try { return names(await $i.db.getObjectKeys(aliasPath)); } catch (_) { return []; }
}

async function readLegacyComments({ $i, aliasPath, verseSection }) {
    try {
        const value = await $i.db.getObjectKey(aliasPath, verseSection);
        return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
}

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
        packedMirrorWritten: false,
        errors: []
    };
}

async function migrateParentCommentsToAwtsmoosDb(params) {
    const { $i, heichelId, seriesId, parentId, parentType = "post", dryRun = false } = params;
    const postId = params.postId || (parentType === "post" ? parentId : undefined);
    const fastMode = params.fastMode !== false;
    const indexSearch = params.indexSearch !== false;
    if (!$i?.db || !heichelId || !seriesId || !parentId) return { error: true, message: "Missing $i.db, heichelId, seriesId, or parentId" };
    const parentBasePath = getParentCommentsBasePath({ heichelId, seriesId, parentId, parentType, postId });
    const report = makeReport({ dryRun, parentBasePath, fastMode, indexSearch });
    progress(params, "parent:start", { heichelId, seriesId, parentType, parentId, parentBasePath, fastMode, indexSearch });
    const aliases = await listAliases({ $i, parentBasePath });
    report.aliasesSeen = aliases.length;
    progress(params, "parent:aliases", { parentId, aliasesSeen: aliases.length });
    for (const aliasId of aliases) await copyAliasComments({ ...params, postId, aliasId, report, fastMode, indexSearch });
    report.migrated = report.copied;
    progress(params, "parent:done", { parentId, report: compactReport(report) });
    return report;
}

async function copyAliasComments(params) {
    const { heichelId, seriesId, parentId, parentType, postId, aliasId, report } = params;
    const aliasPath = getAliasCommentFilePath({ heichelId, seriesId, parentId, aliasId, parentType, postId });
    const verseSections = await listVerseSections({ $i: params.$i, aliasPath });
    report.versesSeen += verseSections.length;
    progress(params, "alias:start", { parentId, aliasId, aliasPath, verseCount: verseSections.length });
    for (const verseSection of verseSections) await copyVerseComments({ ...params, aliasPath, verseSection, report });
}

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

async function copyOneComment(params) {
    const { comment, id, aliasId, verseSection, aliasPath, index, report, dryRun, indexSearch } = params;
    const copied = { ...comment, id, author: comment.author || aliasId, aliasId, verseSection: comment.verseSection ?? comment.dayuh?.verseSection ?? verseSection };
    const migration = migrationPacket({ sourcePath: aliasPath, aliasId, verseSection, index });
    if (dryRun) {
        report.copied++;
        if (indexSearch) report.indexed++;
        return;
    }
    const context = { heichelId: params.heichelId, seriesId: params.seriesId, parentType: params.parentType, parentId: params.parentId, postId: params.postId, aliasId, verseSection };
    if (indexSearch) await maybeIndexComment({ ...params, copied, context, migration, id, report });
    report.copied++;
}

async function maybeIndexComment(params) {
    const indexed = await indexCommentSearchRecord({ $i: params.$i, comment: params.copied, ...params.context, status: "migrated", migration: params.migration });
    if (indexed?.success) params.report.indexed++; else params.report.errors.push({ id: params.id, indexed });
    if (indexed?.vector?.success && !indexed.vector.skipped) params.report.vectors++;
    if (indexed?.vector?.skipped) params.report.vectorSkipped++;
}

function compactReport(report) {
    return {
        aliasesSeen: report.aliasesSeen,
        versesSeen: report.versesSeen,
        copied: report.copied,
        migrated: report.migrated,
        indexed: report.indexed,
        sharded: report.sharded,
        vectors: report.vectors,
        vectorSkipped: report.vectorSkipped,
        alreadyPresent: report.alreadyPresent,
        skipped: report.skipped,
        packedMirrorWritten: false,
        errors: report.errors.length
    };
}

module.exports = { migrateParentCommentsToAwtsmoosDb, compactReport };
