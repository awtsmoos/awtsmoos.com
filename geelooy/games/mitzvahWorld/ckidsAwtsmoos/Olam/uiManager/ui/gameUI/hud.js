// B"H
/**
 * @file hud.js
 * @description Chapter 366: The village counter is born hidden, and Bag text is
 * not born. The perutah progress card may show only level-goal progress when a
 * level explicitly requires it; personal bag text is removed at source.
 */
const GLOBAL_KEY = "awtsmoosMitzvahGlobalCoins";
const PERSONAL_KEY = "awtsmoosMitzvahPersonalPerutas";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const read = key => { try { return n(localStorage.getItem(key), 0); } catch { return 0; } };
const write = (key, value) => { try { localStorage.setItem(key, String(Math.max(0, Math.floor(value)))); } catch {} };
const find = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const pick = ($, name) => { try { return typeof $ === "function" ? $(name) : null; } catch { return null; } };

export function changePersonalPerutas(delta, reason = "") {
  const after = Math.max(0, read(PERSONAL_KEY) + n(delta, 0));
  write(PERSONAL_KEY, after);
  globalThis.dispatchEvent?.(new CustomEvent("awtsmoosPersonalPerutas", { detail:{ personalPerutas:after, delta, reason } }));
  return after;
}

function card(host) { return find("hud-perutah-card") || host?.querySelector?.(".desert-progress-card"); }
function hide(host) { const c = card(host); if (c) c.style.display = "none"; if (host?.dataset) host.dataset.hidePerutahHud = "true"; }
function show(host) { const c = card(host); if (c) c.style.display = "grid"; if (host?.dataset) host.dataset.hidePerutahHud = "false"; }
function shouldHide(host, data = {}) { if (data.hidePerutahHud === true || data.villageRay === true || data.isVillage === true) return true; const required = Number(data.requiredPerutos ?? host?.dataset?.requiredPerutos ?? 0); return !(required > 0); }

function paint(host, $, data = {}) {
  const actual = host?.dataset ? host : find("gameHUD") || document.body;
  if (shouldHide(actual, data)) return hide(actual);
  show(actual);
  const ds = actual.dataset || (actual.dataset = {});
  if (Number.isFinite(Number(data.personalDelta))) changePersonalPerutas(data.personalDelta, data.reason || "level");
  const required = n(data.requiredPerutos ?? ds.requiredPerutos, 9) || 9;
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : n(ds.collectedPerutos, 0) + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : read(GLOBAL_KEY) + n(data.globalAdded, 0);
  write(GLOBAL_KEY, globalCoins);
  ds.requiredPerutos = String(required);
  ds.collectedPerutos = String(collected);
  const pct = Math.min(100, (collected / required) * 100);
  const goal = pick($, "hud-perutah-goal") || find("hud-perutah-goal");
  const global = pick($, "hud-global-coins") || find("hud-global-coins");
  const bar = pick($, "hud-perutah-bar") || find("hud-perutah-bar");
  const status = pick($, "hud-perutah-status") || find("hud-perutah-status");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (bar) bar.style.width = `${pct}%`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
}

const cardStyle = { position:"fixed", top:"calc(8px + env(safe-area-inset-top))", left:"10px", zIndex:23000, width:"min(310px, calc(100vw - 72px))", padding:"8px 10px", borderRadius:"16px", pointerEvents:"none", background:"linear-gradient(180deg,rgba(39,28,15,.78),rgba(18,12,6,.68))", border:"1px solid rgba(255,215,105,.36)", boxShadow:"0 6px 14px rgba(0,0,0,.20)", color:"#ffe8a6", fontFamily:"Arial, sans-serif", display:"none", gridTemplateColumns:"1fr auto", columnGap:"10px", rowGap:"4px", alignItems:"center", fontSize:"12px", lineHeight:"1" };

export default { shaym:"gameHUD", className:"game-hud desert-hud", attributes:{ "data-required-perutos":"0", "data-collected-perutos":"0", "data-hide-perutah-hud":"true" }, on:{
  awtsmoosRevealed(e, $, ui) { hide(this); globalThis.addEventListener("awtsmoosPersonalPerutas", ev => paint(this, $, ev.detail || {})); },
  levelGoal(e, $, ui) { paint(this, $, e?.detail || {}); },
  perutahProgress(e, $, ui) { paint(this, $, e?.detail || {}); },
  personalPerutas(e, $, ui) { paint(this, $, e?.detail || {}); },
  gameHUD(e, $, ui) { const d = e?.detail || {}; if (d.perutahProgress) paint(this, $, d.perutahProgress); if (d.personalPerutas) paint(this, $, d.personalPerutas); },
  tooltip(e, $, ui) { const tt = pick($, "tooltip") || find("tooltip"); if (tt) { tt.textContent = e?.detail?.text || ""; tt.classList.toggle("hidden", !e?.detail?.show); } }
}, children:[
  { shaym:"hud-perutah-card", className:"desert-progress-card", style:cardStyle, children:[
    { shaym:"hud-perutah-status", style:{ fontWeight:"800", color:"#ffeab0", fontSize:"12px" }, textContent:"Collect Perutos" },
    { shaym:"hud-perutah-goal", style:{ fontWeight:"900", fontSize:"17px", color:"#fff8d8", textAlign:"right", minWidth:"42px" }, textContent:"0/9" },
    { className:"hud-bar-container", style:{ gridColumn:"1 / 3", height:"6px", background:"rgba(255,255,255,.15)", borderRadius:"999px", overflow:"hidden" }, children:[{ shaym:"hud-perutah-bar", className:"hud-bar", style:{ width:"0%", height:"100%", background:"linear-gradient(90deg,#f4a500,#fff176)", transition:"width .25s" } }] },
    { shaym:"hud-global-coins", style:{ color:"#ffd166", fontWeight:"800", fontSize:"11px", gridColumn:"1 / 3" }, textContent:"Global 0" },
    { shaym:"hud-personal-coins", style:{ display:"none" }, textContent:"" }
  ] },
  { shaym:"tooltip", className:"tooltip hidden" },
  { tag:"style", innerHTML:`.desert-progress-card{display:none}.game-hud{pointer-events:none!important}@media(max-width:760px){.desert-progress-card{left:8px!important;width:min(310px,calc(100vw - 64px))!important}}` }
] };
