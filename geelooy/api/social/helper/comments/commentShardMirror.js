// B"H
/**
 * @file commentShardMirror.js
 * @chapter The Packed Mirror Became A Lightning Index
 * @description
 * Comment writes still mirror into the packed social shard, but reads no longer
 * scan the whole shard. Every write also updates exact aggregate keys for:
 * comments by parent+alias+verse, authors by parent+verse, and sections by
 * parent+alias. Thus the Awtsmoos reveals the requested spark directly instead
 * of forcing the server to drag the whole sea through a needle.
 */

const { logicalKey } = require("../packed/shardPaths.js");
const { writePacked, readPacked } = require("../packed/socialPacked.js");

function canUsePacked($i) {
    return Boolean(process.awtsmoosDbPath || process.env.AWTSMOOS_DB_PATH || $i?.db?.directory);
}

function key(parts) {
    return logicalKey(parts.map(part => String(part ?? "")));
}

function commentCoordinate({ heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection = "root" }) {
    return { heichelId, seriesId, parentType, parentId, postId: postId || (parentType === "post" ? parentId : ""), aliasId, verseSection: String(verseSection ?? "root") };
}

function commentShardKey({ heichelId, seriesId, parentType, parentId, aliasId, verseSection, commentId }) {
    return key(["comments", "byParent", heichelId, seriesId, parentType, parentId, aliasId, verseSection, commentId]);
}

function commentsAggregateKey(c) {
    return key(["comments", "aggregate", "byParentAliasVerse", c.heichelId, c.seriesId, c.parentType, c.parentId, c.aliasId, c.verseSection]);
}

function authorsAggregateKey(c) {
    return key(["comments", "aggregate", "authorsByParentVerse", c.heichelId, c.seriesId, c.parentType, c.parentId, c.verseSection]);
}

function sectionsAggregateKey(c) {
    return key(["comments", "aggregate", "sectionsByParentAlias", c.heichelId, c.seriesId, c.parentType, c.parentId, c.aliasId]);
}

function readValue({ $i, shard = "core", key }) {
    const record = readPacked({ $i, shard, key });
    if (!record || record.op === "delete" || record.meta?.deleted) return null;
    return record.value;
}

function uniquePush(list, value) {
    const next = Array.isArray(list) ? list.slice() : [];
    if (value !== undefined && value !== null && !next.includes(value)) next.push(value);
    return next;
}

function replaceById(list, comment) {
    const next = Array.isArray(list) ? list.filter(item => item?.id !== comment.id) : [];
    next.push(comment);
    return next;
}

function removeById(list, commentId) {
    return Array.isArray(list) ? list.filter(item => item?.id !== commentId) : [];
}

function writeAggregate({ $i, key, value, meta }) {
    return writePacked({ $i, shard: "core", key, value, meta: { kind: "commentAggregate", ...meta } });
}

function writeCommentShardRecord({ $i, comment, context, migration }) {
    if (!canUsePacked($i)) return { skipped: true, reason: "no_db_directory_for_packed_test" };
    const coordinate = commentCoordinate({ ...context, aliasId: context.aliasId || comment?.author, verseSection: comment?.verseSection ?? context.verseSection });
    const commentId = comment?.id || comment?.commentId;
    const value = { ...comment, id: commentId, author: comment?.author || coordinate.aliasId, verseSection: comment?.verseSection ?? coordinate.verseSection, coordinate, migration };
    const mainKey = commentShardKey({ ...coordinate, commentId });
    const commentsKey = commentsAggregateKey(coordinate);
    const authorsKey = authorsAggregateKey(coordinate);
    const sectionsKey = sectionsAggregateKey(coordinate);
    const comments = replaceById(readValue({ $i, key: commentsKey }), value);
    const authors = uniquePush(readValue({ $i, key: authorsKey }), coordinate.aliasId);
    const sections = uniquePush(readValue({ $i, key: sectionsKey }), coordinate.verseSection);
    const main = writePacked({ $i, shard: "core", key: mainKey, value, meta: { kind: "comment", entityKind: "comment", ...coordinate, commentId } });
    const aggregate = writeAggregate({ $i, key: commentsKey, value: comments, meta: { aggregate: "commentsByParentAliasVerse", ...coordinate } });
    const authorIndex = writeAggregate({ $i, key: authorsKey, value: authors, meta: { aggregate: "authorsByParentVerse", ...coordinate } });
    const sectionIndex = writeAggregate({ $i, key: sectionsKey, value: sections, meta: { aggregate: "sectionsByParentAlias", ...coordinate } });
    return { main, aggregate, authorIndex, sectionIndex };
}

function deleteCommentShardRecord({ $i, heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection = "root", commentId }) {
    if (!canUsePacked($i)) return { skipped: true, reason: "no_db_directory_for_packed_test" };
    const coordinate = commentCoordinate({ heichelId, seriesId, parentType, parentId, postId, aliasId, verseSection });
    const mainKey = commentShardKey({ ...coordinate, commentId });
    const commentsKey = commentsAggregateKey(coordinate);
    const authorsKey = authorsAggregateKey(coordinate);
    const sectionsKey = sectionsAggregateKey(coordinate);
    const comments = removeById(readValue({ $i, key: commentsKey }), commentId);
    const currentSections = readValue({ $i, key: sectionsKey });
    const nextSections = comments.length ? uniquePush(currentSections, coordinate.verseSection) : (Array.isArray(currentSections) ? currentSections.filter(x => x !== coordinate.verseSection) : []);
    const currentAuthors = readValue({ $i, key: authorsKey });
    const nextAuthors = comments.length ? uniquePush(currentAuthors, coordinate.aliasId) : (Array.isArray(currentAuthors) ? currentAuthors.filter(x => x !== coordinate.aliasId) : []);
    const main = writePacked({ $i, shard: "core", key: mainKey, op: "delete", value: { deleted: true, commentId, coordinate, deletedAt: Date.now() }, meta: { kind: "comment", entityKind: "comment", deleted: true, ...coordinate, commentId } });
    const aggregate = writeAggregate({ $i, key: commentsKey, value: comments, meta: { aggregate: "commentsByParentAliasVerse", ...coordinate } });
    const authorIndex = writeAggregate({ $i, key: authorsKey, value: nextAuthors, meta: { aggregate: "authorsByParentVerse", ...coordinate } });
    const sectionIndex = writeAggregate({ $i, key: sectionsKey, value: nextSections, meta: { aggregate: "sectionsByParentAlias", ...coordinate } });
    return { main, aggregate, authorIndex, sectionIndex };
}

function readCommentShardRecords({ $i, heichelId, seriesId, parentType = "post", parentId, postId, aliasId, verseSection }) {
    if (!canUsePacked($i) || !aliasId) return [];
    const coordinate = commentCoordinate({ heichelId, seriesId, parentType, parentId, postId, aliasId, verseSection });
    return readValue({ $i, key: commentsAggregateKey(coordinate) }) || [];
}

function listPackedCommentAuthors(params) {
    if (!canUsePacked(params.$i)) return [];
    const coordinate = commentCoordinate(params);
    return readValue({ $i: params.$i, key: authorsAggregateKey(coordinate) }) || [];
}

function listPackedCommentVerseSections(params) {
    if (!canUsePacked(params.$i) || !params.aliasId) return [];
    const coordinate = commentCoordinate(params);
    return readValue({ $i: params.$i, key: sectionsAggregateKey(coordinate) }) || [];
}

module.exports = { canUsePacked, commentShardKey, commentCoordinate, writeCommentShardRecord, deleteCommentShardRecord, readCommentShardRecords, listPackedCommentAuthors, listPackedCommentVerseSections };
