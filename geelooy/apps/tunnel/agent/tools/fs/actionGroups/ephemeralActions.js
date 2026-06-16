// B"H

function baseUrl(payload = {}) {
  return String(payload.controlBaseUrl || "https://awtsmoos.com/api/tunnel/control/fs/auto").replace(/\/fs\/[^/]+$/, "");
}
function cleanId(value = "") {
  return String(value || "").replace(/^awtsmoos:\/\/turn-result\//, "");
}
function query(params = {}) {
  return Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "").map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join("&");
}

/**
 * B"H
 * Chapter: The AI received handles instead of scrolls.
 */
function buildEphemeralActions(ctx) {
  const { payload } = ctx;
  const id = cleanId(payload.resultRef || payload.resultId || payload.id || "");
  return {
    async ephemeralList() { return { ok: true, action: "ephemeralList", url: `${baseUrl(payload)}/ephemeral/list` }; },
    async ephemeralMeta() { return { ok: true, action: "ephemeralMeta", resultId: id, url: `${baseUrl(payload)}/ephemeral/${encodeURIComponent(id)}` }; },
    async ephemeralPage() { return { ok: true, action: "ephemeralPage", resultId: id, url: `${baseUrl(payload)}/ephemeral/${encodeURIComponent(id)}/page?${query({ offsetBytes: payload.offsetBytes || payload.offset || 0, maxBytes: payload.maxBytes || payload.pageBytes || 262144 })}` }; },
    async ephemeralSearch() { return { ok: true, action: "ephemeralSearch", resultId: id, url: `${baseUrl(payload)}/ephemeral/${encodeURIComponent(id)}/search?${query({ query: payload.query || payload.find || payload.q || "", cursor: payload.cursor || 0, limit: payload.limit || 50 })}` }; },
    async ephemeralDelete() { return { ok: true, action: "ephemeralDelete", resultId: id, url: `${baseUrl(payload)}/ephemeral/${encodeURIComponent(id)}/delete` }; }
  };
}

module.exports = { buildEphemeralActions, cleanId };
