// B"H
/**
 * @file embedderConfig.js
 * @chapter The Name Of The Real Runner Is Written First
 * @description
 * Loads the AwtsmoosDB-native AI embedder config and presents the outer
 * aiSearch provider shape. The default runtime is llama.cpp real BGE embeddings;
 * fallback is named only as a recovery vessel, never as the throne.
 */
const path = require("path");
const AWTSMOOS_DB_AI_CONFIG_PATH = path.join(__dirname, "../awtsmoosBinary/awtsmoosDB/api/ai/embedder.config.json");
function loadEmbedderConfig() {
  const native = require(AWTSMOOS_DB_AI_CONFIG_PATH), provider = native.default || {};
  const name = provider.name || "bge-small-en-v1.5_q8_0";
  return { BH: "B\"H", defaultProvider: name, native, providers: { [name]: providerShape(provider) } };
}
function providerShape(provider) {
  return {
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
    defaultRuntime: provider.defaultRuntime || "llama-embedding",
    runnerPreference: provider.runnerPreference || ["llama-embedding", "awtsmoosdb-js-fallback"],
    notes: provider.notes || "Default runtime uses llama.cpp llama-embedding with raw output."
  };
}
function getDefaultEmbedderConfig() {
  const config = loadEmbedderConfig();
  return config.providers[config.defaultProvider];
}
function resolveEmbedderModelPath(rootOrPath, provider = getDefaultEmbedderConfig()) {
  return path.join(rootOrPath || process.cwd(), "models", provider.filename);
}
module.exports = { AWTSMOOS_DB_AI_CONFIG_PATH, loadEmbedderConfig, getDefaultEmbedderConfig, resolveEmbedderModelPath };
