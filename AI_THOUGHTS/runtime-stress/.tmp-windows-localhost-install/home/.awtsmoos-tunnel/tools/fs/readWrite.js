// B"H
const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { parseXmlWrites } = require("./xmlWrites.js");

/**
 * B"H
 * Chapter 392: JSON and XML became two doors into one honest write list.
 * The Awtsmoos receives GET JSON, direct objects, or XML vessels with CDATA
 * placeholders, then writes only complete files through the same guarded path.
 */
function number(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function requestTooLargeGuidance(kind) {
  return [
    "The platform or proxy rejected this as too large for one HTTP/tool call.",
    kind === "write" ? "Use POST JSON, XML placeholders, or split into smaller files." : "Use offsets or smaller bulk groups if the model/proxy cannot carry the response.",
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
  return { content, encoding: "utf8", truncated: end < text.length, offsetChars: offset, returnedChars: content.length, totalChars: text.length, totalBytes: buf.length, nextOffsetChars: end < text.length ? end : null, maxChars: cap };
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
  return { content64: slice.toString("base64"), encoding: "base64", truncated: end < buf.length, offsetBytes: offset, returnedBytes: slice.length, totalBytes: buf.length, nextOffsetBytes: end < buf.length ? end : null, maxBytes: cap };
}

async function readTextFromBytes(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error("Refusing binary file as UTF-8 text: " + ext);
  const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
  return { content: Buffer.from(got.content64, "base64").toString("utf8"), encoding: "utf8-bytes", truncated: got.truncated, offsetBytes: got.offsetBytes, returnedBytes: got.returnedBytes, totalBytes: got.totalBytes, nextOffsetBytes: got.nextOffsetBytes, maxBytes: got.maxBytes };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const full = safePath(config, p);
  const text = String(content ?? "");
  assertNotSecret(config, full);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, text, "utf8");
  return { ok: true, path: p, absolutePath: full, bytes: Buffer.byteLength(text, "utf8") };
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return value;
  try { return JSON.parse(text); } catch (_) { return value; }
}

function normalizeWrites(payload = {}) {
  const xmlWrites = parseXmlWrites(payload);
  if (xmlWrites.length) return xmlWrites;
  const writesValue = parseMaybeJson(payload.writes);
  const filesValue = parseMaybeJson(payload.files);
  if (Array.isArray(writesValue)) return normalizeArrayWrites(writesValue);
  if (filesValue && typeof filesValue === "object" && !Array.isArray(filesValue)) return Object.entries(filesValue).map(([filePath, content]) => ({ path: filePath, content: String(content ?? "") }));
  if (Array.isArray(filesValue)) return normalizeArrayWrites(filesValue);
  if (payload.path || payload.p) return [{ path: String(payload.path || payload.p), content: String(payload.content ?? payload.text ?? "") }];
  return [];
}

function normalizeArrayWrites(list) {
  return list.filter(x => x && (x.path || x.p)).map(x => ({ path: String(x.path || x.p), content: String(x.content ?? x.text ?? "") }));
}

module.exports = { readText, readBytesBase64, readTextFromBytes, writeText, normalizeWrites, normalizeArrayWrites, parseMaybeJson, number, requestTooLargeGuidance };
