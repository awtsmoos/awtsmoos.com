// B"H
/**
 * @file memoryIndex.js
 * @description
 * A tiny searchable vessel for the first AI-search bridge. Later embeddings
 * will descend here; today simple lexical matching proves the contract fast.
 */

function tokens(value) {
    return String(value ?? "")
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);
}

function scoreRecord(record, query) {
    const haystack = new Set(tokens(`${record.text} ${JSON.stringify(record.metadata || {})}`));
    return tokens(query).reduce((score, token) => score + (haystack.has(token) ? 1 : 0), 0);
}

/**
 * Creates an in-memory lexical index.
 * @returns {object} Index API.
 */
function createMemoryIndex() {
    const records = new Map();

    return {
        upsert(record) {
            records.set(record.id, record);
            return record;
        },

        search(query) {
            return Array.from(records.values())
                .map(record => ({ record, score: scoreRecord(record, query) }))
                .filter(result => result.score > 0 || !String(query || "").trim())
                .sort((a, b) => b.score - a.score || a.record.id.localeCompare(b.record.id));
        },

        all() {
            return Array.from(records.values());
        }
    };
}

module.exports = { createMemoryIndex, scoreRecord };
