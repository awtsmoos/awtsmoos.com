// B"H
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const DIR = ".awtsmoos/actions/large-responses";
const DEFAULT_INLINE_BYTES = 384 * 1024;
const DEFAULT_MAX_FILES = 200;
const DEFAULT_MAX_AGE_MS = 12 * 60 * 60 * 1000;
function clamp(n, min, max, fallback) { n = Number(n); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
function inlineLimit() { return clamp(process.env.AWTSMOOS_INLINE_RESPONSE_BYTES, DEFAULT_INLINE_BYTES, 64 * 1024, 8 * 1024 * 1024, DEFAULT_INLINE_BYTES); }
function jsonBytes(value) { try { return Buffer.byteLength(JSON.stringify(value), "utf8"); } catch { return 0; } }
function compactPreview(value, max = 4000) { try { return JSON.stringify(value).slice(0, max); } catch { return String(value || "").slice(0, max); } }
function responseDir(root) { const dir = path.join(root, DIR); fs.mkdirSync(dir, { recursive:true }); return dir; }
function prune(root, options = {}) {
  const dir = responseDir(root), now = Date.now();
  const maxFiles = clamp(options.maxFiles || process.env.AWTSMOOS_LARGE_RESPONSE_MAX_FILES, 10, 5000, DEFAULT_MAX_FILES);
  const maxAgeMs = clamp(options.maxAgeMs || process.env.AWTSMOOS_LARGE_RESPONSE_MAX_AGE_MS, 60_000, 7 * 24 * 60 * 60 * 1000, DEFAULT_MAX_AGE_MS);
  const files = fs.readdirSync(dir, { withFileTypes:true }).filter(e => e.isFile() && e.name.endsWith(".json")).map(e => { const full = path.join(dir, e.name); let stat = { mtimeMs:0 }; try { stat = fs.statSync(full); } catch {} return { full, mtimeMs:stat.mtimeMs }; }).sort((a, b) => b.mtimeMs - a.mtimeMs);
  let deleted = 0; files.forEach((file, i) => { if (i < maxFiles && now - file.mtimeMs <= maxAgeMs) return; try { fs.unlinkSync(file.full); deleted++; } catch {} });
  return { maxFiles, maxAgeMs, deleted, kept:Math.max(0, files.length - deleted) };
}
function spill(root, value, label = "response") {
  const dir = responseDir(root); prune(root);
  const name = `${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${String(label).replace(/[^a-z0-9_-]+/gi, "_")}.json`;
  const rel = `${DIR}/${name}`, full = path.join(root, rel), text = JSON.stringify(value, null, 2);
  fs.writeFileSync(full, text, "utf8");
  return { ref:rel, bytes:Buffer.byteLength(text, "utf8"), preview:compactPreview(value) };
}
function compactForSend(root, envelope, options = {}) {
  const fallbackLimit = inlineLimit();
  const limit = clamp(options.limitBytes || fallbackLimit, 16 * 1024, 64 * 1024 * 1024, fallbackLimit);
  const bytes = jsonBytes(envelope);
  if (bytes <= limit) return { envelope, bytes, spilled:false };
  const saved = spill(root, envelope, envelope.action || envelope.type || "response");
  const compact = { type:envelope.type || "TUNNEL_RESPONSE", id:envelope.id, ok:envelope.ok !== false, action:envelope.action, partial:true, responseTruncated:true, responseBytes:bytes, inlineLimitBytes:limit, outputRef:saved.ref, outputBytes:saved.bytes, preview:saved.preview, guidance:"Response was saved because it was too large to inline. Use read/read64 on outputRef." };
  return { envelope:compact, bytes:jsonBytes(compact), spilled:true };
}
module.exports = { compactForSend, spill, prune, jsonBytes, inlineLimit };
