
// B"H

/**
 * B"H
 * Parses JSON without throwing.
 *
 * @param {string|Buffer} input Raw JSON text or buffer.
 * @param {unknown} fallback Returned when parsing fails.
 * @returns {unknown} Parsed JSON or fallback.
 */
function safeJson(input, fallback = null) {
  if (input === undefined || input === null) return fallback;

  try {
    const text = Buffer.isBuffer(input) ? input.toString("utf8") : String(input);
    if (!text.trim()) return fallback;
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

module.exports = { safeJson };
