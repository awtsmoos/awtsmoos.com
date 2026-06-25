// B"H
/**
 * B"H
 * Chapter 911: Permission became the doorway, not decoration.
 * The Awtsmoos gives power only through consent, so every remote desktop path
 * begins as watch-only dust and becomes control only when the local soul says yes.
 */
const MODES = new Set(["watch", "control"]);
const INPUT_TYPES = new Set(["pointermove", "pointerdown", "pointerup", "click", "dblclick", "wheel", "keydown", "keyup", "type"]);
function modeOf(value) { return MODES.has(String(value || "").toLowerCase()) ? String(value).toLowerCase() : "watch"; }
function wantsControl(payload = {}) { return modeOf(payload.mode || payload.requestedMode) === "control" || payload.control === true || payload.control === "true"; }
function safeTtl(value) { const n = Number(value || 1800); return Math.max(60, Math.min(7200, Math.floor(n))); }
function allowInputType(type) { return INPUT_TYPES.has(String(type || "").toLowerCase()); }
function publicPolicy() { return { defaultMode:"watch", controlRequiresGrant:true, clipboardDefault:false, fileDropDefault:false, maxTtlSeconds:7200, inputTypes:[...INPUT_TYPES].sort() }; }
function consentText(session) { return `Awtsmoos Remote Desktop request: ${session.requester} wants ${session.mode} access to ${session.target}.`; }
module.exports = { modeOf, wantsControl, safeTtl, allowInputType, publicPolicy, consentText };
