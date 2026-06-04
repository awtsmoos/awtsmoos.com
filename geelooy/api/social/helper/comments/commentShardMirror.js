// B"H
/**
 * @file commentShardMirror.js
 * @chapter The Packed Mirror Of Speech
 * @description
 * Each comment is mirrored into the packed social shard. When tests provide a
 * memory-only fake DB with no directory, the mirror stays silent so the real
 * dayuhChadash world is never accidentally consulted.
 */

const { logicalKey } = require("../packed/shardPaths.js");
const { writePacked, listPackedRecords } = require("../packed/socialPacked.js");

/** @param {object} $i @returns {boolean} */
function canUsePacked($i) {
    return Boolean(process.awtsmoosDbPath || $i?.db?.directory);
}

/** @param {Array<string>} parts @returns {string} */
function key(parts) {
    return logicalKey(parts);
}

/** @param {object} params @returns {string} */
function commentShardKey({ heichelId, seriesId, parentType, parentId, aliasId, verseSection, commentId }) {
    return key(["comments", "byParent", heichelId, seriesId, parentType, parentId, aliasId, verseSection, commentId]);
}

/** @param {object} params @returns {object} */
function commentCoordinate({ heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection = "root" }) {
    return { heichelId, seriesId, parentType, parentId, postId: postId || (parentType === "post" ? parentId : ""), aliasId, verseSection: String(verseSection) };
}

/** @param {object} params @returns {object} */
function writeCommentShardRecord({ $i, comment, context, migration }) {
    if (!canUsePacked($i)) return { skipped: true, reason: "no_db_directory_for_packed_test" };
    const coordinate = commentCoordinate({ ...context, aliasId: context.aliasId || comment?.author, verseSection: comment?.verseSection ?? context.verseSection });
    const commentId = comment?.id || comment?.commentId;
    const value = { ...comment, id: commentId, author: comment?.author || coordinate.aliasId, verseSection: comment?.verseSection ?? coordinate.verseSection, coordinate, migration };
    return writePacked({
        $i,
        shard: "core",
        key: commentShardKey({ ...coordinate, commentId }),
        value,
        meta: { kind: "comment", entityKind: "comment", ...coordinate, commentId }
    });
}

/** @param {object} params @returns {object} */
function deleteCommentShardRecord({ $i, heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection = "root", commentId }) {
    if (!canUsePacked($i)) return { skipped: true, reason: "no_db_directory_for_packed_test" };
    const coordinate = commentCoordinate({ heichelId, seriesId, parentType, parentId, postId, aliasId, verseSection });
    return writePacked({
        $i,
        shard: "core",
        key: commentShardKey({ ...coordinate, commentId }),
        op: "delete",
        value: { deleted: true, commentId, coordinate, deletedAt: Date.now() },
        meta: { kind: "comment", entityKind: "comment", deleted: true, ...coordinate, commentId }
    });
}

/** @param {object} params @returns {Array<object>} */
function latestPackedCommentRecords(params) {
    if (!canUsePacked(params.$i)) return [];
    const latest = new Map();
    for (const record of listPackedRecords({ $i: params.$i, shard: "core" })) {
        if (record.key) latest.set(record.key, record);
    }
    return [...latest.values()];
}

/** @param {object} params @returns {boolean} */
function matches(record, wanted, postId, aliasId, verseSection) {
    return record.meta?.kind === "comment" && record.op !== "delete" && !record.meta?.deleted &&
        record.meta?.heichelId === wanted.heichelId && record.meta?.seriesId === wanted.seriesId &&
        record.meta?.parentType === wanted.parentType && record.meta?.parentId === wanted.parentId &&
        (!postId || record.meta?.postId === wanted.postId) && (!aliasId || record.meta?.aliasId === wanted.aliasId) &&
        (verseSection === undefined || record.meta?.verseSection === wanted.verseSection);
}

/** @param {object} params @returns {Array<object>} */
function readCommentShardRecords({ $i, heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection }) {
    const wanted = commentCoordinate({ heichelId, seriesId, parentType, parentId, postId, aliasId, verseSection });
    return latestPackedCommentRecords({ $i }).filter(record => matches(record, wanted, postId, aliasId, verseSection)).map(record => record.value);
}

/** @param {object} params @returns {Array<string>} */
function listPackedCommentAuthors(params) {
    return [...new Set(readCommentShardRecords(params).map(comment => comment?.author).filter(Boolean))];
}

/** @param {object} params @returns {Array<string>} */
function listPackedCommentVerseSections(params) {
    return [...new Set(readCommentShardRecords(params).map(comment => String(comment?.verseSection ?? "root")))];
}

module.exports = { canUsePacked, commentShardKey, commentCoordinate, writeCommentShardRecord, deleteCommentShardRecord, readCommentShardRecords, listPackedCommentAuthors, listPackedCommentVerseSections };
