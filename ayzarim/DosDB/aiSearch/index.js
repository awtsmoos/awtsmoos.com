// B"H
/**
 * @file index.js
 * @description
 * AI-search bridge. It opens a parallel AwtsmoosDB vessel and gives records a
 * default pure-JS embedding from the existing AwtsmoosDB AI chamber before a
 * local GGUF file is downloaded/awakened.
 */

const path = require("path");
const DosDB = require("../index.js");
const { createMemoryIndex } = require("./memoryIndex.js");
const { normalizeAiSearchRecord } = require("./recordShape.js");
const { attachDefaultEmbedding } = require("./awtsmoosDbEmbedder.js");

function resolveDbPath(rootOrPath) {
    if (!rootOrPath) return "ai-search.awtsdb";
    const text = String(rootOrPath);
    return text.endsWith(".awtsdb") ? text : path.join(text, "ai-search.awtsdb");
}

/**
 * Creates an isolated AI-search bridge.
 * @param {string} rootOrPath Directory root or explicit .awtsdb path.
 * @param {object} [options={}] Options.
 * @returns {object} AI search DB bridge API.
 */
function createAiSearchDb(rootOrPath, options = {}) {
    const index = createMemoryIndex({ embedQuery: options.embedQuery });
    const dbPath = resolveDbPath(rootOrPath);
    const awtsmoosDb = DosDB.awtsmoosDb(dbPath, { open: options.open !== false });

    return {
        path: dbPath,
        awtsmoosDb,

        indexCommentRecord(record) {
            const normalized = normalizeAiSearchRecord(record);
            return index.upsert(attachDefaultEmbedding(normalized, options));
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
                latestIndexedAt: all.reduce((max, item) => Math.max(max, item.indexedAt || 0), 0),
                embeddedCount: all.filter(item => Array.isArray(item.embedding) && item.embedding.length).length
            };
        }
    };
}

module.exports = { createAiSearchDb };
