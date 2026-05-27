
// B"H
const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

function number(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function requestTooLargeGuidance(kind) {
  return [
    "The platform or proxy rejected this as too large for one HTTP/tool call.",
    kind === "write"
      ? "Use POST JSON or split into smaller files."
      : "Use offsets or smaller bulk groups if the model/proxy cannot carry the response.",
    "The tunnel agent itself is not applying an artificial upper cap here."
  ].join(" ");
}

async function readText(config, p, maxChars = 12000, offsetChars = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const offset = number(offsetChars, 0);
  const cap = number(maxChars, 12000);
  const buf = await fsp.readFile(full);
  const text = buf.toString("utf8");
  const end = cap ? Math.min(text.length, offset + cap) : text.length;
  const content = text.slice(offset, end);

  return {
    content,
    encoding: "utf8",
    truncated: end < text.length,
    offsetChars: offset,
    returnedChars: content.length,
    totalChars: text.length,
    totalBytes: buf.length,
    nextOffsetChars: end < text.length ? end : null,
    maxChars: cap
  };
}

async function readBytesBase64(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  assertNotSecret(config, full);

  const offset = number(offsetBytes, 0);
  const cap = number(maxBytes, 24000);
  const buf = await fsp.readFile(full);
  const end = cap ? Math.min(buf.length, offset + cap) : buf.length;
  const slice = buf.slice(offset, end);

  return {
    content64: slice.toString("base64"),
    encoding: "base64",
    truncated: end < buf.length,
    offsetBytes: offset,
    returnedBytes: slice.length,
    totalBytes: buf.length,
    nextOffsetBytes: end < buf.length ? end : null,
    maxBytes: cap
  };
}

async function readTextFromBytes(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as UTF-8 text: " + ext);

  const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
  return {
    content: Buffer.from(got.content64, "base64").toString("utf8"),
    encoding: "utf8-bytes",
    truncated: got.truncated,
    offsetBytes: got.offsetBytes,
    returnedBytes: got.returnedBytes,
    totalBytes: got.totalBytes,
    nextOffsetBytes: got.nextOffsetBytes,
    maxBytes: got.maxBytes
  };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");

  const full = safePath(config, p);
  const text = String(content ?? "");
  assertNotSecret(config, full);

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, text, "utf8");

  return {
    ok: true,
    path: p,
    absolutePath: full,
    bytes: Buffer.byteLength(text, "utf8")
  };
}

function normalizeWrites(payload) {
  if (Array.isArray(payload.writes)) {
    return payload.writes
      .filter(x => x && (x.path || x.p))
      .map(x => ({ path: String(x.path || x.p), content: String(x.content ?? "") }));
  }

  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files)
      .map(([filePath, content]) => ({ path: filePath, content: String(content ?? "") }));
  }

  if (payload.path || payload.p) {
    return [{ path: String(payload.path || payload.p), content: String(payload.content ?? "") }];
  }

  return [];
}

module.exports = {
  readText,
  readBytesBase64,
  readTextFromBytes,
  writeText,
  normalizeWrites,
  number,
  requestTooLargeGuidance
};
