
// B"H
const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

function number(value, fallback, min, max) {
  const n = Number(value);
  const good = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, good));
}

async function readText(config, p, maxChars = 12000, offsetChars = 0) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");

  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const text = await fsp.readFile(full, "utf8");
  const offset = number(offsetChars, 0, 0, text.length);
  const cap = number(maxChars, 12000, 500, 30000);
  const content = text.slice(offset, offset + cap);
  const next = offset + content.length;

  return {
    content,
    truncated: next < text.length,
    offsetChars: offset,
    nextOffsetChars: next < text.length ? next : null,
    returnedChars: content.length,
    totalChars: text.length
  };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");

  const full = safePath(config, p);
  assertNotSecret(config, full);

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content || "", "utf8");

  return {
    path: p,
    absolutePath: full,
    bytes: Buffer.byteLength(content || "")
  };
}

function normalizeWrites(payload) {
  if (Array.isArray(payload.writes)) {
    return payload.writes
      .filter(x => x && x.path)
      .map(x => ({ path: String(x.path), content: String(x.content || "") }));
  }

  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files)
      .map(([filePath, content]) => ({ path: filePath, content: String(content || "") }));
  }

  return [];
}

module.exports = { readText, writeText, normalizeWrites };
