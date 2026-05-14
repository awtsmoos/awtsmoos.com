
// B"H

const { readText, readBytesBase64, readTextFromBytes, clampNumber } = require("./readWrite.js");

const DEFAULT_MAX_FILES = 5;
const HARD_MAX_FILES = 10;

const DEFAULT_TOTAL_MAX_CHARS = 24000;
const HARD_TOTAL_MAX_CHARS = 60000;

const DEFAULT_FILE_MAX_CHARS = 8000;
const HARD_FILE_MAX_CHARS = 30000;

function normalizeSpec(one) {
  if (typeof one === "string") {
    return {
      path: one,
      mode: "text"
    };
  }

  if (one && typeof one === "object") {
    return {
      path: String(one.path || one.p || ""),
      mode: one.mode || one.readMode || "text",
      maxChars: one.maxChars,
      offsetChars: one.offsetChars,
      maxBytes: one.maxBytes,
      offsetBytes: one.offsetBytes
    };
  }

  return {
    path: "",
    mode: "text"
  };
}

function uniqueSpecs(paths) {
  const out = [];
  const seen = new Set();

  for (const item of paths || []) {
    const spec = normalizeSpec(item);
    const p = String(spec.path || "").trim();

    if (!p) continue;

    const key = [
      p,
      spec.mode,
      spec.offsetChars || 0,
      spec.offsetBytes || 0
    ].join("::");

    if (seen.has(key)) continue;

    seen.add(key);
    spec.path = p;
    out.push(spec);
  }

  return out;
}

function guidanceText({ maxFiles, totalMaxChars, fileMaxChars, stoppedBecause }) {
  return [
    stoppedBecause
      ? "Bulk read stopped early because: " + stoppedBecause
      : "Bulk read completed within caps.",
    "",
    "Bulk read is intentionally capped to avoid timeouts.",
    "Try getting fewer files at a time, or request smaller chunks.",
    "",
    "Recommended GPT workflow:",
    "1) tree depth=2 limit=150",
    "2) read one important file",
    "3) bulk 2-5 small files max",
    "4) use offsetChars/nextOffsetChars or offsetBytes/nextOffsetBytes for long files",
    "",
    "Current caps:",
    "- maxFiles: " + maxFiles,
    "- totalMaxChars: " + totalMaxChars,
    "- per-file maxChars: " + fileMaxChars
  ].join("\n");
}

function fileSizeMeta(got) {
  return {
    encoding: got.encoding || "utf8",
    returnedChars: got.returnedChars || null,
    totalChars: got.totalChars || null,
    offsetChars: got.offsetChars || null,
    nextOffsetChars: got.nextOffsetChars || null,
    returnedBytes: got.returnedBytes || null,
    totalBytes: got.totalBytes || null,
    offsetBytes: got.offsetBytes || null,
    nextOffsetBytes: got.nextOffsetBytes || null,
    truncated: !!got.truncated
  };
}

async function readOne(config, spec, perFileChars, remainingChars, payload) {
  const mode = String(spec.mode || "text");

  if (mode === "base64" || mode === "read64") {
    return await readBytesBase64(
      config,
      spec.path,
      spec.maxBytes || payload.maxBytes || Math.min(remainingChars, 24000),
      spec.offsetBytes || payload.offsetBytes || 0
    );
  }

  if (mode === "bytes" || mode === "text-bytes") {
    return await readTextFromBytes(
      config,
      spec.path,
      spec.maxBytes || payload.maxBytes || Math.min(remainingChars, 24000),
      spec.offsetBytes || payload.offsetBytes || 0
    );
  }

  return await readText(
    config,
    spec.path,
    spec.maxChars || Math.min(perFileChars, remainingChars),
    spec.offsetChars || payload.offsetChars || 0
  );
}

async function readBulk(config, payload) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");

  const requested = uniqueSpecs(payload.paths || []);

  const maxFiles = clampNumber(payload.maxFiles, DEFAULT_MAX_FILES, 1, HARD_MAX_FILES);
  const totalMaxChars = clampNumber(payload.totalMaxChars, DEFAULT_TOTAL_MAX_CHARS, 1000, HARD_TOTAL_MAX_CHARS);
  const fileMaxChars = clampNumber(payload.maxChars, DEFAULT_FILE_MAX_CHARS, 500, HARD_FILE_MAX_CHARS);

  const selected = requested.slice(0, maxFiles);
  const skipped = requested.slice(maxFiles);

  const files = {};
  const metadata = {};
  const order = [];

  let usedChars = 0;
  let stoppedBecause = "";

  for (const spec of selected) {
    const one = spec.path;
    order.push(one);

    const remaining = Math.max(0, totalMaxChars - usedChars);

    if (remaining <= 0) {
      files[one] = {
        ok: false,
        error: "bulk_total_limit_reached",
        skipped: true
      };

      metadata[one] = {
        skipped: true,
        reason: "bulk_total_limit_reached"
      };

      stoppedBecause = "totalMaxChars";
      continue;
    }

    try {
      const got = await readOne(config, spec, fileMaxChars, remaining, payload);
      const returnedSize = got.returnedChars || got.returnedBytes || String(got.content || got.content64 || "").length;

      usedChars += Math.min(returnedSize, remaining);

      files[one] = {
        ok: true,
        path: one,
        mode: spec.mode || "text",
        content: got.content,
        content64: got.content64,
        truncated: got.truncated,
        encoding: got.encoding,
        offsetChars: got.offsetChars,
        nextOffsetChars: got.nextOffsetChars,
        offsetBytes: got.offsetBytes,
        nextOffsetBytes: got.nextOffsetBytes
      };

      metadata[one] = fileSizeMeta(got);

      if (got.truncated && !stoppedBecause) {
        stoppedBecause = "one_or_more_files_truncated";
      }
    } catch (e) {
      files[one] = {
        ok: false,
        error: e.message
      };

      metadata[one] = {
        ok: false,
        error: e.message
      };
    }
  }

  if (skipped.length && !stoppedBecause) {
    stoppedBecause = "maxFiles";
  }

  return {
    ok: true,
    action: "bulk",
    root: config.root,
    requestedCount: requested.length,
    returnedCount: selected.length,
    skippedCount: skipped.length,
    skippedPaths: skipped.map(x => x.path),
    usedChars,
    maxFiles,
    totalMaxChars,
    fileMaxChars,
    partial: !!(skipped.length || stoppedBecause),
    stoppedBecause: stoppedBecause || null,
    message: skipped.length || stoppedBecause
      ? "Response was capped. Try getting fewer files at a time or use chunked read offsets."
      : "Bulk read completed.",
    guidance: guidanceText({
      maxFiles,
      totalMaxChars,
      fileMaxChars,
      stoppedBecause
    }),
    order,
    metadata,
    files
  };
}

module.exports = {
  readBulk,
  uniqueSpecs
};
