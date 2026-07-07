// B"H
/**
 * @file textEmbedRunner.js
 * @chapter The Two Gates Of The Search Flame
 * @description
 * Auto-downloads the configured GGUF model and embeds text through the existing
 * AwtsmoosDB direct engine. The slow gate runs full BERT transformer inference.
 * The fast gate pools the model's own token embedding tensor so user search can
 * answer in human time. The Awtsmoos speaks one word, and the vessel must not
 * make the seeker wait thirty-three seconds to hear it echo.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { embedTextFallback } = require("./awtsmoosDbEmbedder.js");
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require("./embedderConfig.js");
const DirectEngine = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/index.js");
const { embedBert } = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/bertEmbedding.js");
const { embedFromTokenTensorSync } = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/embeddingTensor.js");

let enginePromise = null;
let lastRealError = null;
const embeddingCache = new Map();

function modelRoot(options = {}) {
    return options.modelRoot || process.env.AWTSMOOS_EMBED_MODEL_ROOT || path.join(process.cwd(), ".awtsmoos", "ai");
}

function embeddingMode(options = {}) {
    const raw = String(options.embeddingMode || process.env.AWTSMOOS_EMBED_MODE || "bert").toLowerCase();
    if (["fast", "token", "tokens", "token-pooling", "token_pooling", "tensor"].includes(raw)) return "token-pooling";
    return "bert";
}

function safeStat(filePath) {
    try { return fs.statSync(filePath); }
    catch (_) { return null; }
}

function runnerState(options = {}) {
    const provider = getDefaultEmbedderConfig();
    const root = modelRoot(options);
    const mode = embeddingMode(options);
    const modelPath = resolveEmbedderModelPath(root, provider);
    const stat = safeStat(modelPath);
    const sizeOk = Boolean(stat && (!provider.expectedBytes || stat.size === provider.expectedBytes));
    const runner = mode === "token-pooling" ? "awtsmoosdb-direct-node-gguf-token-pooling" : "awtsmoosdb-direct-node-gguf-bert";
    return {
        provider,
        root,
        embeddingMode: mode,
        modelPath,
        hasModelFile: Boolean(stat),
        modelBytes: stat?.size || 0,
        expectedBytes: provider.expectedBytes || 0,
        hasExpectedSize: sizeOk,
        runner: sizeOk ? runner : "auto-download-pending",
        ggufExecutionAvailable: sizeOk,
        realNodeGgufAvailable: sizeOk,
        cachedEmbeddings: embeddingCache.size,
        downloadUrl: provider.downloadUrl,
        lastRealError,
        note: sizeOk ? `Plain Node GGUF embeddings are available in ${mode} mode.` : "Model will auto-download on first embedding."
    };
}

async function ensureModelDownloaded(options = {}) {
    const state = runnerState(options);
    if (state.hasExpectedSize) return { success: true, skipped: true, reason: "model_already_present", state };
    fs.mkdirSync(path.dirname(state.modelPath), { recursive: true });
    await downloadFile(state.downloadUrl, state.modelPath, options);
    const next = runnerState(options);
    return { success: next.hasExpectedSize, skipped: false, state: next };
}

function downloadFile(url, outPath, options = {}) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                downloadFile(response.headers.location, outPath, options).then(resolve, reject);
                return;
            }
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`B"H GGUF download failed: HTTP ${response.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(outPath);
            response.pipe(file);
            file.on("finish", () => file.close(resolve));
            file.on("error", reject);
        });
        request.setTimeout(options.timeoutMs || 600000, () => request.destroy(new Error("B\"H GGUF download timed out")));
        request.on("error", reject);
    });
}

async function getDirectEngine(options = {}) {
    const ready = await ensureModelDownloaded(options);
    if (!ready.success) throw new Error("B\"H GGUF model could not be prepared");
    if (!enginePromise || options.fresh) {
        enginePromise = (async () => {
            const state = runnerState(options);
            const engine = new DirectEngine(state.modelPath, { verbose: Boolean(options.verbose) });
            await engine.init();
            return engine;
        })();
    }
    return await enginePromise;
}

function cacheKey(text, options = {}) {
    const state = runnerState(options);
    return `${state.provider.filename || "model"}:${state.embeddingMode}:${state.provider.embeddingDimensions || 384}:${state.provider.pooling || "cls"}:${String(text || "")}`;
}

async function embedTextAuto(text, options = {}) {
    const key = cacheKey(text, options);
    if (embeddingCache.has(key)) return { ...embeddingCache.get(key), cached: true };
    const result = await computeEmbedding(text, options);
    if (result.realEmbedding) embeddingCache.set(key, result);
    return result;
}

async function embedManyTextAuto(texts, options = {}) {
    const out = [];
    for (const text of texts) out.push(await embedTextAuto(text, options));
    return out;
}

async function computeEmbedding(text, options = {}) {
    try {
        const engine = await getDirectEngine(options);
        const state = runnerState(options);
        const dimensions = state.provider.embeddingDimensions || 384;
        const vector = state.embeddingMode === "token-pooling"
            ? Array.from(embedFromTokenTensorSync(engine, text, { dimensions, tokenPoolingOnly: true }))
            : Array.from(embedBert(engine, text, { dimensions, pooling: state.provider.pooling || "cls", maxTokens: state.provider.maxTokens || 128 }));
        lastRealError = null;
        return { success: true, realEmbedding: true, vector, state, embeddingMode: state.embeddingMode, provider: state.runner, cached: false };
    } catch (error) {
        lastRealError = error.stack || String(error);
        if (options.noFallback) throw error;
        const state = runnerState(options);
        const vector = embedTextFallback(text, state.provider.embeddingDimensions || 384);
        return { success: true, realEmbedding: false, vector, state, embeddingMode: "fallback", provider: "awtsmoosdb-js-fallback", error: lastRealError };
    }
}

function downloadCommand(options = {}) {
    const state = runnerState(options);
    return { BH: "B\"H", note: "embedTextAuto() downloads automatically when missing.", modelPath: state.modelPath, expectedBytes: state.expectedBytes, embeddingMode: state.embeddingMode };
}

module.exports = { runnerState, ensureModelDownloaded, embedTextAuto, embedManyTextAuto, downloadCommand, getDirectEngine, embeddingMode };
