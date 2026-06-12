// B"H
/**
 * @file commentVectorSearch.js
 * @description
 * Comment search over the authoritative AwtsmoosDB comment-search sidecar only.
 * No packed shard, JSONL mirror, vector mirror, migration fallback, or second
 * comment authority is read from this module.
 */

const { searchCommentSearchRecords } = require("./commentAwtsmoosDbBridge.js");
const { runnerState, downloadCommand } = require("../../../../../ayzarim/DosDB/aiSearch/textEmbedRunner.js");

function tokens(value) {
    return String(value || "").toLowerCase().split(/[^\p{L}\p{N}_$]+/u).filter(Boolean);
}

function cosine(a, b) {
    let dot = 0;
    let aa = 0;
    let bb = 0;
    const len = Math.min(a?.length || 0, b?.length || 0);
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        aa += a[i] * a[i];
        bb += b[i] * b[i];
    }
    return dot / ((Math.sqrt(aa) || 1) * (Math.sqrt(bb) || 1));
}

function rowText(row) {
    return String(row?.text || row?.content || row?.record?.text || "").trim();
}

async function searchStoredComments({ $i, heichelId, seriesId, query = "", mode = "hybrid", limit = 20 }) {
    const res = await searchCommentSearchRecords({ $i, query, heichelId, seriesId });
    const success = (res.success || []).slice(0, Number(limit) || 20);
    return {
        success,
        awtsmoosSearch: searchMeta({ mode, query, heichelId, seriesId, totalRows: success.length, vectorRows: 0, vectorStorage: "disabled_to_preserve_single_comment_authority" })
    };
}

function commentSearchStats({ heichelId, seriesId }) {
    return {
        success: {
            vectors: { count: 0, disabled: true, reason: "single_comment_authority_guard" },
            embedder: embedderInfo(),
            heichelId,
            seriesId
        }
    };
}

function embedderInfo() {
    const state = runnerState();
    return { ...state, downloadCommand: downloadCommand(), commentVectorStorage: "disabled" };
}

function searchMeta(params) {
    return { BH: "B\"H", engine: "authoritative-comment-sidecar-search", authority: "single-comment-authority", embedder: embedderInfo(), ...params };
}

module.exports = { cosine, rowText, tokens, searchStoredComments, commentSearchStats, embedderInfo };
