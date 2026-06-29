// B"H
const { permissionProfile } = require("./profile.js");
const { riskAssessment } = require("./risk.js");
/** B"H — Chapter 921: The ask became a covenant with forty-nine witnesses. */
const MODES = new Set(["watch", "control"]);
const INPUT_TYPES = new Set(["pointermove", "pointerdown", "pointerup", "click", "dblclick", "wheel", "keydown", "keyup", "type"]);
function modeOf(value) { const mode = String(value || "").toLowerCase(); return MODES.has(mode) ? mode : "watch"; }
function safeText(value, fallback) { const text = String(value || "").trim(); return text.slice(0, 240) || fallback; }
function safeTtl(value) { const n = Number(value || 1800); return Math.max(60, Math.min(7200, Math.floor(n))); }
function allowInputType(type) { return INPUT_TYPES.has(String(type || "").toLowerCase()); }
function modePermissions(mode) { return mode === "control" ? ["see screen frames", "send allowlisted pointer and keyboard events"] : ["see screen frames only"]; }
function blockedFeatures() { return ["silent capture", "clipboard sync", "file drag/drop", "raw shell access", "credential reveal", "unbounded control"]; }
function askFor(session) {
  const action = session.mode === "control" ? "watch and control" : "watch";
  const profile = permissionProfile(session);
  const risk = riskAssessment(session);
  return { title:"Remote Desktop request", question:`Allow ${session.requester} to ${action} ${session.target}?`, purpose:session.purpose, scope:session.scope, requesterContact:session.requesterContact, expiresAt:session.expiresAt, allowLabel:session.mode === "control" ? "Allow control" : "Allow watch only", denyLabel:"Deny / close request", permissions:modePermissions(session.mode), blocked:blockedFeatures(), warnings:warnings(session, risk), checklist:checklist(session), risk, profile };
}
function warnings(session, risk) { const out = ["Only approve if you recognize the requester and purpose."]; if (session.mode === "control") out.push("Control can click and type inside the shared target after you grant it."); if (risk.level === "high") out.push("High-risk request: reduce scope or deny."); return out; }
function checklist(session) { return [`Purpose: ${session.purpose}`, `Scope: ${session.scope}`, `Target: ${session.target}`, `Mode: ${session.mode}`, "Review risk/profile before granting.", "Use revoke immediately if anything looks wrong."]; }
function inputFamily(type) { const t = String(type || "").toLowerCase(); if (["pointermove","pointerdown","pointerup","click","dblclick","wheel"].includes(t)) return "mouse"; if (["keydown","keyup","type"].includes(t)) return "keyboard"; return "unknown"; }
function publicPolicy() { return { defaultMode:"watch", controlRequiresGrant:true, mouseGrantRequired:true, keyboardGrantRequired:true, denyAudited:true, pauseSupported:true, featureCatalogSize:49, clipboardDefault:false, fileDropDefault:false, maxTtlSeconds:7200, inputTypes:[...INPUT_TYPES].sort(), blocked:blockedFeatures() }; }
function consentText(session) { return askFor(session).question; }
module.exports = { modeOf, safeText, safeTtl, allowInputType, inputFamily, publicPolicy, consentText, askFor };
