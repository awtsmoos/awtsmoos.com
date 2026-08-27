
// B"H

/**
 * B"H
 * Makes a value safe for short UI display.
 *
 * @param {unknown} value Any value.
 * @param {string} fallback Fallback text.
 * @returns {string} Display string.
 */
export function safeText(value, fallback = "unknown") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

/**
 * B"H
 * Turns camelCase or snake-case into a title.
 *
 * @param {string} value Raw text.
 * @returns {string} Human title.
 */
export function titleize(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, letter => letter.toUpperCase());
}

/**
 * B"H
 * Masks an API key.
 *
 * @param {string} secret Raw key.
 * @returns {string} Masked key.
 */
export function maskSecret(secret) {
  const s = String(secret || "");
  if (s.length < 12) return "••••••";
  return `${s.slice(0, 6)}••••••••••••${s.slice(-4)}`;
}
