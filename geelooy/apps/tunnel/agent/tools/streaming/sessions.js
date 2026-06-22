// B"H
const crypto = require("crypto");
const sessions = new Map();
function makeSession(input = {}) {
  const id = input.sessionId || `stream-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
  const session = { id, createdAt:Date.now(), updatedAt:Date.now(), status:"open", connector:input.connector || "custom", mode:input.mode || "direct", ingest:input.ingest || {}, hls:{ sequence:0, targetDuration:Number(input.targetDuration || 2), maxSegments:Number(input.maxSegments || 6), segments:[] }, counters:{ chunks:0, bytes:0, forwarded:0, failed:0, hlsSegments:0, hlsBytes:0 }, lastError:null };
  sessions.set(id, session); return session;
}
function getSession(id) { return sessions.get(id) || null; }
function listSessions() { return [...sessions.values()].map(publicSession); }
function closeSession(id) { const s = getSession(id); if (!s) return null; s.status = "closed"; s.updatedAt = Date.now(); return s; }
function publicSession(session) { return session ? { ...session, ingest:redactIngest(session.ingest) } : null; }
function redactIngest(ingest = {}) { return { ...ingest, streamKey:ingest.streamKey ? "***" : undefined, url:ingest.url ? redactUrl(ingest.url) : undefined, playlistUrl:ingest.playlistUrl ? redactUrl(ingest.playlistUrl) : undefined, segmentBaseUrl:ingest.segmentBaseUrl ? redactUrl(ingest.segmentBaseUrl) : undefined }; }
function redactUrl(url) { try { const u = new URL(url); if (u.password) u.password = "***"; if (u.searchParams.has("key")) u.searchParams.set("key", "***"); return u.toString(); } catch { return "configured"; } }
module.exports = { makeSession, getSession, listSessions, closeSession, publicSession };
