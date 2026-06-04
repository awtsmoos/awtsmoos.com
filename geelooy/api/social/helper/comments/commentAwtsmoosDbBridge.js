// B"H
/**
 * @file commentAwtsmoosDbBridge.js
 * @chapter The Search Sidecar Learns To Remember Vectors
 * @description
 * Mirrors successful comment writes into the AwtsmoosDB search sidecar and
 * stores a persistent real GGUF embedding for each comment at write time.
 */

const path = require("path");
const { createAiSearchDb } = require("../../../../../ayzarim/DosDB/aiSearch/index.js");
const { storeCommentVector } = require("./commentVectorStore.js");

const CACHE_KEY = "__awtsmoosCommentSearchDbs";

/** @param {*} value @returns {string} */
function cleanText(value) {
    return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** @param {object} $i @param {object} context @returns {string} */
function resolveRoot($i, context = {}) {
    const base = $i?.db?.directory || process.cwd();
    const heichel = context.heichelId || "unknown-heichel";
    const series = context.seriesId || "unknown-series";
    return path.join(base, "awtsmoos-comment-search", heichel, series);
}

/** @param {object} $i @returns {Map} */
function cacheFor($i) {
    if (!$i[CACHE_KEY]) {
        Object.defineProperty($i, CACHE_KEY, { value: new Map(), enumerable: false, configurable: true });
    }
    return $i[CACHE_KEY];
}

/** @param {object} $i @param {object} context @returns {object} */
function getCommentSearchDb($i, context = {}) {
    const root = resolveRoot($i, context);
    const cache = cacheFor($i);
    if (!cache.has(root)) cache.set(root, createAiSearchDb(root, { open: false }));
    return cache.get(root);
}

/** @param {object} params @returns {object} */
function normalizeCommentSearchRecord(params) {
    const { comment, heichelId, seriesId, parentId, parentType, postId, aliasId, status = "active", migration = null } = params;
    const dayuh = comment?.dayuh && typeof comment.dayuh === "object" ? comment.dayuh : {};
    const text = cleanText(comment?.content || dayuh?.content || comment?.text || "");
    const id = comment?.id || comment?.commentId;
    return {
        id,
        aliasId: comment?.author || comment?.aliasId || aliasId || "",
        parentId,
        postId: postId || (parentType === "post" ? parentId : ""),
        text,
        content: comment?.content,
        coordinate: coordinateFor({ heichelId, seriesId, parentId, parentType, postId, comment, dayuh, text }),
        metadata: metadataFor({ status, heichelId, seriesId, parentId, parentType, postId, comment, dayuh, migration })
    };
}

/** @param {object} p @returns {object} */
function coordinateFor(p) {
    return {
        heichelId: p.heichelId,
        seriesId: p.seriesId,
        postId: p.postId || (p.parentType === "post" ? p.parentId : undefined),
        parentId: p.parentId,
        parentType: p.parentType,
        verseSection: p.comment?.verseSection ?? p.dayuh?.verseSection ?? "root",
        subSection: p.dayuh?.subSection ?? p.comment?.subSection ?? null,
        tokenStart: p.dayuh?.tokenStart ?? null,
        tokenEnd: p.dayuh?.tokenEnd ?? null,
        charStart: p.dayuh?.charStart ?? null,
        charEnd: p.dayuh?.charEnd ?? null,
        semanticFingerprint: p.dayuh?.semanticFingerprint || p.text.slice(0, 160)
    };
}

/** @param {object} p @returns {object} */
function metadataFor(p) {
    return {
        status: p.status,
        heichelId: p.heichelId,
        seriesId: p.seriesId,
        parentId: p.parentId,
        parentType: p.parentType,
        postId: p.postId || (p.parentType === "post" ? p.parentId : ""),
        verseSection: p.comment?.verseSection ?? p.dayuh?.verseSection ?? "root",
        subSection: p.dayuh?.subSection ?? p.comment?.subSection ?? null,
        storageEngine: "awtsmoosDb",
        storageFormat: "awtsmoosBinary",
        storageType: "awtsmoosBinary",
        legacySourceFormat: "awtsmoosJson",
        tightlyPacked: true,
        migration: p.migration
    };
}

/** @param {object} params @returns {Promise<object>} */
async function indexCommentSearchRecord(params) {
    try {
        if (!params?.$i || !params?.comment?.id) return { skipped: true, reason: "missing_request_or_comment_id" };
        const db = getCommentSearchDb(params.$i, params);
        const record = normalizeCommentSearchRecord(params);
        const lexical = db.indexCommentRecord(record);
        const vector = await storeCommentVector(params);
        return { success: true, record: lexical, vector, stats: db.stats() };
    } catch (error) {
        return { error: true, message: "COMMENT_SEARCH_INDEX_FAILED", details: error.stack || String(error) };
    }
}

/** @param {object} params @returns {Promise<object>} */
async function searchCommentSearchRecords({ $i, query, heichelId, seriesId } = {}) {
    try {
        const db = getCommentSearchDb($i, { heichelId, seriesId });
        const results = db.searchCommentRecords(query).map(item => ({ score: item.score, record: item.record }));
        return { success: results };
    } catch (error) {
        return { error: true, message: "COMMENT_SEARCH_QUERY_FAILED", details: error.stack || String(error) };
    }
}

module.exports = { getCommentSearchDb, normalizeCommentSearchRecord, indexCommentSearchRecord, searchCommentSearchRecords };
