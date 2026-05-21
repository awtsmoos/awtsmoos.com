// B"H
/**
 * @file index.js
 * @description
 * AI-search bridge skeleton. It opens a parallel AwtsmoosDB vessel while
 * exposing a small tested record/search API that can later receive embeddings.
 */

const path = require("path");
const DosDB = require("../index.js");
const { createMemoryIndex } = require("./memoryIndex.js");
const { normalizeAiSearchRecord } = require("./recordShape.js");

function resolveDbPath(rootOrPath) {
    if (!rootOrPath) return "ai-search.awtsdb";
    const text = String(rootOrPath);
    return text.endsWith(".awtsdb") ? text : path.join(text, "ai-search.awtsdb");
}

/**
 * Creates an isolated AI-search bridge.
 * @param {string} rootOrPath Directory root or explicit .awtsdb path.
 * @returns {object} AI search DB bridge API.
 */
function createAiSearchDb(rootOrPath, options = {}) {
    const index = createMemoryIndex();
    const dbPath = resolveDbPath(rootOrPath);
    const awtsmoosDb = DosDB.awtsmoosDb(dbPath, { open: options.open !== false });

    return {
        path: dbPath,
        awtsmoosDb,

        indexCommentRecord(record) {
            return index.upsert(normalizeAiSearchRecord(record));
        },

        searchCommentRecords(query) {
            return index.search(query);
        },

        allCommentRecords() {
            return index.all();
        },

        stats() {
            const all = index.all();
            return {
                path: dbPath,
                count: all.length,
                hasAwtsmoosDb: Boolean(awtsmoosDb),
                latestIndexedAt: all.reduce((max, item) => Math.max(max, item.indexedAt || 0), 0)
            };
        }
    };
}

module.exports = { createAiSearchDb };
