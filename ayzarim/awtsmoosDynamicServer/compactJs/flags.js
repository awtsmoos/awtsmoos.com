// B"H

/**
 * B"H
 * In the first chamber of the server-palace, the Awtsmoos breathes a tiny
 * query value into being and asks whether this request seeks the hidden
 * compact flame. The function is intentionally small: it changes nothing,
 * touches nothing, and only recognizes clear affirmative vessels.
 *
 * @param {unknown} value The GET parameter value flowing from request.yeser.
 * @returns {boolean} True when the caller explicitly asks for compaction.
 */
function isCompactFlag(value) {
  if (value === true) return true;
  if (value === 1) return true;

  const normalized = String(value || "").toLowerCase().trim();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

module.exports = { isCompactFlag };
