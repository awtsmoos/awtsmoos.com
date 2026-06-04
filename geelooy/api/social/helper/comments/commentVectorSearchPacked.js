// B"H
/**
 * @file commentVectorSearchPacked.js
 * @chapter The Packed Comment Census
 * @description
 * Lists latest packed comment records for reindex/backfill. This small helper
 * keeps vector search focused on stored vectors while reindex can still walk
 * the old packed comment mirror and mint missing embeddings.
 */

const { listPackedRecords } = require("../packed/socialPacked.js");

/** @param {object} $i @returns {boolean} */
function canUsePacked($i) {
    return Boolean(process.awtsmoosDbPath || $i?.db?.directory);
}

/** @param {object} record @param {object} context @returns {boolean} */
function matchesComment(record, { heichelId, seriesId }) {
    return record.meta?.kind === "comment" && record.op !== "delete" && !record.meta?.deleted &&
        record.meta?.heichelId === heichelId && (!seriesId || record.meta?.seriesId === seriesId);
}

/** @param {object} params @returns {Array<object>} */
function packedCommentRecords({ $i, heichelId, seriesId }) {
    if (!canUsePacked($i)) return [];
    const latest = new Map();
    for (const record of listPackedRecords({ $i, shard: "core" })) {
        if (record.key && record.meta?.kind === "comment") latest.set(record.key, record);
    }
    return [...latest.values()].filter(record => matchesComment(record, { heichelId, seriesId }));
}

module.exports = { packedCommentRecords };
