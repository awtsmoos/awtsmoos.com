// B"H

/**
 * B"H
 * Chapter 1: The local agent heard ordinary letters knocking at the gate.
 * The Awtsmoos hid no spark from commas, newlines, JSON arrays, or objects;
 * each one became a precise path-vessel before any base64 armor was needed.
 *
 * @param {unknown} value Raw GET-friendly text or structured value.
 * @returns {Array<string|object>} Normalized list.
 */
function parsePlainList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value !== "string") return [];

  const text = value.trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return Object.keys(parsed);
  } catch (_) {}

  return text.split(/\r?\n|,/).map((x) => x.trim()).filter(Boolean);
}

/**
 * B"H
 * Reads the first non-empty payload field from names that different providers
 * already use, so ChatGPT, code-tab tunnels, and virtual OS callers share one
 * breath of plain UTF-8 request speech.
 *
 * @param {object} payload Incoming action payload.
 * @param {Array<string>} keys Candidate keys.
 * @returns {unknown} First present value.
 */
function firstPayloadValue(payload = {}, keys = []) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") return payload[key];
  }
  return undefined;
}

module.exports = { parsePlainList, firstPayloadValue };
