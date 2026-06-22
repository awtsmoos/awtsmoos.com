// B"H
const { makeSession, getSession, listSessions, closeSession, publicSession } = require("./sessions.js");
const { forwardChunk, forwardPlaylist } = require("./forward.js");
const { addSegment, playlist } = require("./hls.js");
const ACTIONS = Object.freeze({ streamingSessionStart:true, streamingChunkPush:true, streamingHlsSegmentPush:true, streamingHlsPlaylist:true, streamingSessionStop:true, streamingSessionStatus:true, streamingSessionList:true });
async function handleStreaming(payload = {}) {
  const action = payload.action || "streamingSessionStatus";
  if (action === "streamingSessionStart") return start(payload);
  if (action === "streamingChunkPush") return push(payload);
  if (action === "streamingHlsSegmentPush") return hlsSegment(payload);
  if (action === "streamingHlsPlaylist") return hlsPlaylist(payload);
  if (action === "streamingSessionStop") return stop(payload);
  if (action === "streamingSessionList") return list();
  return status(payload);
}
function start(payload) { const session = makeSession(payload); return { ok:true, action:"streamingSessionStart", session:publicSession(session), guidance:"Push muxed segment bytes with streamingHlsSegmentPush or generic bytes with streamingChunkPush." }; }
async function push(payload) {
  const session = requireOpen(payload.sessionId); if (session.error) return session.error;
  const chunk = chunkBuffer(payload); session.counters.chunks += 1; session.counters.bytes += chunk.length; session.updatedAt = Date.now();
  try { const forwarded = await forwardChunk(session, chunk, payload); if (forwarded.forwarded) session.counters.forwarded += 1; return { ok:true, action:"streamingChunkPush", bytes:chunk.length, forwarded, session:publicSession(session) }; }
  catch (e) { return failSession(session, e); }
}
async function hlsSegment(payload) {
  const session = requireOpen(payload.sessionId); if (session.error) return session.error;
  const chunk = chunkBuffer(payload); const segment = addSegment(session, { ...payload, bytes:chunk.length });
  session.counters.hlsSegments += 1; session.counters.hlsBytes += chunk.length; session.counters.chunks += 1; session.counters.bytes += chunk.length; session.updatedAt = Date.now();
  try { const forwarded = await forwardChunk(session, chunk, { ...payload, name:segment.name, contentType:payload.contentType || "video/mp2t" }); if (forwarded.forwarded) session.counters.forwarded += 1; return { ok:true, action:"streamingHlsSegmentPush", segment, bytes:chunk.length, forwarded, playlist:playlist(session), session:publicSession(session) }; }
  catch (e) { return failSession(session, e); }
}
async function hlsPlaylist(payload) {
  const session = getSession(payload.sessionId); if (!session) return { ok:false, status:404, error:"streaming_session_not_found" };
  const text = playlist(session, payload); const forwarded = payload.forward ? await forwardPlaylist(session, text, payload) : { forwarded:false, reason:"not_requested" };
  return { ok:true, action:"streamingHlsPlaylist", playlist:text, forwarded, session:publicSession(session) };
}
function stop(payload) { const session = closeSession(payload.sessionId); if (!session) return { ok:false, status:404, error:"streaming_session_not_found" }; return { ok:true, action:"streamingSessionStop", playlist:playlist(session, { endList:true }), session:publicSession(session) }; }
function status(payload) { const session = payload.sessionId ? getSession(payload.sessionId) : null; return { ok:true, action:"streamingSessionStatus", session:publicSession(session), sessions:payload.sessionId ? undefined : listSessions() }; }
function list() { return { ok:true, action:"streamingSessionList", sessions:listSessions() }; }
function requireOpen(sessionId) { const session = getSession(sessionId); if (!session) return { error:{ ok:false, status:404, error:"streaming_session_not_found" } }; if (session.status !== "open") return { error:{ ok:false, status:409, error:"streaming_session_closed", session:publicSession(session) } }; return session; }
function failSession(session, e) { session.counters.failed += 1; session.lastError = e.message; return { ok:false, status:502, error:e.message, session:publicSession(session) }; }
function chunkBuffer(payload) { if (payload.chunk64) return Buffer.from(payload.chunk64, "base64"); if (payload.bytes64) return Buffer.from(payload.bytes64, "base64"); if (payload.chunk) return Buffer.from(String(payload.chunk)); return Buffer.alloc(0); }
module.exports = { ACTIONS, handleStreaming };
