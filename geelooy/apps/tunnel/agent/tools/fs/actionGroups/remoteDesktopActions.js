// B"H
const { makeSession, getSession, listSessions, grant, revoke, publicSession } = require("../remoteDesktop/store.js");
const { publicPolicy, modeOf } = require("../remoteDesktop/policy.js");
const { addSignal, pushFrame, inputEvent } = require("../remoteDesktop/signaling.js");
function session(payload) { return getSession(payload.sessionId || payload.id); }
function missing(action) { return { ok:false, status:404, action, error:"remote_desktop_session_not_found" }; }
function buildRemoteDesktopActions(ctx) {
  const payload = ctx.payload || {};
  return {
    async remoteDesktopPolicy() { return { ok:true, action:"remoteDesktopPolicy", policy:publicPolicy() }; },
    async remoteDesktopCreateSession() { const s = makeSession(payload); return { ok:true, action:"remoteDesktopCreateSession", session:publicSession(s), next:"Ask local user to grant watch or control." }; },
    async remoteDesktopConsentStatus() { const s = session(payload); return s ? { ok:true, action:"remoteDesktopConsentStatus", session:publicSession(s) } : missing("remoteDesktopConsentStatus"); },
    async remoteDesktopGrantConsent() { const s = session(payload); return s ? { ok:true, action:"remoteDesktopGrantConsent", session:publicSession(grant(s, modeOf(payload.grantMode || payload.mode))) } : missing("remoteDesktopGrantConsent"); },
    async remoteDesktopRevoke() { const s = session(payload); return s ? { ok:true, action:"remoteDesktopRevoke", session:publicSession(revoke(s, payload.reason || "requested")) } : missing("remoteDesktopRevoke"); },
    async remoteDesktopSessionList() { return { ok:true, action:"remoteDesktopSessionList", sessions:listSessions() }; },
    async remoteDesktopOffer() { const s = session(payload); return s ? addSignal(s, "offer", payload) : missing("remoteDesktopOffer"); },
    async remoteDesktopAnswer() { const s = session(payload); return s ? addSignal(s, "answer", payload) : missing("remoteDesktopAnswer"); },
    async remoteDesktopIceCandidate() { const s = session(payload); return s ? addSignal(s, "ice", payload) : missing("remoteDesktopIceCandidate"); },
    async remoteDesktopFramePush() { const s = session(payload); return s ? pushFrame(s, payload) : missing("remoteDesktopFramePush"); },
    async remoteDesktopInputEvent() { const s = session(payload); return s ? inputEvent(s, payload) : missing("remoteDesktopInputEvent"); },
    async remoteDesktopAuditLog() { const s = session(payload); return s ? { ok:true, action:"remoteDesktopAuditLog", session:publicSession(s), audit:s.audit.slice(-100) } : missing("remoteDesktopAuditLog"); }
  };
}
module.exports = { buildRemoteDesktopActions };
