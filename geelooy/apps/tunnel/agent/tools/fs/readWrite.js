
// B"H

const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

function clampNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function requestTooLargeGuidance(kind) {
  return [
    "The request or response was too large for one tool call.",
    "Try again, but split this file or change into way more submodules / smaller chunks.",
    kind === "write"
      ? "For large writes, use POST body when available, or bulkWrite fewer files at a time."
      : "For large reads, use maxFiles=3, maxChars=8000, totalMaxChars=24000, and offsetChars/offsetBytes for continuation.",
    "Do not send one massive generated file if it can be split into focused modules."
  ].join(" ");
}

async function readText(config, p, maxChars = 12000, offsetChars = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const cap = clampNumber(maxChars, 12000, 500, 30000);
  const offset = clampNumber(offsetChars, 0, 0, 5000000);

  const buf = await fsp.readFile(full);
  const text = buf.toString("utf8");

  const totalChars = text.length;
  const totalBytes = buf.length;
  const end = Math.min(totalChars, offset + cap);
  const content = text.slice(offset, end);

  return {
    content,
    encoding: "utf8",
    truncated: end < totalChars,
    offsetChars: offset,
    returnedChars: content.length,
    totalChars,
    totalBytes,
    nextOffsetChars: end < totalChars ? end : null,
    maxChars: cap
  };
}

async function readBytesBase64(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);

  assertNotSecret(config, full);

  const cap = clampNumber(maxBytes, 24000, 512, 120000);
  const offset = clampNumber(offsetBytes, 0, 0, 100000000);

  const buf = await fsp.readFile(full);
  const totalBytes = buf.length;
  const end = Math.min(totalBytes, offset + cap);
  const slice = buf.slice(offset, end);

  return {
    content64: slice.toString("base64"),
    encoding: "base64",
    truncated: end < totalBytes,
    offsetBytes: offset,
    returnedBytes: slice.length,
    totalBytes,
    nextOffsetBytes: end < totalBytes ? end : null,
    maxBytes: cap
  };
}

async function readTextFromBytes(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as UTF-8 text: " + ext);

  const cap = clampNumber(maxBytes, 24000, 512, 120000);
  const offset = clampNumber(offsetBytes, 0, 0, 100000000);

  const buf = await fsp.readFile(full);
  const totalBytes = buf.length;
  const end = Math.min(totalBytes, offset + cap);
  const content = buf.slice(offset, end).toString("utf8");

  return {
    content,
    encoding: "utf8-bytes",
    truncated: end < totalBytes,
    offsetBytes: offset,
    returnedBytes: end - offset,
    totalBytes,
    nextOffsetBytes: end < totalBytes ? end : null,
    maxBytes: cap
  };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");

  const full = safePath(config, p);
  const text = String(content || "");
  const bytes = Buffer.byteLength(text, "utf8");

  assertNotSecret(config, full);

  if (bytes > 350000) {
    return {
      ok: false,
      action: "write",
      error: "write_payload_too_large",
      bytes,
      maxRecommendedBytes: 350000,
      guidance: requestTooLargeGuidance("write")
    };
  }

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, text, "utf8");

  return {
    ok: true,
    path: p,
    absolutePath: full,
    bytes
  };
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findReplaceText(config, payload) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");

  const p = payload.path || ".";
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file for findReplace: " + ext);

  const before = await fsp.readFile(full, "utf8");
  const find = String(payload.find || "");
  const replace = String(payload.replace || "");

  if (!find) {
    return {
      ok: false,
      action: "findReplace",
      error: "missing_find_text"
    };
  }

  const flags = payload.replaceAll === false ? "" : "g";
  const pattern = payload.regex ? new RegExp(find, flags) : new RegExp(escapeRegex(find), flags);

  const matches = before.match(pattern) || [];
  const after = before.replace(pattern, replace);

  if (after !== before) await fsp.writeFile(full, after, "utf8");

  return {
    ok: true,
    action: "findReplace",
    path: p,
    absolutePath: full,
    changed: after !== before,
    replacements: matches.length,
    beforeChars: before.length,
    afterChars: after.length,
    deltaChars: after.length - before.length
  };
}

function normalizeWrites(payload) {
  if (Array.isArray(payload.writes)) {
    return payload.writes
      .filter(x => x && x.path)
      .map(x => ({ path: x.path, content: String(x.content || "") }));
  }

  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files).map(([filePath, content]) => ({
      path: filePath,
      content: String(content || "")
    }));
  }

  return [];
}

module.exports = {
  readText,
  readBytesBase64,
  readTextFromBytes,
  writeText,
  findReplaceText,
  normalizeWrites,
  clampNumber,
  requestTooLargeGuidance
};
