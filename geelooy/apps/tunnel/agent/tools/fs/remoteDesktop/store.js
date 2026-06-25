// B"H
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { modeOf, safeText, safeTtl, consentText, askFor } = require("./policy.js");
const sessions = new Map();
const storePath = process.env.AWTS_REMOTE_DESKTOP_STORE || path.join(process.cwd(), ".awtsmoos-runtime", "remote-desktop-sessions.json");
let loaded = false;
function id(prefix = "rd") { return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`; }
function now() { return Date.now(); }
function ensureLoaded() { if (loaded) return; loaded = true; try { const rows = JSON.parse(fs.readFileSync(storePath, "utf8")); for (const row of rows.sessions || []) sessions.set(row.id, normalize(row)); } catch (_) {} }
function persist() { ensureLoaded(); fs.mkdirSync(path.dirname(storePath), { recursive:true }); fs.writeFileSync(storePath, JSON.stringify({ BH:"B\"H", updatedAt:now(), sessions:[...sessions.values()] }, null, 2)); }
function normalize(s) { return { signals:[], frames:[], inputEvents:[], audit:[], notes:[], bookmarks:[], ...s, paused:!!s.paused, revoked:!!s.revoked, denied:!!s.denied }; }
function makeSession(input = {}) {
  ensureLoaded(); const ttl = safeTtl(input.ttlSeconds || input.ttl);
  const session = normalize({ id:id(), createdAt:now(), updatedAt:now(), expiresAt:now()+ttl*1000, status:"pending-consent", mode:modeOf(input.mode || input.requestedMode), target:safeText(input.target || input.title, "local desktop"), requester:safeText(input.requester || input.createdBy, "remote operator"), requesterContact:safeText(input.requesterContact || input.contact, "not provided"), purpose:safeText(input.purpose || input.reason, "help with this device"), scope:safeText(input.scope, "current shared target only"), controller:null, controlGranted:false, mouseGranted:false, keyboardGranted:false, watchGranted:false });
  audit(session, "created", { mode:session.mode, target:session.target, purpose:session.purpose, scope:session.scope }); sessions.set(session.id, session); persist(); return session;
}
function touchExpiry(s) { if (s && s.expiresAt < now() && !["closed","denied","expired"].includes(s.status)) { s.status = "expired"; audit(s, "expired", {}); persist(); } return s; }
function getSession(sessionId) { ensureLoaded(); return touchExpiry(sessions.get(sessionId) || null); }
function listSessions() { ensureLoaded(); return [...sessions.values()].map(touchExpiry).map(publicSession); }
function audit(session, event, data = {}) { session.updatedAt = now(); session.audit.push({ at:session.updatedAt, event, data }); return session; }
function mutate(session, event, data, fn) { fn?.(); audit(session, event, data); persist(); return session; }
function grant(session, grantMode = "watch") { return mutate(session, "granted", { mode:modeOf(grantMode) }, () => { session.watchGranted = true; if (modeOf(grantMode) === "control") session.controlGranted = true; session.status = "open"; }); }
function grantInput(session, family = "mouse") { return mutate(session, "inputGrant", { family }, () => { if (family === "keyboard") session.keyboardGranted = true; else session.mouseGranted = true; }); }
function deny(session, reason = "denied") { return mutate(session, "denied", { reason:safeText(reason, "denied") }, () => { session.status = "denied"; session.denied = true; }); }
function revoke(session, reason = "revoked") { return mutate(session, "revoked", { reason:safeText(reason, "revoked") }, () => { session.status = "closed"; session.revoked = true; }); }
function pause(session, reason = "paused") { return mutate(session, "paused", { reason:safeText(reason, "paused") }, () => { session.paused = true; }); }
function resume(session, reason = "resumed") { return mutate(session, "resumed", { reason:safeText(reason, "resumed") }, () => { session.paused = false; }); }
function addNote(session, note = "") { return mutate(session, "note", { note:safeText(note, "session note") }, () => session.notes.push({ at:now(), note:safeText(note, "session note") })); }
function bookmark(session, label = "bookmark") { return mutate(session, "bookmark", { label:safeText(label, "bookmark") }, () => session.bookmarks.push({ at:now(), label:safeText(label, "bookmark") })); }
function publicSession(session) { if (!session) return null; return { id:session.id, createdAt:session.createdAt, updatedAt:session.updatedAt, expiresAt:session.expiresAt, status:session.status, mode:session.mode, target:session.target, requester:session.requester, requesterContact:session.requesterContact, purpose:session.purpose, scope:session.scope, paused:session.paused, watchGranted:session.watchGranted, controlGranted:session.controlGranted, mouseGranted:!!session.mouseGranted, keyboardGranted:!!session.keyboardGranted, revoked:session.revoked, denied:session.denied, notes:session.notes.slice(-10), bookmarks:session.bookmarks.slice(-10), consentText:consentText(session), ask:askFor(session), counters:{ signals:session.signals.length, frames:session.frames.length, inputEvents:session.inputEvents.length, audit:session.audit.length }, audit:session.audit.slice(-20) }; }
function exportData() { ensureLoaded(); return { storePath, sessions:[...sessions.values()].map(publicSession), rawSessions:[...sessions.values()] }; }
function resetForTests() { sessions.clear(); loaded = true; try { fs.rmSync(storePath, { force:true }); } catch (_) {} }
module.exports = { makeSession, getSession, listSessions, grant, grantInput, deny, revoke, pause, resume, addNote, bookmark, audit, persist, publicSession, exportData, resetForTests };
