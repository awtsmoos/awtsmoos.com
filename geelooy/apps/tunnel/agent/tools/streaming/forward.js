// B"H
async function forwardChunk(session, chunk, input = {}) {
  const target = input.url || segmentUrl(session, input) || session.ingest?.url;
  if (!target) return { forwarded:false, reason:"no_ingest_url" };
  const method = input.method || session.ingest?.method || "PUT";
  const headers = { "content-type":input.contentType || session.ingest?.contentType || "application/octet-stream", ...(input.headers || {}) };
  const res = await fetch(target, { method, headers, body:chunk });
  if (!res.ok) throw new Error(`stream_forward_failed_${res.status}`);
  return { forwarded:true, status:res.status, url:redact(target) };
}
async function forwardPlaylist(session, text, input = {}) {
  const target = input.url || session.ingest?.playlistUrl || session.ingest?.url;
  if (!target) return { forwarded:false, reason:"no_playlist_url" };
  const res = await fetch(target, { method:input.method || "PUT", headers:{ "content-type":"application/vnd.apple.mpegurl", ...(input.headers || {}) }, body:text });
  if (!res.ok) throw new Error(`playlist_forward_failed_${res.status}`);
  return { forwarded:true, status:res.status, url:redact(target) };
}
function segmentUrl(session, input = {}) {
  const base = input.segmentBaseUrl || session.ingest?.segmentBaseUrl;
  if (!base || !input.name) return null;
  return String(base).replace(/\/$/, "") + "/" + encodeURIComponent(input.name);
}
function redact(url) { try { const u = new URL(url); if (u.password) u.password = "***"; if (u.searchParams.has("key")) u.searchParams.set("key", "***"); return u.toString(); } catch { return "configured"; } }
module.exports = { forwardChunk, forwardPlaylist };
