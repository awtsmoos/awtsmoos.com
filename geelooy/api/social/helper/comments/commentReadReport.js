// B"H
/**
 * @file commentReadReport.js
 * @chapter The Witness Flame Refused The Shadow Copy
 * @description
 * Every read testifies which vessel answered. The only live comment source is
 * the DosDB path language, which routes heichel comments into the custom
 * AwtsmoosDB family filesystem. The former packed mirror is named only as a
 * disabled non-source so stale duplicate data can never masquerade as truth.
 */

const NEW_SOURCE = "duplicateCommentMirrorDisabled";
const OLD_SOURCE = "awtsmoosDbFsCommentTree";
const OLD_PACKED_ALIAS = "packed-comment-shard-disabled";

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
        order: [OLD_SOURCE],
        primary,
        ...(fallback ? { fallback } : {}),
        paths,
        message: source === OLD_SOURCE
            ? "Read from the authoritative DosDB heichel path; migrated heichel comments resolve through the custom AwtsmoosDB family filesystem."
            : "No authoritative AwtsmoosDB comment tree entries matched; duplicate packed mirror fallback is disabled."
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
