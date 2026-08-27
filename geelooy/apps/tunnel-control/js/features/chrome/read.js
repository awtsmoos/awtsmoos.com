
// B"H

/**
 * B"H
 * Reads a field value safely.
 *
 * @param {HTMLElement|null} node Field node.
 * @returns {string} Trimmed value.
 */
function read(node) {
  return node ? String(node.value || "").trim() : "";
}

/**
 * B"H
 * Writes a field value safely.
 *
 * @param {HTMLElement|null} node Field node.
 * @param {string} value Value to write.
 * @returns {boolean} True when written.
 */
export function writeField(node, value) {
  if (!node) return false;
  node.value = String(value ?? "");
  node.dispatchEvent(new Event("input", { bubbles: true }));
  node.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/**
 * B"H
 * Reads an integer with fallback.
 *
 * @param {HTMLElement|null} node Field node.
 * @param {number} fallback Default value.
 * @returns {number} Parsed number.
 */
function readInt(node, fallback) {
  const n = Number(read(node));
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * B"H
 * Reads the Chrome form.
 *
 * @param {object} fields Field map.
 * @returns {object} Plain values.
 */
export function readChromeForm(fields) {
  return {
    chromePath: read(fields.chromePath),
    port: readInt(fields.port, 9222),
    url: read(fields.url),
    selector: read(fields.selector),
    text: read(fields.text),
    waitTimeout: readInt(fields.waitTimeout, 10000),
    expression: read(fields.expression),
    scriptText: read(fields.script)
  };
}

/**
 * B"H
 * Parses the puppeteer-style JSON script if present.
 *
 * @param {string} scriptText Raw script text.
 * @returns {{ok:boolean, script?:any, error?:string}} Parse result.
 */
export function parseScript(scriptText) {
  if (!scriptText) {
    return { ok: true, script: [] };
  }

  try {
    const parsed = JSON.parse(scriptText);
    return { ok: true, script: parsed };
  } catch (e) {
    return {
      ok: false,
      error: "Invalid JSON in script box. Fix the JSON before running."
    };
  }
}
