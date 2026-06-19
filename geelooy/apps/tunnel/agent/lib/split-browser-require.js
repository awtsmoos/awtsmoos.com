// B"H
const path = require("path");

/**
 * B"H
 * Chapter 482: One relay library learned two maps.
 *
 * In the source palace, split-browser files live under `geelooy/ai`. In the
 * installed palace, the manifest places them beside `lib` under the agent root.
 * This resolver tests both doors in order and returns the first living module,
 * so local API tests and installed tunnels breathe through the same code.
 *
 * @param {string} file Split-browser file path beneath `ai/relay/split-browser`.
 * @returns {*} Required CommonJS module.
 */
function requireSplitBrowser(file) {
  const clean = String(file || "").replace(/^[/\\]+/, "");
  const candidates = [
    path.join(__dirname, "..", "ai", "relay", "split-browser", clean),
    path.join(__dirname, "..", "..", "..", "..", "ai", "relay", "split-browser", clean)
  ];
  const errors = [];
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== "MODULE_NOT_FOUND") throw error;
      errors.push(candidate);
    }
  }
  throw new Error("split_browser_module_missing: " + clean + " searched " + errors.join(", "));
}

module.exports = { requireSplitBrowser };
