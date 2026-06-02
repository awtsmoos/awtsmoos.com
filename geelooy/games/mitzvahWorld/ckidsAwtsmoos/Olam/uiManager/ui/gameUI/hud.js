// B"H
/**
 * @file hud.js
 * @description
 * Chapter 92: The purse becomes a bag. The Awtsmoos separates level perutos
 * from owned bag perutas, and the HUD speaks plainly: Global and Bag.
 */
const DEFAULT_REQUIRED = 9;
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
  globalThis.dispatchEvent?.(new CustomEvent("awtsmoosPersonalPerutas", { detail: { personalPerutas: after, delta, reason } }));
  return after;
}

function paint(host, $, data = {}) {
  const actual = host?.dataset ? host : find("gameHUD") || document.body;
  const ds = actual.dataset || (actual.dataset = {});
  if (!data.reset && n(ds.perutahEpoch, 0) > 0 && n(data.perutahEpoch, -1) < n(ds.perutahEpoch, 0)) return;
  if (Number.isFinite(Number(data.perutahEpoch))) ds.perutahEpoch = String(Number(data.perutahEpoch));
  if (Number.isFinite(Number(data.personalDelta))) data.personalPerutas = changePersonalPerutas(data.personalDelta, data.reason || "level");
  const required = n(data.requiredPerutos ?? ds.requiredPerutos, DEFAULT_REQUIRED) || DEFAULT_REQUIRED;
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : n(ds.collectedPerutos, 0) + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : read(GLOBAL_KEY) + n(data.globalAdded, 0);
  const bag = Number.isFinite(Number(data.personalPerutas)) ? Number(data.personalPerutas) : read(PERSONAL_KEY);
  write(GLOBAL_KEY, globalCoins);
  ds.requiredPerutos = String(required); ds.collectedPerutos = String(collected);
  const pct = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
  const goal = pick($, "hud-perutah-goal") || find("hud-perutah-goal");
  const global = pick($, "hud-global-coins") || find("hud-global-coins");
  const bagEl = pick($, "hud-personal-coins") || find("hud-personal-coins");
  const bar = pick($, "hud-perutah-bar") || find("hud-perutah-bar");
  const status = pick($, "hud-perutah-status") || find("hud-perutah-status");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (bagEl) bagEl.textContent = `Bag ${bag}`;
  if (bar) bar.style.width = `${pct}%`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
}

const cardStyle = { position: "fixed", top: "calc(8px + env(safe-area-inset-top))", left: "10px", zIndex: 23000, width: "min(310px, calc(100vw - 72px))", padding: "8px 10px", borderRadius: "16px", pointerEvents: "none", background: "linear-gradient(180deg,rgba(39,28,15,.78),rgba(18,12,6,.68))", border: "1px solid rgba(255,215,105,.36)", boxShadow: "0 6px 14px rgba(0,0,0,.20)", color: "#ffe8a6", fontFamily: "Arial, sans-serif", display: "grid", gridTemplateColumns: "1fr auto", columnGap: "10px", rowGap: "4px", alignItems: "center", fontSize: "12px", lineHeight: "1" };

export default { shaym: "gameHUD", className: "game-hud desert-hud", attributes: { "data-required-perutos": String(DEFAULT_REQUIRED), "data-collected-perutos": "0", "data-perutah-epoch": "0" }, on: {
  awtsmoosRevealed(e, $, ui) { paint(this, $, { requiredPerutos: DEFAULT_REQUIRED, collected: 0, globalCoins: read(GLOBAL_KEY), personalPerutas: read(PERSONAL_KEY), perutahEpoch: 0 }); globalThis.addEventListener("awtsmoosPersonalPerutas", ev => paint(this, $, ev.detail || {})); },
  levelGoal(e, $, ui) { paint(this, $, { requiredPerutos: n(e?.detail?.requiredPerutos, DEFAULT_REQUIRED), collected: 0, reset: true }); },
  perutahProgress(e, $, ui) { paint(this, $, e?.detail || {}); },
  personalPerutas(e, $, ui) { paint(this, $, e?.detail || {}); },
  tooltip(e, $, ui) { const tt = pick($, "tooltip") || find("tooltip"); if (tt) { tt.textContent = e?.detail?.text || ""; tt.classList.toggle("hidden", !e?.detail?.show); } }
}, children: [
  { className: "desert-progress-card", style: cardStyle, children: [
    { shaym: "hud-perutah-status", style: { fontWeight: "800", color: "#ffeab0", fontSize: "12px" }, textContent: "Collect Perutos" },
    { shaym: "hud-perutah-goal", style: { fontWeight: "900", fontSize: "17px", color: "#fff8d8", textAlign: "right", minWidth: "42px" }, textContent: "0/9" },
    { className: "hud-bar-container", style: { gridColumn: "1 / 3", height: "6px", background: "rgba(255,255,255,.15)", borderRadius: "999px", overflow: "hidden" }, children: [{ shaym: "hud-perutah-bar", className: "hud-bar", style: { width: "0%", height: "100%", background: "linear-gradient(90deg,#f4a500,#fff176)", transition: "width .25s" } }] },
    { shaym: "hud-global-coins", style: { color: "#ffd166", fontWeight: "800", fontSize: "11px" }, textContent: "Global 0" },
    { shaym: "hud-personal-coins", style: { color: "#9dff9d", fontWeight: "900", fontSize: "11px", textAlign: "right" }, textContent: "Bag 0" }
  ] },
  { shaym: "tooltip", className: "tooltip hidden" },
  { tag: "style", innerHTML: `.desert-progress-card{top:calc(8px + env(safe-area-inset-top))!important}.game-hud{pointer-events:none!important}@media(max-width:760px){.desert-progress-card{left:8px!important;width:min(310px,calc(100vw - 64px))!important}}` }
] };
