// B"H
/**
 * @file llamaEmbeddingRunner.js
 * @chapter The One Spark Per Breath Runner
 * @description
 * The Awtsmoos speaks a single word and the vessel answers once. This runner
 * invokes llama.cpp one text at a time, parses raw BGE rows, averages token rows
 * when llama prints them, and returns one normalized 384-dimensional flame.
 */
const fs = require("fs");
const path = require("path");
const child = require("child_process");
const { getDefaultEmbedderConfig, resolveEmbedderModelPath } = require("./embedderConfig.js");

function existing(...items) { return items.find(Boolean) || null; }
function commandPath(name) {
  try { return child.execFileSync("bash", ["-lc", `command -v ${name}`], { encoding: "utf8" }).trim() || null; }
  catch (_) { return null; }
}
function defaultCommentRagRoot() {
  const p = "/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag";
  return fs.existsSync(p) ? p : null;
}
function resolveModelRoot(options = {}) {
  return existing(options.modelRoot, process.env.AWTSMOOS_EMBED_MODEL_ROOT, defaultCommentRagRoot(), path.join(process.cwd(), ".awtsmoos", "ai"));
}
function resolveLlamaBinary(options = {}) {
  const root = resolveModelRoot(options);
  return existing(options.llamaBinary, process.env.AWTSMOOS_LLAMA_EMBEDDING_BIN, root && path.join(root, "embedder-lab/llama.cpp/build/bin/llama-embedding"), commandPath("llama-embedding"));
}
function llamaReadiness(options = {}) {
  const provider = options.provider || getDefaultEmbedderConfig();
  const root = resolveModelRoot(options);
  const modelPath = options.modelPath || resolveEmbedderModelPath(root, provider);
  const llamaBinary = resolveLlamaBinary(options);
  return { ok: fs.existsSync(modelPath) && fs.existsSync(llamaBinary || ""), root, modelPath, llamaBinary, provider };
}
function normalize(vec) {
  const mag = Math.sqrt(vec.reduce((s, n) => s + n * n, 0)) || 1;
  return vec.map(n => Number((n / mag).toFixed(7)));
}
function parseRawEmbedding(raw, dim = 384) {
  const nums = String(raw || "").trim().split(/\s+/).map(Number).filter(Number.isFinite);
  if (nums.length === dim) return { vector: normalize(nums), parseMode: `single-${dim}` };
  if (nums.length > dim && nums.length % dim === 0) {
    const rows = nums.length / dim;
    const avg = Array(dim).fill(0);
    for (let r = 0; r < rows; r++) for (let i = 0; i < dim; i++) avg[i] += nums[r * dim + i] / rows;
    return { vector: normalize(avg), parseMode: `mean-${rows}x${dim}` };
  }
  throw new Error(`B"H llama raw embedding parse failed: expected ${dim} or ${dim}-wide rows, got ${nums.length}`);
}
function embedTextWithLlama(text, options = {}) {
  const ready = llamaReadiness(options);
  const dim = Number(ready.provider.embeddingDimensions || ready.provider.dimensions || 384);
  if (!ready.ok) {
    const error = new Error("B\"H llama embedder is not ready");
    error.code = "LLAMA_EMBEDDER_NOT_READY";
    error.readiness = ready;
    throw error;
  }
  const args = ["-m", ready.modelPath, "-p", String(text || ""), "--pooling", ready.provider.pooling || "cls", "--embd-normalize", "2", "--embd-output-format", "raw"];
  const res = child.spawnSync(ready.llamaBinary, args, { encoding: "utf8", maxBuffer: options.maxBuffer || 128 * 1024 * 1024 });
  if (res.status !== 0) throw new Error(res.stderr || `B"H llama-embedding exited ${res.status}`);
  const parsed = parseRawEmbedding(res.stdout, dim);
  return { success: true, realEmbedding: true, vector: parsed.vector, provider: "llama-embedding:bge-small-en-v1.5-q8_0", state: { ...ready, parseMode: parsed.parseMode }, cached: false };
}
module.exports = { resolveModelRoot, resolveLlamaBinary, llamaReadiness, parseRawEmbedding, embedTextWithLlama };
