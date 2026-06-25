// B"H
const crypto = require("crypto");
const { modeOf, safeTtl, consentText } = require("./policy.js");
const sessions = new Map();
function id(prefix = "rd") { return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`; }
function now() { return Date.now(); }
function makeSession(input = {}) {
  const mode = modeOf(input.mode || input.requestedMode);
  const session = { id:id(), createdAt:now(), updatedAt:now(), expiresAt:now() + safeTtl(input.ttlSeconds) * 1000, status:"pending-consent", mode, target:input.target || input.title || "local desktop", requester:input.requester || input.createdBy || "remote operator", controlGranted:false, watchGranted:false, revoked:false, signals:[], frames:[], inputEvents:[], audit:[] };
  audit(session, "created", { mode:session.mode, target:session.target });
  sessions.set(session.id, session); return session;
}
function getSession(sessionId) { const s = sessions.get(sessionId) || null; if (s && s.expiresAt < now() && s.status !== "closed") { s.status = "expired"; audit(s, "expired", {}); } return s; }
function listSessions() { return [...sessions.values()].map(publicSession); }
function audit(session, event, data = {}) { session.updatedAt = now(); session.audit.push({ at:session.updatedAt, event, data }); return session; }
function grant(session, grantMode = "watch") { const mode = modeOf(grantMode); session.watchGranted = true; if (mode === "control") session.controlGranted = true; session.status = "open"; audit(session, "granted", { mode }); return session; }
function revoke(session, reason = "revoked") { session.status = "closed"; session.revoked = true; audit(session, "revoked", { reason }); return session; }
function publicSession(session) { if (!session) return null; return { id:session.id, createdAt:session.createdAt, updatedAt:session.updatedAt, expiresAt:session.expiresAt, status:session.status, mode:session.mode, target:session.target, requester:session.requester, watchGranted:session.watchGranted, controlGranted:session.controlGranted, revoked:session.revoked, consentText:consentText(session), counters:{ signals:session.signals.length, frames:session.frames.length, inputEvents:session.inputEvents.length, audit:session.audit.length }, audit:session.audit.slice(-20) }; }
function resetForTests() { sessions.clear(); }
module.exports = { makeSession, getSession, listSessions, grant, revoke, audit, publicSession, resetForTests };
