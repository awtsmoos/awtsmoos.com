// B"H
const store = require("../remoteDesktop/store.js");
const { publicPolicy, modeOf, askFor } = require("../remoteDesktop/policy.js");
const { featureCatalog } = require("../remoteDesktop/features.js");
const future = require("../remoteDesktop/futureCatalog.js");
const universal = require("../remoteDesktop/universalVision.js");
const { permissionProfile } = require("../remoteDesktop/profile.js");
const { riskAssessment } = require("../remoteDesktop/risk.js");
const signal = require("../remoteDesktop/signaling.js");
const caps = require("../remoteDesktop/capabilities.js");
const capture = require("../remoteDesktop/capture.js");
const chrome = require("../../chrome/actions.js");
const helpers = require("../remoteDesktop/helpers.js");
const webrtc = require("../remoteDesktop/webrtc.js");
const contract = require("../remoteDesktop/contract.js");
function session(payload) { return store.getSession(payload.sessionId || payload.id); }
function missing(action) { return { ok:false, status:404, action, error:"remote_desktop_session_not_found" }; }
function withSession(action, payload, fn) { const s = session(payload); return s ? fn(s) : missing(action); }
/** B"H — Chapter 925: The action surface gained memory, export, and first frame. */
function buildRemoteDesktopActions(ctx) {
  const payload = ctx.payload || {};
  return {
    async remoteDesktopPolicy() { return { ok:true, action:"remoteDesktopPolicy", policy:publicPolicy() }; },
    async remoteDesktopPlatformCapabilities() { return { ok:true, action:"remoteDesktopPlatformCapabilities", capabilities:caps.platformCapabilities() }; },
    async remoteDesktopScreenshotSourcePlan() { return { ok:true, action:"remoteDesktopScreenshotSourcePlan", plan:caps.screenshotSourcePlan(payload) }; },
    async remoteDesktopChromeFramePlan() { return { ok:true, action:"remoteDesktopChromeFramePlan", plan:capture.chromeFramePlan(payload) }; },
    async remoteDesktopNativeHelperPlan() { return { ok:true, action:"remoteDesktopNativeHelperPlan", plan:capture.nativeHelperPlan() }; },
    async remoteDesktopHelperSkeletons() { return { ok:true, action:"remoteDesktopHelperSkeletons", helpers:helpers.helperSkeletons(), checklist:helpers.helperChecklist() }; },
    async remoteDesktopPeerConnectionPlan() { return { ok:true, action:"remoteDesktopPeerConnectionPlan", plan:capture.peerConnectionPlan() }; },
    async remoteDesktopPeerStateTemplate() { return { ok:true, action:"remoteDesktopPeerStateTemplate", peer:webrtc.peerStateTemplate(payload), checklist:webrtc.peerChecklist() }; },
    async remoteDesktopBrowserPeerScript() { return { ok:true, action:"remoteDesktopBrowserPeerScript", script:webrtc.browserPeerScript(), checklist:webrtc.peerChecklist() }; },
    async remoteDesktopFeatureCatalog() { return { ok:true, action:"remoteDesktopFeatureCatalog", count:featureCatalog().length, features:featureCatalog() }; },
    async remoteDesktopFutureCatalog() { return { ok:true, action:"remoteDesktopFutureCatalog", count:future.futureCatalog().length, features:future.futureCatalog() }; },
    async remoteDesktopEngineRoadmap() { return { ok:true, action:"remoteDesktopEngineRoadmap", engines:future.engineRoadmap() }; },
    async remoteDesktopCapabilityMatrix() { return { ok:true, action:"remoteDesktopCapabilityMatrix", matrix:future.capabilityMatrix() }; },
    async remoteDesktopUniversalVision() { return { ok:true, action:"remoteDesktopUniversalVision", count:universal.universalVision().length, systems:universal.universalVision() }; },
    async remoteDesktopUniversalGraph() { return { ok:true, action:"remoteDesktopUniversalGraph", graph:universal.universalGraph() }; },
    async remoteDesktopUniversalRoadmap() { return { ok:true, action:"remoteDesktopUniversalRoadmap", roadmap:universal.universalRoadmap() }; },
    async remoteDesktopCreateSession() { const s = store.makeSession(payload); return { ok:true, action:"remoteDesktopCreateSession", session:store.publicSession(s), ask:askFor(s), next:"Review risk/profile, then grant or deny." }; },
    async remoteDesktopAsk() { return withSession("remoteDesktopAsk", payload, s => ({ ok:true, action:"remoteDesktopAsk", ask:askFor(s), session:store.publicSession(s) })); },
    async remoteDesktopRisk() { return withSession("remoteDesktopRisk", payload, s => ({ ok:true, action:"remoteDesktopRisk", risk:riskAssessment(s), session:store.publicSession(s) })); },
    async remoteDesktopPermissionProfile() { return withSession("remoteDesktopPermissionProfile", payload, s => ({ ok:true, action:"remoteDesktopPermissionProfile", profile:permissionProfile(s), session:store.publicSession(s) })); },
    async remoteDesktopConsentStatus() { return withSession("remoteDesktopConsentStatus", payload, s => ({ ok:true, action:"remoteDesktopConsentStatus", session:store.publicSession(s), ask:askFor(s) })); },
    async remoteDesktopPermissionContract() { return withSession("remoteDesktopPermissionContract", payload, s => ({ ok:true, action:"remoteDesktopPermissionContract", contract:contract.permissionContract(s) })); },
    async remoteDesktopSessionSummary() { return withSession("remoteDesktopSessionSummary", payload, s => ({ ok:true, action:"remoteDesktopSessionSummary", summary:contract.sessionSummary(s) })); },
    async remoteDesktopSignalSummary() { return withSession("remoteDesktopSignalSummary", payload, s => ({ ok:true, action:"remoteDesktopSignalSummary", summary:contract.signalSummary(s) })); },
    async remoteDesktopGrantConsent() { return withSession("remoteDesktopGrantConsent", payload, s => ({ ok:true, action:"remoteDesktopGrantConsent", session:store.publicSession(store.grant(s, modeOf(payload.grantMode || payload.mode))) })); },
    async remoteDesktopGrantInput() { return withSession("remoteDesktopGrantInput", payload, s => ({ ok:true, action:"remoteDesktopGrantInput", session:store.publicSession(store.grantInput(s, payload.family || payload.inputFamily || "mouse")) })); },
    async remoteDesktopDenyConsent() { return withSession("remoteDesktopDenyConsent", payload, s => ({ ok:true, action:"remoteDesktopDenyConsent", session:store.publicSession(store.deny(s, payload.reason || "denied in UI")) })); },
    async remoteDesktopPause() { return withSession("remoteDesktopPause", payload, s => ({ ok:true, action:"remoteDesktopPause", session:store.publicSession(store.pause(s, payload.reason || "paused")) })); },
    async remoteDesktopResume() { return withSession("remoteDesktopResume", payload, s => ({ ok:true, action:"remoteDesktopResume", session:store.publicSession(store.resume(s, payload.reason || "resumed")) })); },
    async remoteDesktopSessionNote() { return withSession("remoteDesktopSessionNote", payload, s => ({ ok:true, action:"remoteDesktopSessionNote", session:store.publicSession(store.addNote(s, payload.note || payload.text || "note")) })); },
    async remoteDesktopBookmark() { return withSession("remoteDesktopBookmark", payload, s => ({ ok:true, action:"remoteDesktopBookmark", session:store.publicSession(store.bookmark(s, payload.label || payload.title || "bookmark")) })); },
    async remoteDesktopRevoke() { return withSession("remoteDesktopRevoke", payload, s => ({ ok:true, action:"remoteDesktopRevoke", session:store.publicSession(store.revoke(s, payload.reason || "requested")) })); },
    async remoteDesktopSessionList() { return { ok:true, action:"remoteDesktopSessionList", sessions:store.listSessions() }; },
    async remoteDesktopExport() { return { ok:true, action:"remoteDesktopExport", export:store.exportData() }; },
    async remoteDesktopOffer() { return withSession("remoteDesktopOffer", payload, s => signal.addSignal(s, "offer", payload)); },
    async remoteDesktopAnswer() { return withSession("remoteDesktopAnswer", payload, s => signal.addSignal(s, "answer", payload)); },
    async remoteDesktopIceCandidate() { return withSession("remoteDesktopIceCandidate", payload, s => signal.addSignal(s, "ice", payload)); },
    async remoteDesktopHeartbeat() { return withSession("remoteDesktopHeartbeat", payload, s => signal.heartbeat(s, payload)); },
    async remoteDesktopFramePush() { return withSession("remoteDesktopFramePush", payload, s => signal.pushFrame(s, payload)); },
    async remoteDesktopChromeFramePush() { return withSession("remoteDesktopChromeFramePush", payload, s => signal.pushFrame(s, capture.frameFromPayload(payload))); },
    async remoteDesktopChromeScreenshotPush() { return withSession("remoteDesktopChromeScreenshotPush", payload, async s => { const shot = await chrome.chromeScreenshot(payload); return shot.ok ? signal.pushFrame(s, shot) : shot; }); },
    async remoteDesktopFrameLatest() { return withSession("remoteDesktopFrameLatest", payload, s => signal.latestFrame(s)); },
    async remoteDesktopInputEvent() { return withSession("remoteDesktopInputEvent", payload, s => signal.inputEvent(s, payload)); },
    async remoteDesktopAuditLog() { return withSession("remoteDesktopAuditLog", payload, s => ({ ok:true, action:"remoteDesktopAuditLog", session:store.publicSession(s), audit:s.audit.slice(-100) })); }
  };
}
module.exports = { buildRemoteDesktopActions };
