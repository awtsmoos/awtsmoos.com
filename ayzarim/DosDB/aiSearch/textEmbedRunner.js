// B"H
/**
 * @file textEmbedRunner.js
 * @chapter The Plain Node GGUF Flame
 * @description
 * Auto-downloads the configured GGUF model and embeds text through the existing
 * AwtsmoosDB direct GGUF BERT engine. No packages. No external runners. The
 * Awtsmoos caches duplicate texts in memory so repeated search sparks do not
 * force the same transformer journey twice.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { embedTextFallback } = require("./awtsmoosDbEmbedder.js");
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require("./embedderConfig.js");
const DirectEngine = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/index.js");
const { embedBert } = require("../awtsmoosBinary/awtsmoosDB/api/ai/direct/bertEmbedding.js");

let enginePromise = null;
let lastRealError = null;
const embeddingCache = new Map();

/** @param {object} options @returns {string} */
function modelRoot(options = {}) {
    return options.modelRoot || process.env.AWTSMOOS_EMBED_MODEL_ROOT || path.join(process.cwd(), ".awtsmoos", "ai");
}

/** @param {string} filePath @returns {object|null} */
function safeStat(filePath) {
    try { return fs.statSync(filePath); }
    catch (_) { return null; }
}

/** @param {object} options @returns {object} */
function runnerState(options = {}) {
    const provider = getDefaultEmbedderConfig();
    const root = modelRoot(options);
    const modelPath = resolveEmbedderModelPath(root, provider);
    const stat = safeStat(modelPath);
    const sizeOk = Boolean(stat && (!provider.expectedBytes || stat.size === provider.expectedBytes));
    return {
        provider,
        root,
        modelPath,
        hasModelFile: Boolean(stat),
        modelBytes: stat?.size || 0,
        expectedBytes: provider.expectedBytes || 0,
        hasExpectedSize: sizeOk,
        runner: sizeOk ? "awtsmoosdb-direct-node-gguf-bert" : "auto-download-pending",
        ggufExecutionAvailable: sizeOk,
        realNodeGgufAvailable: sizeOk,
        cachedEmbeddings: embeddingCache.size,
        downloadUrl: provider.downloadUrl,
        lastRealError,
        note: sizeOk ? "Plain Node GGUF BERT embeddings are available." : "Model will auto-download on first embedding."
    };
}

/** @param {object} options @returns {Promise<object>} */
async function ensureModelDownloaded(options = {}) {
    const state = runnerState(options);
    if (state.hasExpectedSize) return { success: true, skipped: true, reason: "model_already_present", state };
    fs.mkdirSync(path.dirname(state.modelPath), { recursive: true });
    await downloadFile(state.downloadUrl, state.modelPath, options);
    const next = runnerState(options);
    return { success: next.hasExpectedSize, skipped: false, state: next };
}

/** @param {string} url @param {string} outPath @param {object} options @returns {Promise<void>} */
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

/** @param {object} options @returns {Promise<object>} */
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

/** @param {string} text @param {object} options @returns {string} */
function cacheKey(text, options = {}) {
    const state = runnerState(options);
    return `${state.provider.filename || "model"}:${state.provider.embeddingDimensions || 384}:${state.provider.pooling || "cls"}:${String(text || "")}`;
}

/** @param {string} text @param {object} options @returns {Promise<object>} */
async function embedTextAuto(text, options = {}) {
    const key = cacheKey(text, options);
    if (embeddingCache.has(key)) return { ...embeddingCache.get(key), cached: true };
    const result = await computeEmbedding(text, options);
    if (result.realEmbedding) embeddingCache.set(key, result);
    return result;
}

/** @param {string} text @param {object} options @returns {Promise<object>} */
async function computeEmbedding(text, options = {}) {
    try {
        const engine = await getDirectEngine(options);
        const state = runnerState(options);
        const vector = Array.from(embedBert(engine, text, {
            dimensions: state.provider.embeddingDimensions || 384,
            pooling: state.provider.pooling || "cls",
            maxTokens: state.provider.maxTokens || 128
        }));
        lastRealError = null;
        return { success: true, realEmbedding: true, vector, state, provider: state.runner, cached: false };
    } catch (error) {
        lastRealError = error.stack || String(error);
        if (options.noFallback) throw error;
        const state = runnerState(options);
        const vector = embedTextFallback(text, state.provider.embeddingDimensions || 384);
        return { success: true, realEmbedding: false, vector, state, provider: "awtsmoosdb-js-fallback", error: lastRealError };
    }
}

/** @param {object} options @returns {object} */
function downloadCommand(options = {}) {
    const state = runnerState(options);
    return { BH: "B\"H", note: "embedTextAuto() downloads automatically when missing.", modelPath: state.modelPath, expectedBytes: state.expectedBytes };
}

module.exports = { runnerState, ensureModelDownloaded, embedTextAuto, downloadCommand, getDirectEngine };
