// B"H
const crypto = require("crypto");
const { permissionProfile } = require("./profile.js");
const { riskAssessment } = require("./risk.js");
/** B"H — Chapter 936: Consent became a hash-sealed scroll. */
function permissionContract(session) {
  const body = { sessionId:session.id, requester:session.requester, contact:session.requesterContact, target:session.target, purpose:session.purpose, scope:session.scope, mode:session.mode, expiresAt:session.expiresAt, profile:permissionProfile(session), risk:riskAssessment(session), blocked:["clipboard", "file-transfer", "raw-shell", "credential-reveal", "silent-capture"] };
  return { ...body, hash:hash(body), copyText:copyText(body) };
}
function sessionSummary(session) { return { id:session.id, status:session.status, paused:!!session.paused, grants:{ watch:!!session.watchGranted, control:!!session.controlGranted, mouse:!!session.mouseGranted, keyboard:!!session.keyboardGranted }, countdownMs:Math.max(0, Number(session.expiresAt || 0) - Date.now()), auditTrail:(session.audit || []).slice(-30).map(e => `${new Date(e.at).toISOString()} ${e.event}`), frameCount:session.frames?.length || 0, signalCount:session.signals?.length || 0, inputCount:session.inputEvents?.length || 0 } }
function signalSummary(session) { return { sessionId:session.id, signals:(session.signals || []).slice(-50).map(s => ({ at:s.at, type:s.type, fingerprint:s.payload?.fingerprint || s.payload?.label || "" })), lastHeartbeat:[...(session.signals || [])].reverse().find(s => s.type === "heartbeat") || null } }
function hash(body) { return crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex"); }
function copyText(body) { return [`Remote Desktop Permission Contract`, `Requester: ${body.requester}`, `Target: ${body.target}`, `Purpose: ${body.purpose}`, `Scope: ${body.scope}`, `Mode: ${body.mode}`, `Expires: ${new Date(body.expiresAt).toISOString()}`].join("\n"); }
module.exports = { permissionContract, sessionSummary, signalSummary };
