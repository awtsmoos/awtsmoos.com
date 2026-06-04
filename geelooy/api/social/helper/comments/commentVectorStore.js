// B"H
/**
 * @file commentVectorStore.js
 * @chapter The English Star Gate
 * @description
 * Persistent comment vectors for social comments. Because the configured GGUF
 * model is bge-small-en, only English-dominant comments receive embeddings.
 * Other comments remain fully stored and searchable by non-vector paths, but
 * the vector gate refuses to counterfeit multilingual wisdom.
 */

const { logicalKey } = require("../packed/shardPaths.js");
const { writePacked, listPackedRecords } = require("../packed/socialPacked.js");
const { embedTextAuto } = require("../../../../../ayzarim/DosDB/aiSearch/textEmbedRunner.js");

const VECTOR_KIND = "commentVector";
const MIN_ENGLISH_RATIO = 0.7;

/** @param {object} comment @returns {string} */
function commentText(comment) {
    const dayuh = comment?.dayuh && typeof comment.dayuh === "object" ? comment.dayuh : {};
    return String(comment?.content || comment?.text || dayuh.content || dayuh.semanticFingerprint || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** @param {string} text @returns {object} */
function englishProfile(text) {
    const letters = Array.from(String(text || "").matchAll(/\p{L}/gu)).map(match => match[0]);
    const latin = letters.filter(ch => /[A-Za-z]/.test(ch)).length;
    const nonLatin = letters.length - latin;
    const ratio = letters.length ? latin / letters.length : 0;
    const hasEnglishWord = /[A-Za-z]{2,}/.test(text);
    return { letters: letters.length, latin, nonLatin, ratio, hasEnglishWord, isEnglish: hasEnglishWord && ratio >= MIN_ENGLISH_RATIO };
}

/** @param {object} params @returns {object} */
function coordinate(params) {
    const comment = params.comment || {};
    const dayuh = comment.dayuh && typeof comment.dayuh === "object" ? comment.dayuh : {};
    const parentType = params.parentType || "post";
    const parentId = params.parentId;
    return {
        heichelId: params.heichelId,
        seriesId: params.seriesId,
        parentType,
        parentId,
        postId: params.postId || (parentType === "post" ? parentId : ""),
        aliasId: comment.author || comment.aliasId || params.aliasId || "",
        verseSection: String(comment.verseSection ?? dayuh.verseSection ?? "root"),
        commentId: comment.id || comment.commentId
    };
}

/** @param {object} c @returns {string} */
function vectorKey(c) {
    return logicalKey(["comments", "vectors", c.heichelId, c.seriesId, c.parentType, c.parentId, c.aliasId, c.verseSection, c.commentId]);
}

/** @param {object} $i @returns {boolean} */
function canStoreVectors($i) {
    return Boolean(process.awtsmoosDbPath || $i?.db?.directory);
}

/** @param {object} params @returns {object|null} */
function findExistingVector(params) {
    const key = vectorKey(coordinate(params));
    for (const record of latestVectorPackedRecords(params)) {
        if (record.key === key && record.value?.vector?.length) return record.value;
    }
    return null;
}

/** @param {object} params @returns {Promise<object>} */
async function storeCommentVector(params) {
    const { $i, comment } = params;
    if (!canStoreVectors($i)) return { skipped: true, reason: "no_db_directory_for_vector_store" };
    if (!comment?.id && !comment?.commentId) return { skipped: true, reason: "missing_comment_id" };
    const text = commentText(comment);
    if (!text) return { skipped: true, reason: "empty_comment_text" };
    const language = englishProfile(text);
    if (!language.isEnglish) return { skipped: true, reason: "non_english_comment_text", language, textPreview: text.slice(0, 120) };
    const existing = findExistingVector(params);
    if (existing) return { success: true, skipped: true, reason: "vector_already_present", record: existing };
    const c = coordinate(params);
    const embedding = await embedTextAuto(text, { noFallback: true });
    const value = buildVectorValue({ c, text, embedding, language });
    const written = writePacked({
        $i,
        shard: "core",
        key: vectorKey(c),
        value,
        meta: { kind: VECTOR_KIND, entityKind: VECTOR_KIND, ...c, vectorDimensions: value.vectorDimensions, language: "en" }
    });
    return { success: true, key: vectorKey(c), record: value, written };
}

/** @param {object} params @returns {object} */
function buildVectorValue({ c, text, embedding, language }) {
    return {
        id: c.commentId,
        text,
        language: "en",
        languageProfile: language,
        vector: embedding.vector,
        vectorDimensions: embedding.vector.length,
        realEmbedding: embedding.realEmbedding,
        provider: embedding.provider,
        model: embedding.state?.provider?.filename,
        coordinate: c,
        embeddedAt: Date.now()
    };
}

/** @param {object} record @param {object} context @returns {boolean} */
function matchesVector(record, { heichelId, seriesId }) {
    return record.meta?.kind === VECTOR_KIND && record.op !== "delete" && !record.meta?.deleted &&
        record.meta?.heichelId === heichelId && (!seriesId || record.meta?.seriesId === seriesId);
}

/** @param {object} params @returns {Array<object>} */
function latestVectorPackedRecords({ $i }) {
    if (!canStoreVectors($i)) return [];
    const latest = new Map();
    for (const record of listPackedRecords({ $i, shard: "core" })) {
        if (record.key && record.meta?.kind === VECTOR_KIND) latest.set(record.key, record);
    }
    return [...latest.values()];
}

/** @param {object} params @returns {Array<object>} */
function listCommentVectors({ $i, heichelId, seriesId }) {
    return latestVectorPackedRecords({ $i }).filter(record => matchesVector(record, { heichelId, seriesId })).map(record => record.value);
}

/** @param {object} params @returns {object} */
function vectorStats(params) {
    const rows = listCommentVectors(params);
    return {
        count: rows.length,
        english: rows.filter(row => row.language === "en").length,
        real: rows.filter(row => row.realEmbedding).length,
        dimensions: rows[0]?.vectorDimensions || 0,
        provider: rows[0]?.provider || null,
        model: rows[0]?.model || null
    };
}

module.exports = { VECTOR_KIND, MIN_ENGLISH_RATIO, commentText, englishProfile, coordinate, vectorKey, storeCommentVector, listCommentVectors, vectorStats };
