// B"H
/**
 * @file commentReadReport.js
 * @chapter The Witness Flame
 * @description
 * Every read testifies which vessel answered. New metadata lives in
 * awtsmoosCommentRead, while old fallbackSource remains as a compatibility
 * alias for callers that already listened for that whisper.
 */

const NEW_SOURCE = "awtsmoosDbPackedShard";
const OLD_SOURCE = "legacyJsonCommentTree";
const OLD_PACKED_ALIAS = "packed-comment-shard";

/** @param {Array} value @returns {number} */
function count(value) {
    return Array.isArray(value) ? value.length : 0;
}

/** @param {object} params @returns {object} */
function attempt({ ok, source, data = [], error }) {
    return { ok, source, data, count: count(data), ...(error ? { error: error.stack || String(error) } : {}) };
}

/** @param {object} params @returns {object} */
function readReport({ source, primary, fallback, paths }) {
    return {
        BH: "B\"H",
        source,
        order: [NEW_SOURCE, OLD_SOURCE],
        primary,
        ...(fallback ? { fallback } : {}),
        paths,
        message: source === NEW_SOURCE
            ? "Read from the newer durable packed/AwtsmoosDB comment mirror."
            : source === OLD_SOURCE
                ? "New mirror had no result, so legacy JSON comment tree answered."
                : "Neither new mirror nor legacy JSON had matching comments."
    };
}

/** @param {string} source @returns {object} */
function compatibilityFields(source) {
    if (source === NEW_SOURCE) return { fallbackSource: OLD_PACKED_ALIAS };
    if (source === OLD_SOURCE) return { fallbackSource: OLD_SOURCE };
    return {};
}

/** @param {object} params @returns {object} */
function readResponse({ data, source, primary, fallback, paths }) {
    return {
        success: Array.isArray(data) ? data : [],
        ...compatibilityFields(source),
        awtsmoosCommentRead: readReport({ source, primary, fallback, paths })
    };
}

module.exports = { NEW_SOURCE, OLD_SOURCE, OLD_PACKED_ALIAS, count, attempt, readReport, readResponse };
