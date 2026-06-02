// B"H
const { readText, readBytesBase64, readTextFromBytes, number } = require("./readWrite.js");
const { parsePlainList, firstPayloadValue } = require("./plainPayload.js");

/**
 * B"H
 * Chapter 355: Bulk Read Broke The False Ceiling.
 *
 * Bulk has no artificial file limit unless maxFiles is given. Each file may now
 * say maxChars/maxBytes/all/noLimit/unlimited to receive the full vessel. The
 * Awtsmoos still records metadata so vast reads do not masquerade as small.
 */
function normalizeSpec(one) {
  if (typeof one === "string") return { path: one, mode: "text" };
  if (one && typeof one === "object") return { path: String(one.path || one.p || ""), mode: one.mode || one.readMode || "text", maxChars: one.maxChars, offsetChars: one.offsetChars, maxBytes: one.maxBytes, offsetBytes: one.offsetBytes, all: one.all, noLimit: one.noLimit, unlimited: one.unlimited };
  return { path: "", mode: "text" };
}

function uniqueSpecs(paths) {
  const out = [], seen = new Set();
  for (const item of paths || []) {
    const spec = normalizeSpec(item), p = String(spec.path || "").trim();
    if (!p) continue;
    const key = [p, spec.mode, spec.offsetChars || 0, spec.offsetBytes || 0].join("::");
    if (!seen.has(key)) { seen.add(key); spec.path = p; out.push(spec); }
  }
  return out;
}

function requestedLimit(value, fallback) {
  if (value === true) return Infinity;
  const text = String(value ?? "").toLowerCase();
  if (["all", "none", "nolimit", "unlimited", "infinity", "∞", "0", "-1"].includes(text)) return Infinity;
  return value == null || value === "" ? fallback : Number(value);
}

function fileSizeMeta(got) {
  return { encoding: got.encoding || "utf8", returnedChars: got.returnedChars || null, totalChars: got.totalChars || null, offsetChars: got.offsetChars || null, nextOffsetChars: got.nextOffsetChars || null, returnedBytes: got.returnedBytes || null, totalBytes: got.totalBytes || null, offsetBytes: got.offsetBytes || null, nextOffsetBytes: got.nextOffsetBytes || null, truncated: !!got.truncated };
}

async function readOne(config, spec, payload) {
  const mode = String(spec.mode || "text");
  const all = spec.all || spec.noLimit || spec.unlimited || payload.all || payload.noLimit || payload.unlimited;
  const maxChars = all ? Infinity : requestedLimit(spec.maxChars ?? payload.maxChars, undefined);
  const maxBytes = all ? Infinity : requestedLimit(spec.maxBytes ?? payload.maxBytes, undefined);
  if (mode === "base64" || mode === "read64") return await readBytesBase64(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  if (mode === "bytes" || mode === "text-bytes" || mode === "readBytes") return await readTextFromBytes(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  return await readText(config, spec.path, maxChars, spec.offsetChars ?? payload.offsetChars ?? 0);
}

async function readBulk(config, payload) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
  const requested = uniqueSpecs(parsePlainList(firstPayloadValue(payload, ["paths", "files", "path", "p"]) || []));
  const maxFiles = payload.maxFiles == null || payload.maxFiles === "" ? 0 : number(payload.maxFiles, 0);
  const selected = maxFiles ? requested.slice(0, maxFiles) : requested;
  const skipped = maxFiles ? requested.slice(maxFiles) : [];
  const files = {}, metadata = {}, order = [];
  let usedChars = 0, okCount = 0, errorCount = 0;
  for (const spec of selected) {
    const one = spec.path; order.push(one);
    try {
      const got = await readOne(config, spec, payload);
      const returnedSize = got.returnedChars || got.returnedBytes || String(got.content || got.content64 || "").length;
      usedChars += returnedSize; okCount++;
      files[one] = { ok: true, path: one, mode: spec.mode || "text", content: got.content, content64: got.content64, truncated: got.truncated, encoding: got.encoding, offsetChars: got.offsetChars, nextOffsetChars: got.nextOffsetChars, offsetBytes: got.offsetBytes, nextOffsetBytes: got.nextOffsetBytes };
      metadata[one] = fileSizeMeta(got);
    } catch (e) { errorCount++; files[one] = { ok: false, path: one, error: e.message }; metadata[one] = { ok: false, error: e.message }; }
  }
  return { ok: errorCount === 0, action: "bulk", root: config.root, requestedCount: requested.length, returnedCount: selected.length, okCount, errorCount, skippedCount: skipped.length, skippedPaths: skipped.map(x => x.path), usedChars, maxFiles, partial: skipped.length > 0, stoppedBecause: skipped.length ? "maxFiles_requested" : null, message: skipped.length ? "Bulk returned selected files and skipped the rest because maxFiles was explicitly set." : "Bulk read completed.", order, metadata, files };
}

module.exports = { readBulk, uniqueSpecs, normalizeSpec, requestedLimit };
