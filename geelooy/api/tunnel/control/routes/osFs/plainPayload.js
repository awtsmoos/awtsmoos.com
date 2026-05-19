// B"H

/**
 * B"H
 * Chapter 1: The scribe stood before the tunnel river, where every plain
 * character carried a spark of the Awtsmoos into the machinery. This module
 * receives ordinary UTF-8 query text before the stronger base64 vessels are
 * needed, so ChatGPT, local panels, and virtual OS callers can speak simply.
 *
 * @param {unknown} value Raw query value, array, JSON string, or newline text.
 * @returns {Array<string|object>} Normalized list of path-like vessels.
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
 * Converts many possible GET-friendly shapes into write entries. The plain
 * speech comes as JSON object, JSON array, or small line protocol:
 * path<TAB>content. Larger bodies may still use writes64.
 *
 * @param {object} payload Tunnel payload.
 * @returns {Array<{path:string,content:string,expectedSha256?:string}>} Writes.
 */
function parsePlainWrites(payload = {}) {
  if (Array.isArray(payload.writes)) return payload.writes;
  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files).map(([path, content]) => ({ path, content: String(content ?? "") }));
  }

  const raw = payload.writes || payload.files;
  if (!raw || typeof raw !== "string") return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).map(([path, content]) => ({ path, content: String(content ?? "") }));
    }
  } catch (_) {}

  return raw.split(/\r?\n/).map((line) => {
    const tab = line.indexOf("\t");
    if (tab < 1) return null;
    return { path: line.slice(0, tab).trim(), content: line.slice(tab + 1) };
  }).filter((x) => x && x.path);
}

module.exports = { parsePlainList, parsePlainWrites };
