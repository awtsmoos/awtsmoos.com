// B"H
/**
 * @file commentAwtsmoosDbBridge.js
 * @description
 * A non-invasive AI-search sidecar for comments. The current comment reader
 * remains the source of truth; this bridge mirrors successful writes into a
 * parallel AwtsmoosDB-backed search vessel for future embeddings and semantic search.
 */

const path = require("path");
const { createAiSearchDb } = require("../../../../../ayzarim/DosDB/aiSearch/index.js");

const CACHE_KEY = "__awtsmoosCommentSearchDbs";

function cleanText(value) {
    return String(value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function resolveRoot($i, context = {}) {
    const base = $i?.db?.directory || process.cwd();
    const heichel = context.heichelId || "unknown-heichel";
    const series = context.seriesId || "unknown-series";
    return path.join(base, "awtsmoos-comment-search", heichel, series);
}

function cacheFor($i) {
    if (!$i[CACHE_KEY]) {
        Object.defineProperty($i, CACHE_KEY, {
            value: new Map(),
            enumerable: false,
            configurable: true
        });
    }
    return $i[CACHE_KEY];
}

/**
 * Opens or reuses the comment search sidecar for a heichel/series context.
 * @param {object} $i Awtsmoos request vessel.
 * @param {object} context Comment context.
 * @returns {object} AI search DB bridge.
 */
function getCommentSearchDb($i, context = {}) {
    const root = resolveRoot($i, context);
    const cache = cacheFor($i);
    if (!cache.has(root)) cache.set(root, createAiSearchDb(root, { open: false }));
    return cache.get(root);
}

/**
 * Converts a live comment shtar into the sidecar's normalized record input.
 * @param {object} params Comment and route context.
 * @returns {object} Record ready for createAiSearchDb().indexCommentRecord.
 */
function normalizeCommentSearchRecord({
    comment,
    heichelId,
    seriesId,
    parentId,
    parentType,
    postId,
    aliasId,
    status = "active",
    migration = null,
    storageFormat = "awtsmoosBinary",
    legacySourceFormat = "awtsmoosJson"
}) {
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
        coordinate: {
            heichelId,
            seriesId,
            postId: postId || (parentType === "post" ? parentId : undefined),
            parentId,
            parentType,
            verseSection: comment?.verseSection ?? dayuh?.verseSection ?? "root",
            subSection: dayuh?.subSection ?? comment?.subSection ?? null,
            tokenStart: dayuh?.tokenStart ?? null,
            tokenEnd: dayuh?.tokenEnd ?? null,
            charStart: dayuh?.charStart ?? null,
            charEnd: dayuh?.charEnd ?? null,
            semanticFingerprint: dayuh?.semanticFingerprint || text.slice(0, 160)
        },
        metadata: {
            status,
            heichelId,
            seriesId,
            parentId,
            parentType,
            postId: postId || (parentType === "post" ? parentId : ""),
            verseSection: comment?.verseSection ?? dayuh?.verseSection ?? "root",
            subSection: dayuh?.subSection ?? comment?.subSection ?? null,
            storageEngine: "awtsmoosDb",
            storageFormat,
            storageType: storageFormat,
            legacySourceFormat,
            tightlyPacked: storageFormat === "awtsmoosBinary",
            migration
        }
    };
}

/**
 * Best-effort sidecar index. Never breaks canonical comment writes.
 * @param {object} params Index params.
 * @returns {object} Sidecar result.
 */
async function indexCommentSearchRecord(params) {
    try {
        if (!params?.$i || !params?.comment?.id) return { skipped: true, reason: "missing_request_or_comment_id" };
        const db = getCommentSearchDb(params.$i, params);
        const record = normalizeCommentSearchRecord(params);
        return { success: true, record: db.indexCommentRecord(record), stats: db.stats() };
    } catch (error) {
        return { error: true, message: "COMMENT_SEARCH_INDEX_FAILED", details: error.stack || String(error) };
    }
}

/**
 * Searches only the sidecar cache for now. Existing comment reads are unchanged.
 * @param {object} params Search params.
 * @returns {object} Search response.
 */
async function searchCommentSearchRecords({ $i, query, heichelId, seriesId } = {}) {
    try {
        const db = getCommentSearchDb($i, { heichelId, seriesId });
        return { success: db.searchCommentRecords(query).map(item => ({ score: item.score, record: item.record })) };
    } catch (error) {
        return { error: true, message: "COMMENT_SEARCH_QUERY_FAILED", details: error.stack || String(error) };
    }
}

module.exports = {
    getCommentSearchDb,
    normalizeCommentSearchRecord,
    indexCommentSearchRecord,
    searchCommentSearchRecords
};
