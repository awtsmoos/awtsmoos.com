// B"H
/**
 * @file commentShardMirror.js
 * @description
 * The legacy comment path is the first vessel, the packed shard is the second
 * lamp: the same spark, written again so future readers can survive directory
 * drift, binary compaction, and the long road from old JSON vessels into a
 * tighter AwtsmoosDB sidecar.
 */

const { logicalKey } = require("../packed/shardPaths.js");
const { writePacked, listPackedRecords } = require("../packed/socialPacked.js");

/**
 * Builds the stable packed key for one comment.
 * @param {object} params Key parts.
 * @param {string} params.heichelId Heichel id.
 * @param {string} params.seriesId Series id.
 * @param {string} params.parentType Parent type, usually post or comment.
 * @param {string} params.parentId Parent id.
 * @param {string} params.aliasId Author alias id.
 * @param {string|number} params.verseSection Verse section key.
 * @param {string} params.commentId Comment id.
 * @returns {string} Packed logical key.
 */
function commentShardKey({
    heichelId,
    seriesId,
    parentType,
    parentId,
    aliasId,
    verseSection,
    commentId
}) {
    return logicalKey([
        "comments",
        "byParent",
        heichelId,
        seriesId,
        parentType,
        parentId,
        aliasId,
        verseSection,
        commentId
    ]);
}

/**
 * Normalizes the searchable coordinate for filtering packed comments.
 * @param {object} params Comment context.
 * @returns {object} Coordinate object.
 */
function commentCoordinate({
    heichelId,
    seriesId,
    parentType = "post",
    parentId,
    postId,
    aliasId,
    verseSection = "root"
}) {
    return {
        heichelId,
        seriesId,
        parentType,
        parentId,
        postId: postId || (parentType === "post" ? parentId : ""),
        aliasId,
        verseSection: String(verseSection)
    };
}

/**
 * Writes a single comment into the packed core shard.
 * @param {object} params Write params.
 * @param {object} params.$i Runtime context with db.
 * @param {object} params.comment Comment object.
 * @param {object} params.context Parent and alias context.
 * @param {object} [params.migration] Migration packet.
 * @returns {object} Packed write result.
 */
function writeCommentShardRecord({
    $i,
    comment,
    context,
    migration
}) {
    const coordinate = commentCoordinate({
        ...context,
        aliasId: context.aliasId || comment?.author,
        verseSection: comment?.verseSection ?? context.verseSection
    });
    const commentId = comment?.id || comment?.commentId;
    const value = {
        ...comment,
        id: commentId,
        author: comment?.author || coordinate.aliasId,
        verseSection: comment?.verseSection ?? coordinate.verseSection,
        coordinate,
        migration
    };
    return writePacked({
        $i,
        shard: "core",
        key: commentShardKey({ ...coordinate, commentId }),
        value,
        meta: {
            kind: "comment",
            entityKind: "comment",
            heichelId: coordinate.heichelId,
            seriesId: coordinate.seriesId,
            parentType: coordinate.parentType,
            parentId: coordinate.parentId,
            postId: coordinate.postId,
            aliasId: coordinate.aliasId,
            verseSection: coordinate.verseSection,
            commentId
        }
    });
}

/**
 * Writes a packed tombstone for one comment so fallback readers do not
 * resurrect a comment after the legacy path has deleted it.
 * @param {object} params Delete params.
 * @returns {object} Packed delete result.
 */
function deleteCommentShardRecord({
    $i,
    heichelId,
    seriesId,
    parentType = "post",
    parentId,
    postId,
    aliasId,
    verseSection = "root",
    commentId
}) {
    const coordinate = commentCoordinate({
        heichelId,
        seriesId,
        parentType,
        parentId,
        postId,
        aliasId,
        verseSection
    });
    return writePacked({
        $i,
        shard: "core",
        key: commentShardKey({ ...coordinate, commentId }),
        op: "delete",
        value: {
            deleted: true,
            commentId,
            coordinate,
            deletedAt: Date.now()
        },
        meta: {
            kind: "comment",
            entityKind: "comment",
            deleted: true,
            ...coordinate,
            commentId
        }
    });
}

/**
 * Reads packed comments matching a legacy retrieval coordinate.
 * @param {object} params Read params.
 * @returns {Array<object>} Matching packed comment values.
 */
function readCommentShardRecords({
    $i,
    heichelId,
    seriesId,
    parentType = "post",
    parentId,
    postId,
    aliasId,
    verseSection
}) {
    const wanted = commentCoordinate({
        heichelId,
        seriesId,
        parentType,
        parentId,
        postId,
        aliasId,
        verseSection
    });
    const latest = new Map();
    for (const record of listPackedRecords({ $i, shard: "core" })) {
        if (record.key) latest.set(record.key, record);
    }
    return [...latest.values()]
        .filter(record => record.meta?.kind === "comment")
        .filter(record => record.op !== "delete" && !record.meta?.deleted)
        .filter(record => record.meta?.heichelId === wanted.heichelId)
        .filter(record => record.meta?.seriesId === wanted.seriesId)
        .filter(record => record.meta?.parentType === wanted.parentType)
        .filter(record => record.meta?.parentId === wanted.parentId)
        .filter(record => !postId || record.meta?.postId === wanted.postId)
        .filter(record => !aliasId || record.meta?.aliasId === wanted.aliasId)
        .filter(record => verseSection === undefined || record.meta?.verseSection === wanted.verseSection)
        .map(record => record.value);
}

/**
 * Lists authors found in packed comments for one parent and verse.
 * @param {object} params Lookup params.
 * @returns {Array<string>} Alias ids.
 */
function listPackedCommentAuthors(params) {
    return [...new Set(readCommentShardRecords(params).map(comment => comment?.author).filter(Boolean))];
}

/**
 * Lists verse sections found in packed comments for one alias and parent.
 * @param {object} params Lookup params.
 * @returns {Array<string>} Verse section keys.
 */
function listPackedCommentVerseSections(params) {
    return [...new Set(readCommentShardRecords(params).map(comment => String(comment?.verseSection ?? "root")))];
}

module.exports = {
    commentShardKey,
    commentCoordinate,
    writeCommentShardRecord,
    deleteCommentShardRecord,
    readCommentShardRecords,
    listPackedCommentAuthors,
    listPackedCommentVerseSections
};
