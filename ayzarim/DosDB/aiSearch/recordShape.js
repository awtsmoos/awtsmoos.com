// B"H
/**
 * @file recordShape.js
 * @description
 * The Awtsmoos gives each comment-search record a clean vessel: stable id,
 * coordinate metadata, searchable text, and future embedding space.
 */

function cleanText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
}

function lexicalSignature(text) {
    let hash = 0;
    for (const char of String(text || "")) {
        hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }
    return Math.abs(hash).toString(36);
}

function lexicalSignature(text) {
    let hash = 0;
    for (const char of String(text || "")) {
        hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }
    return Math.abs(hash).toString(36);
}

function stableId(record) {
    return String(
        record.id ||
        record.commentId ||
        record.key ||
        `${record.aliasId || "anon"}:${record.parentId || "post"}:${Date.now()}`
    );
}

/**
 * Normalizes a comment record for future semantic indexing.
 * @param {object} record Raw comment/search record.
 * @returns {object} Normalized AI-search record.
 */
function normalizeAiSearchRecord(record = {}) {
    const text = cleanText(record.text || record.content || record.body || record.dayuh?.content);

    return {
        id: stableId(record),
        aliasId: String(record.aliasId || record.author || ""),
        parentId: String(record.parentId || record.postId || record.dayuh?.parentId || ""),
        coordinate: record.coordinate || record.dayuh?.coordinate || record.dayuh || {},
        text,
        metadata: {
            ...(record.metadata && typeof record.metadata === "object" ? record.metadata : {}),
            lexicalSignature: lexicalSignature(text),
            textLength: text.length
        },
        embedding: Array.isArray(record.embedding) ? record.embedding.slice() : [],
        indexedAt: record.indexedAt || Date.now()
    };
}

module.exports = { normalizeAiSearchRecord };
