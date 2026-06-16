// B"H
const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { normalizeWrites, normalizeWrite, parseMaybeJson, number, describeWritePayload } = require("./writePayload.js");

/**
 * B"H
 * Chapter 469: The gate grew lean. The parser moved aside so every action can
 * drink JSON, XML, maps, arrays, aliases, and nested carriers from one well.
 */
function boundedNumber(value, fallback) {
  return number(value, fallback);
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
  const full = guardedTextPath(config, p, "text");
  const offset = boundedNumber(offsetChars, 0);
  const cap = boundedNumber(maxChars, 12000);
  const buf = await fsp.readFile(full);
  const text = buf.toString("utf8");
  const end = cap ? Math.min(text.length, offset + cap) : text.length;
  const content = text.slice(offset, end);
  return textResult(content, text, buf, offset, end, cap);
}

async function readBytesBase64(config, p, maxBytes = 24000, offsetBytes = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const full = safePath(config, p);
  assertNotSecret(config, full);
  const offset = boundedNumber(offsetBytes, 0);
  const cap = boundedNumber(maxBytes, 24000);
  const buf = await fsp.readFile(full);
  const end = cap ? Math.min(buf.length, offset + cap) : buf.length;
  const slice = buf.slice(offset, end);
  return bytesResult(slice, buf, offset, end, cap);
}

async function readTextFromBytes(config, p, maxBytes = 24000, offsetBytes = 0) {
  guardedTextPath(config, p, "UTF-8 text");
  const got = await readBytesBase64(config, p, maxBytes, offsetBytes);
  return {
    content: Buffer.from(got.content64, "base64").toString("utf8"), encoding: "utf8-bytes",
    truncated: got.truncated, offsetBytes: got.offsetBytes, returnedBytes: got.returnedBytes,
    totalBytes: got.totalBytes, nextOffsetBytes: got.nextOffsetBytes, maxBytes: got.maxBytes
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
  return { ok: true, path: p, absolutePath: full, bytes: Buffer.byteLength(text, "utf8") };
}

function textResult(content, text, buf, offset, end, cap) {
  return {
    content, encoding: "utf8", truncated: end < text.length, offsetChars: offset,
    returnedChars: content.length, totalChars: text.length, totalBytes: buf.length,
    nextOffsetChars: end < text.length ? end : null, maxChars: cap
  };
}

function bytesResult(slice, buf, offset, end, cap) {
  return {
    content64: slice.toString("base64"), encoding: "base64", truncated: end < buf.length,
    offsetBytes: offset, returnedBytes: slice.length, totalBytes: buf.length,
    nextOffsetBytes: end < buf.length ? end : null, maxBytes: cap
  };
}

function guardedTextPath(config, p, label) {
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error(`Refusing binary file as ${label}: ${ext}`);
  return full;
}

module.exports = {
  readText, readBytesBase64, readTextFromBytes, writeText, normalizeWrites,
  normalizeWrite, parseMaybeJson, number: boundedNumber, requestTooLargeGuidance,
  describeWritePayload
};
