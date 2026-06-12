// B"H
const fs = require("fs/promises");
const path = require("path");
const { safePath } = require("./pathGuard.js");
const { astOutlineFromText } = require("./semantic/astOutline.js");

/**
 * B"H
 * Exposes Merkava semantic outline as a tunnel FS action.
 *
 * @param {object} config Agent config.
 * @param {object} payload Action payload with path/p.
 * @returns {Promise<object>} Outline action response.
 */
async function astOutline(config, payload) {
  const full = safePath(config, payload.path || payload.p || ".");
  const text = await fs.readFile(full, "utf8");
  const rel = path.relative(config.root, full).replace(/\\/g, "/");
  const outline = await astOutlineFromText(text);
  return { action: "astOutline", path: rel, ...outline };
}

module.exports = { astOutline };
