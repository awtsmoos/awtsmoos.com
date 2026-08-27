// B"H
/**
 * @file awtsmoosDbEmbedder.js
 * @description
 * Bridges the outer DosDB AI search sidecar to the existing AwtsmoosDB AI
 * chamber. Before a GGUF file is downloaded, it uses the pure-JS deterministic
 * 384-dim fallback embedder already living in awtsmoosDB/api/ai/embeddings.js.
 */

const { embedText } = require("../awtsmoosBinary/awtsmoosDB/api/ai/embeddings.js");
const AwtsmoosDbEmbedderConfig = require("../awtsmoosBinary/awtsmoosDB/api/ai/embedder.config.json");

function defaultEmbeddingDimensions() {
    return Number(AwtsmoosDbEmbedderConfig?.default?.dimensions || 384);
}

function embedTextFallback(text, dimensions = defaultEmbeddingDimensions()) {
    return Array.from(embedText(text, dimensions));
}

function attachDefaultEmbedding(record, options = {}) {
    if (Array.isArray(record.embedding) && record.embedding.length) return record;
    const dimensions = Number(options.dimensions || defaultEmbeddingDimensions());
    record.embedding = embedTextFallback(record.text || record.content || "", dimensions);
    record.metadata = {
        ...(record.metadata || {}),
        embeddingProvider: "awtsmoosdb-js-fallback",
        embeddingDimensions: dimensions,
        embeddingModel: AwtsmoosDbEmbedderConfig?.default?.name || "bge-small-en-v1.5-q8_0",
        ggufSource: AwtsmoosDbEmbedderConfig?.default?.source,
        ggufFile: AwtsmoosDbEmbedderConfig?.default?.file
    };
    return record;
}

module.exports = {
    AwtsmoosDbEmbedderConfig,
    defaultEmbeddingDimensions,
    embedTextFallback,
    attachDefaultEmbedding
};
