// B"H
/**
 * @file textEmbedRunner.js
 * @chapter The Llama Gate Opens First
 * @description
 * Default AwtsmoosDB AI search embeddings now walk through llama.cpp real BGE
 * GGUF embeddings. The older direct GGUF/fallback gates remain, but the first
 * doorway is the llama flame that already proved stable one invocation at a time.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { embedTextFallback } = require("./awtsmoosDbEmbedder.js");
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require("./embedderConfig.js");
const DirectEngine = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/index.js");
const { embedBert } = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/bertEmbedding.js");
const { embedFromTokenTensorSync } = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/embeddingTensor.js");
const { resolveModelRoot, llamaReadiness, embedTextWithLlama } = require("./llamaEmbeddingRunner.js");
let enginePromise = null, lastRealError = null;
const embeddingCache = new Map();
function modelRoot(options = {}) { return resolveModelRoot(options); }
function embeddingMode(options = {}) {
  const raw = String(options.embeddingMode || process.env.AWTSMOOS_EMBED_MODE || "llama").toLowerCase();
  if (["fast", "token", "tokens", "token-pooling", "token_pooling", "tensor"].includes(raw)) return "token-pooling";
  if (["bert", "direct", "direct-bert"].includes(raw)) return "bert";
  if (["fallback", "hash", "js"].includes(raw)) return "fallback";
  return "llama";
}
function safeStat(filePath) { try { return fs.statSync(filePath); } catch (_) { return null; } }
function runnerState(options = {}) {
  const provider = getDefaultEmbedderConfig(), root = modelRoot(options), mode = embeddingMode(options);
  const modelPath = resolveEmbedderModelPath(root, provider), stat = safeStat(modelPath);
  const sizeOk = Boolean(stat && (!provider.expectedBytes || stat.size === provider.expectedBytes));
  const llama = llamaReadiness({ ...options, modelRoot: root, provider, modelPath });
  const directRunner = mode === "token-pooling" ? "awtsmoosdb-direct-node-gguf-token-pooling" : "awtsmoosdb-direct-node-gguf-bert";
  const runner = mode === "llama" ? (llama.ok ? "llama-embedding" : "llama-not-ready") : mode === "fallback" ? "awtsmoosdb-js-fallback" : sizeOk ? directRunner : "auto-download-pending";
  return { provider, root, embeddingMode: mode, modelPath, hasModelFile: Boolean(stat), modelBytes: stat?.size || 0, expectedBytes: provider.expectedBytes || 0, hasExpectedSize: sizeOk, runner, ggufExecutionAvailable: mode === "llama" ? llama.ok : sizeOk, realNodeGgufAvailable: mode === "llama" ? llama.ok : sizeOk, llama, cachedEmbeddings: embeddingCache.size, downloadUrl: provider.downloadUrl, lastRealError };
}
function downloadFile(url, outPath, options = {}) { return new Promise((resolve, reject) => {
  const request = https.get(url, response => { if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) return response.resume(), downloadFile(response.headers.location, outPath, options).then(resolve, reject); if (response.statusCode !== 200) return response.resume(), reject(new Error(`B"H GGUF download failed: HTTP ${response.statusCode}`)); const file = fs.createWriteStream(outPath); response.pipe(file); file.on("finish", () => file.close(resolve)); file.on("error", reject); });
  request.setTimeout(options.timeoutMs || 600000, () => request.destroy(new Error("B\"H GGUF download timed out"))); request.on("error", reject);
}); }
async function ensureModelDownloaded(options = {}) {
  const state = runnerState(options); if (state.hasExpectedSize) return { success: true, skipped: true, reason: "model_already_present", state };
  fs.mkdirSync(path.dirname(state.modelPath), { recursive: true }); await downloadFile(state.downloadUrl, state.modelPath, options);
  const next = runnerState(options); return { success: next.hasExpectedSize, skipped: false, state: next };
}
async function getDirectEngine(options = {}) { await ensureModelDownloaded(options); if (!enginePromise || options.fresh) enginePromise = (async () => { const s = runnerState(options); const e = new DirectEngine(s.modelPath, { verbose: Boolean(options.verbose) }); await e.init(); return e; })(); return await enginePromise; }
function cacheKey(text, options = {}) { const s = runnerState(options); return `${s.provider.filename}:${s.embeddingMode}:${s.provider.embeddingDimensions || 384}:${String(text || "")}`; }
async function embedTextAuto(text, options = {}) { const key = cacheKey(text, options); if (embeddingCache.has(key)) return { ...embeddingCache.get(key), cached: true }; const result = await computeEmbedding(text, options); if (result.realEmbedding) embeddingCache.set(key, result); return result; }
async function embedManyTextAuto(texts, options = {}) { const out = []; for (const text of texts) out.push(await embedTextAuto(text, options)); return out; }
async function computeEmbedding(text, options = {}) {
  const state = runnerState(options);
  try {
    if (state.embeddingMode === "fallback") throw new Error("fallback mode requested");
    if (state.embeddingMode === "llama") { const result = embedTextWithLlama(text, { ...options, modelRoot: state.root, modelPath: state.modelPath, provider: state.provider }); lastRealError = null; return result; }
    const engine = await getDirectEngine(options), dimensions = state.provider.embeddingDimensions || 384;
    const vector = state.embeddingMode === "token-pooling" ? Array.from(embedFromTokenTensorSync(engine, text, { dimensions, tokenPoolingOnly: true })) : Array.from(embedBert(engine, text, { dimensions, pooling: state.provider.pooling || "cls", maxTokens: state.provider.maxTokens || 128 }));
    lastRealError = null; return { success: true, realEmbedding: true, vector, state, embeddingMode: state.embeddingMode, provider: state.runner, cached: false };
  } catch (error) {
    lastRealError = error.stack || String(error); if (options.noFallback) throw error;
    const vector = embedTextFallback(text, state.provider.embeddingDimensions || 384);
    return { success: true, realEmbedding: false, vector, state, embeddingMode: "fallback", provider: "awtsmoosdb-js-fallback", error: lastRealError };
  }
}
function downloadCommand(options = {}) { const s = runnerState(options); return { BH: "B\"H", note: "Default mode is llama. Model downloads only for direct modes.", modelPath: s.modelPath, expectedBytes: s.expectedBytes, embeddingMode: s.embeddingMode, llamaBinary: s.llama.llamaBinary }; }
module.exports = { runnerState, ensureModelDownloaded, embedTextAuto, embedManyTextAuto, downloadCommand, getDirectEngine, embeddingMode };
