// B"H
/** @file index.js @description Quiet outer gate for Mitzvah World with compact smoke hook and solo-WoW UI bridge. */
let bootStarted = false;
const SEAL = "zone-reality-20260614-bh819-solo-wow-ui";
const trace = () => window.__AWTSMOOS_BOOT_TRACE__ === true;
function safeClone(value, depth = 0) {
  if (depth > 3) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return { name:value.name, message:value.message, stack:String(value.stack || "").slice(0, 2000) };
  if (Array.isArray(value)) return value.slice(0, 20).map(item => safeClone(item, depth + 1));
  if (typeof value === "object") { const out = { kind:value?.constructor?.name || "Object" }; for (const key of Object.keys(value).slice(0, 25)) try { out[key] = safeClone(value[key], depth + 1); } catch { out[key] = "[Unreadable]"; } return out; }
  return String(value).slice(0, 500);
}
function panel(parentId, id, title, body = "") { const parent = document.getElementById(parentId); if (!parent) return null; let el = document.getElementById(id); if (!el) { el = document.createElement("div"); el.id = id; el.className = "mitzvahPanel"; parent.appendChild(el); } el.innerHTML = `<strong>${title}</strong><br>${body}`; return el; }
function installSoloWowUiBridge() {
  window.__MITZVAH_UI_STATE__ ||= {};
  const renderers = {
    minimap:p => panel("mitzvahTopRight", "uiMiniMap", "Minimap", `${(p.markers || []).length} markers<br>${p.corpse ? "Corpse marked" : "No corpse"}`),
    mapReveal:p => panel("mitzvahTopRight", "uiMiniMap", "Minimap", `${(p.markers || []).length} revealed<br>Fog: ${(p.fog?.revealed || []).length}`),
    castBar:p => p?.active ? panel("mitzvahBottomCenter", "uiCastBar", p.spell || "Cast", `${Math.floor((p.progress || 0) * 100)}% ${p.interruptible ? "interruptible" : "locked"}`) : panel("mitzvahBottomCenter", "uiCastBar", "Cast", "—"),
    nameplates:p => panel("mitzvahTopLeft", "uiNameplates", "Nameplates", (p.plates || []).slice(0, 5).map(x => `${x.rare ? "★" : ""}${x.elite ? "Elite " : ""}${x.name}: ${x.hp}/${x.maxHp}`).join("<br>") || "No targets"),
    reputation:p => panel("mitzvahTopLeft", "uiReputation", "Reputation", `${p.factionId || "faction"}: ${p.row?.standing || "updated"}`),
    restedXp:p => panel("mitzvahTopLeft", "uiRested", "Rested XP", `${p.restedXp?.value ?? p.value ?? 0} rested`),
    profession:p => panel("mitzvahTopLeft", "uiProfession", "Profession", `${p.id || "profession"} rank ${p.rank || 1}`),
    corpseMarker:p => panel("mitzvahTopRight", "uiCorpse", "Corpse", p.hasCorpse ? `x:${Math.round(p.corpse?.x || 0)} z:${Math.round(p.corpse?.z || 0)}` : "none"),
    rareAnnouncement:p => panel("mitzvahBottomCenter", "uiRare", "Rare", p.text || p.name || "Rare sighted"),
    bossEncounter:p => panel("mitzvahTopRight", "uiBoss", p.boss?.title || "Boss", p.phase ? `Phase ${p.phase}%` : "Ready"),
    breadcrumbs:p => panel("mitzvahTopLeft", "uiBreadcrumbs", "Breadcrumbs", (p.breadcrumbs || []).map(b => `${b.to} → ${b.zone}`).join("<br>") || "none"),
    trainerScreen:p => panel("mitzvahTopLeft", "uiTrainer", "Trainer", `${Object.keys(p.learned || {}).length} learned ranks`),
    innRest:p => panel("mitzvahTopLeft", "uiInn", "Inn", `Rested ${p.rested?.value || 0}`),
    worldAnnouncement:p => panel("mitzvahBottomCenter", "uiWorld", p.title || "World", p.text || "Announcement")
  };
  window.__MITZVAH_UI_BRIDGE__ = { receive(name, payload) { window.__MITZVAH_UI_STATE__[name] = safeClone(payload); renderers[name]?.(payload || {}); return true; }, state:window.__MITZVAH_UI_STATE__ };
  window.addEventListener("message", event => { const d = event.data || {}; if (d.type === "ui event" && d.name) window.__MITZVAH_UI_BRIDGE__.receive(d.name, d.payload); });
}
function renderErrorPanel(details) { const root = document.getElementById("ikar") || document.body; if (!root) return; let panel = document.getElementById("awtsmoosBootErrorPanel"); if (!panel) { panel = document.createElement("pre"); panel.id = "awtsmoosBootErrorPanel"; panel.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;"; root.appendChild(panel); } panel.textContent = `B\"H — Mitzvah World boot error\n\n${JSON.stringify(details, null, 2)}`; }
function describeAwtsmoosError(error, context = {}) { const details = { context:safeClone(context), thrown:safeClone(error), at:new Date().toISOString(), page:location?.href || null }; window.__AWTSMOOS_LAST_ERROR__ = details; window.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2); window.__AWTSMOOS_ERROR_COUNT__ = Number(window.__AWTSMOOS_ERROR_COUNT__ || 0) + 1; if (trace()) console.error(`B"H - ${context.label || "Runtime error"}`, details.thrown?.message || details.thrown?.string || details.thrown); renderErrorPanel(details); return details; }
async function installCompactSmokeHook() { try { const mod = await import(`./ckidsAwtsmoos/testing/CompactLiveSmoke.js?bh=${SEAL}`); mod.installCompactLiveSmoke?.(window); } catch (error) { window.__MITZVAH_COMPACT_SMOKE_INSTALL_ERROR__ = safeClone(error); } }
function bootIkarNow() { if (bootStarted || typeof window === "undefined" || !window.document) return; bootStarted = true; window.__AWTSMOOS_BOOT_STARTED__ = { at:new Date().toISOString(), readyState:document.readyState, seal:SEAL }; installSoloWowUiBridge(); installCompactSmokeHook(); const ikarModuleURL = `./ckidsAwtsmoos/ikar.js?compact=true&bh=${SEAL}`; import(ikarModuleURL).then(module => { window.__AWTSMOOS_BOOT_LOADED__ = { at:new Date().toISOString(), keys:Object.keys(module || {}).slice(0, 20), seal:SEAL }; if (trace()) console.info("B\"H - Mitzvah World ikar boot loaded", window.__AWTSMOOS_BOOT_LOADED__); }).catch(error => describeAwtsmoosError(error, { label:"Index [Main]: Failed to load UI starter", phase:"dynamic import", moduleURL:new URL(ikarModuleURL, import.meta.url).href })); }
window.addEventListener("error", event => describeAwtsmoosError(event.error || event.message, { label:"Global error", phase:"window.error", moduleURL:event.filename, line:event.lineno, column:event.colno }));
window.addEventListener("unhandledrejection", event => describeAwtsmoosError(event.reason, { label:"Unhandled promise rejection", phase:"window.unhandledrejection" }));
export async function heescheel(ctx) { if (trace()) console.info("B\"H - Index [Worker]: data-driven level hook.", Boolean(ctx)); }
export function ready(ctx) { ctx.postMsg({ type:"game started", payload:true }); }
export function afterBriyah(ctx) { if (trace()) console.info("B\"H - Index [Worker]: afterBriyah() called", Boolean(ctx)); }
if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", bootIkarNow, { once:true }); else bootIkarNow();
