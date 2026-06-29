// B"H
const { implementedFeatures, plannedFeatures } = require("./features.js");
/** B"H — Chapter 919: Permission became a contract, not a shrug. */
function permissionProfile(session = {}) {
  const control = session.mode === "control";
  return { mode:session.mode || "watch", requested:requested(control), blocked:blocked(), enforced:implementedFeatures().map(f => f.id), planned:plannedFeatures().map(f => f.id), supportInfo:supportInfo(session) };
}
function requested(control) { const base = ["screenFrames", "countdown", "humanAudit", "revokeAnytime"]; return control ? [...base, "allowlistedPointer", "allowlistedKeyboard"] : base; }
function blocked() { return ["silentCapture", "clipboardSync", "fileDrop", "rawShell", "credentialReveal", "unboundedControl"]; }
function supportInfo(session) { return { sessionId:session.id || "", requester:session.requester || "", purpose:session.purpose || "", scope:session.scope || "", expiresAt:session.expiresAt || 0 }; }
module.exports = { permissionProfile };
