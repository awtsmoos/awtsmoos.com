// B"H
const fsp = require("fs/promises");
const { safePath, assertNotSecret } = require("./pathGuard.js");

/**
 * B"H
 * Validates JSON and returns the wound without throwing it into the caller.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Validation result.
 */
async function jsonValidate(config, payload = {}) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  assertNotSecret(config, full);

  const text = await fsp.readFile(full, "utf8");

  try {
    const value = JSON.parse(text);
    return {
      ok: true,
      action: "jsonValidate",
      path: p,
      absolutePath: full,
      valid: true,
      type: Array.isArray(value) ? "array" : typeof value,
      keys: value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value).slice(0, 100) : []
    };
  } catch (e) {
    return {
      ok: false,
      action: "jsonValidate",
      path: p,
      absolutePath: full,
      valid: false,
      error: e.message
    };
  }
}

/**
 * B"H
 * Formats JSON, optionally writing the completed vessel back to disk.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload.
 * @returns {Promise<object>} Format result.
 */
async function jsonFormat(config, payload = {}) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  assertNotSecret(config, full);

  const text = await fsp.readFile(full, "utf8");
  const indent = Math.max(0, Math.min(Number(payload.indent || 2), 8));
  const value = JSON.parse(text);
  const formatted = JSON.stringify(value, null, indent) + "\n";
  const changed = formatted !== text;

  if (payload.write === true) {
    if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
    await fsp.writeFile(full, formatted, "utf8");
  }

  return {
    ok: true,
    action: "jsonFormat",
    path: p,
    absolutePath: full,
    changed,
    wrote: payload.write === true,
    beforeChars: text.length,
    afterChars: formatted.length,
    content: payload.write === true ? "" : formatted.slice(0, Number(payload.maxChars || 12000))
  };
}

module.exports = { jsonValidate, jsonFormat };
