// B"H
/**
 * @file embedderConfig.js
 * @description
 * Loads the AwtsmoosDB-native AI embedder config and exposes the richer outer
 * aiSearch provider shape. The source of truth remains
 * awtsmoosBinary/awtsmoosDB/api/ai/embedder.config.json.
 */

const path = require("path");

const AWTSMOOS_DB_AI_CONFIG_PATH = path.join(
    __dirname,
    "../awtsmoosBinary/awtsmoosDB/api/ai/embedder.config.json"
);

function loadEmbedderConfig() {
    const native = require(AWTSMOOS_DB_AI_CONFIG_PATH);
    const provider = native.default || {};
    return {
        BH: "B\"H",
        defaultProvider: provider.name || "bge-small-en-v1.5_q8_0",
        native,
        providers: {
            [provider.name || "bge-small-en-v1.5_q8_0"]: {
                kind: "gguf",
                task: "feature-extraction",
                language: "en",
                modelFamily: "bge",
                repoId: "ggml-org/bge-small-en-v1.5-Q8_0-GGUF",
                filename: provider.file,
                huggingFaceTreeUrl: provider.source,
                huggingFaceReadmeUrl: "https://huggingface.co/ggml-org/bge-small-en-v1.5-Q8_0-GGUF/blob/main/README.md",
                downloadUrl: "https://huggingface.co/ggml-org/bge-small-en-v1.5-Q8_0-GGUF/resolve/main/" + provider.file,
                expectedBytes: 36685152,
                expectedEtag: "f6794d77f686167b29b57cfc533c2b8f43d40b097d91eedb561577211e4179e4",
                embeddingDimensions: provider.dimensions || 384,
                pooling: provider.pooling || "cls",
                maxTokens: provider.maxTokens || 128,
                runnerPreference: [
                    "awtsmoosdb-pure-js-direct-gguf",
                    "awtsmoosdb-js-fallback",
                    "llama-embedding",
                    "llama-cli --embedding",
                    "llama-cpp-python"
                ],
                notes: "Outer aiSearch view over the existing AwtsmoosDB AI embedder config. Uses JS fallback embeddings until a local GGUF file is loaded."
            }
        }
    };
}

function getDefaultEmbedderConfig() {
    const config = loadEmbedderConfig();
    return config.providers[config.defaultProvider];
}

function resolveEmbedderModelPath(rootOrPath, provider = getDefaultEmbedderConfig()) {
    const base = rootOrPath || process.cwd();
    return path.join(base, "models", provider.filename);
}

module.exports = {
    AWTSMOOS_DB_AI_CONFIG_PATH,
    loadEmbedderConfig,
    getDefaultEmbedderConfig,
    resolveEmbedderModelPath
};
