// B"H
const crypto = require("crypto");

/**
 * B"H
 * Finds the closing brace paired with an opening brace. The scan walks through
 * quoted chambers carefully, so a brace inside a string does not impersonate a
 * gate of the code palace.
 *
 * @param {string} text Source code.
 * @param {number} open Offset of the opening brace.
 * @returns {number} Closing brace offset, or -1.
 */
function findBrace(text, open) {
  let depth = 0;
  let quote = null;
  let esc = false;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

/**
 * B"H
 * Converts a character offset into a line/column marker for human eyes.
 *
 * @param {string} text Source code.
 * @param {number} index Character offset.
 * @returns {{line:number,column:number}} One-based line and zero-based column.
 */
function lineCol(text, index) {
  const before = text.slice(0, Math.max(0, index)).split(/\r?\n/);
  return { line: before.length, column: before[before.length - 1].length };
}

/**
 * B"H
 * Creates a short hash, a seal on the body so the editor refuses stale vessels.
 *
 * @param {string} value Text to seal.
 * @returns {string} Twelve-character SHA-256 prefix.
 */
function shortHash(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex").slice(0, 12);
}

module.exports = { findBrace, lineCol, shortHash };
