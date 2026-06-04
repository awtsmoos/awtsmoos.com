// B"H
/**
 * @file commentVectorSearch.js
 * @chapter Stored Stars, One Query Flame
 * @description
 * Comment vector search over persistent embeddings. Comments are embedded once
 * at write/reindex time; query time embeds only the query and performs exact
 * cosine search over stored vectors. This is true stored vector retrieval,
 * not query-time comment reranking.
 */

const { indexCommentSearchRecord, searchCommentSearchRecords } = require("./commentAwtsmoosDbBridge.js");
const { embedTextAuto, runnerState, downloadCommand } = require("../../../../../ayzarim/DosDB/aiSearch/textEmbedRunner.js");
const { listCommentVectors, vectorStats } = require("./commentVectorStore.js");
const { packedCommentRecords } = require("./commentVectorSearchPacked.js");

/** @param {string} value @returns {Array<string>} */
function tokens(value) {
    return String(value || "").toLowerCase().split(/[^\p{L}\p{N}_$]+/u).filter(Boolean);
}

/** @param {Array<number>} a @param {Array<number>} b @returns {number} */
function cosine(a, b) {
    let dot = 0, aa = 0, bb = 0;
    const len = Math.min(a?.length || 0, b?.length || 0);
    for (let i = 0; i < len; i++) { dot += a[i] * b[i]; aa += a[i] * a[i]; bb += b[i] * b[i]; }
    return dot / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}

/** @param {object} row @returns {string} */
function rowText(row) {
    return String(row?.text || row?.content || "").trim();
}

/** @param {object} params @returns {number} */
function lexicalScore({ text, query }) {
    const hay = new Set(tokens(text));
    return tokens(query).reduce((sum, token) => sum + (hay.has(token) ? 1 : 0), 0);
}

/** @param {object} params @returns {Promise<Array<object>>} */
async function scoreStoredVectors({ rows, query, mode, limit }) {
    const queryEmbedding = await embedTextAuto(query, { noFallback: true });
    return rows.map(row => {
        const lexical = lexicalScore({ text: rowText(row), query });
        const vector = cosine(queryEmbedding.vector, row.vector || []);
        const score = mode === "lexical" ? lexical : mode === "vector" ? vector : lexical + vector;
        return { score, lexicalScore: lexical, vectorScore: vector, realEmbedding: queryEmbedding.realEmbedding && row.realEmbedding, record: row, meta: row.coordinate };
    }).filter(item => String(query || "").trim() ? item.score > 0 : true)
      .sort((a, b) => b.score - a.score || String(a.record?.id).localeCompare(String(b.record?.id)))
      .slice(0, Number(limit) || 20);
}

/** @param {object} params @returns {Promise<object>} */
async function memoryFallback({ $i, query, heichelId, seriesId }) {
    const res = await searchCommentSearchRecords({ $i, query, heichelId, seriesId });
    return { success: res.success || [], awtsmoosSearch: searchMeta({ mode: "sidecar-memory-fallback", query, heichelId, seriesId, totalVectors: 0 }) };
}

/** @param {object} params @returns {Promise<object>} */
async function searchPackedComments({ $i, heichelId, seriesId, query = "", mode = "hybrid", limit = 20 }) {
    const rows = listCommentVectors({ $i, heichelId, seriesId });
    if (!rows.length) return await memoryFallback({ $i, query, heichelId, seriesId });
    const scored = await scoreStoredVectors({ rows, query, mode, limit });
    return { success: scored, awtsmoosSearch: searchMeta({ mode, query, heichelId, seriesId, totalVectors: rows.length, candidateCount: scored.length }) };
}

/** @param {object} params @returns {Promise<object>} */
async function reindexPackedComments({ $i, heichelId, seriesId }) {
    let indexed = 0, errors = 0;
    for (const row of packedCommentRecords({ $i, heichelId, seriesId })) {
        const comment = row.value || row;
        const ctx = row.meta || comment.coordinate || {};
        const res = await indexCommentSearchRecord({ $i, comment, ...ctx, status: "reindexed-from-packed" });
        if (res?.success) indexed++; else errors++;
    }
    return { success: true, indexed, errors, awtsmoosSearch: searchMeta({ mode: "reindex", heichelId, seriesId, vectorStats: vectorStats({ $i, heichelId, seriesId }) }) };
}

/** @param {object} params @returns {object} */
function commentSearchStats({ $i, heichelId, seriesId }) {
    return { success: { vectors: vectorStats({ $i, heichelId, seriesId }), embedder: embedderInfo(), heichelId, seriesId } };
}

/** @returns {object} */
function embedderInfo() {
    const state = runnerState();
    return { ...state, downloadCommand: downloadCommand() };
}

/** @param {object} params @returns {object} */
function searchMeta(params) {
    return { BH: "B\"H", engine: "stored-comment-vector-search", embedder: embedderInfo(), ...params };
}

module.exports = { cosine, rowText, searchPackedComments, reindexPackedComments, commentSearchStats, embedderInfo };
