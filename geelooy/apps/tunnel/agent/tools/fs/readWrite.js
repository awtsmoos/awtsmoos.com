// B"H
const fsp = require("fs/promises");
const path = require("path");
const { BIN } = require("./constants.js");
const { safePath, assertNotSecret } = require("./pathGuard.js");

async function readText(config, p, maxChars = 12000) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const text = await fsp.readFile(full, "utf8");
  const truncated = text.length > maxChars;

  return {
    content: truncated ? text.slice(0, maxChars) : text,
    truncated
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
  writeText,
  normalizeWrites
};