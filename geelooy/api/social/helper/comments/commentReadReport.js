// B"H
/**
 * @file commentReadReport.js
 * @chapter The Witness Flame Names The True Vessel
 * @description
 * Every read testifies which vessel answered. The primary comment tree path is
 * now the DosDB path language, which routes heichel comments into the AwtsmoosDB
 * family filesystem when migrated files exist. The old packed JSONL shard is a
 * last-resort fallback and is named as such.
 */

const NEW_SOURCE = "oldPackedCommentShardFallback";
const OLD_SOURCE = "awtsmoosDbFsCommentTree";
const OLD_PACKED_ALIAS = "packed-comment-shard";

function count(value) {
    return Array.isArray(value) ? value.length : 0;
}

function attempt({ ok, source, data = [], error }) {
    return { ok, source, data, count: count(data), ...(error ? { error: error.stack || String(error) } : {}) };
}

function readReport({ source, primary, fallback, paths }) {
    return {
        BH: "B\"H",
        source,
        order: [OLD_SOURCE, NEW_SOURCE],
        primary,
        ...(fallback ? { fallback } : {}),
        paths,
        message: source === OLD_SOURCE
            ? "Read from the DosDB heichel path; migrated heichel comments resolve through the AwtsmoosDB family filesystem."
            : source === NEW_SOURCE
                ? "DosDB/AwtsmoosDB comment tree had no result, so the old packed comment shard fallback answered."
                : "Neither AwtsmoosDB comment tree nor packed fallback had matching comments."
    };
}

function compatibilityFields(source) {
    if (source === OLD_SOURCE) return { fallbackSource: OLD_SOURCE };
    if (source === NEW_SOURCE) return { fallbackSource: OLD_PACKED_ALIAS };
    return {};
}

function readResponse({ data, source, primary, fallback, paths }) {
    return {
        success: Array.isArray(data) ? data : [],
        ...compatibilityFields(source),
        awtsmoosCommentRead: readReport({ source, primary, fallback, paths })
    };
}

module.exports = { NEW_SOURCE, OLD_SOURCE, OLD_PACKED_ALIAS, count, attempt, readReport, readResponse };
