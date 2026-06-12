// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

/**
 * B"H
 * Reads a small JSON vessel. Broken JSON becomes the fallback, not a crash,
 * because the Awtsmoos can rebuild the store from current browser state.
 */
async function readJson(file, fallback = {}) {
  try { return JSON.parse(await fsp.readFile(file, "utf8")); }
  catch { return fallback; }
}

async function writeJson(file, value) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = file + ".tmp";
  await fsp.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
  await fsp.rename(tmp, file);
  return value;
}

function exists(file) { try { return fs.existsSync(file); } catch { return false; } }

module.exports = { readJson, writeJson, exists };
