// B"H
/**
 * @file hud.js
 * @description
 * Chapter 90: The HUD Rejected Old Perutah Echoes.
 *
 * A reset is an epoch. When the lava returns the Chossid, old coin messages may
 * still arrive late from the worker river. The HUD stores the newest reset
 * epoch and refuses any non-reset perutah message from before that epoch.
 */
const DEFAULT_REQUIRED = 9;
function readGlobalCoins() { try { return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function numberFrom(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function find(name) { return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`); }
function datasetOf(host) { return host?.dataset || document.body?.dataset || {}; }
function pick($, name) { try { return typeof $ === "function" ? $(name) : null; } catch { return null; } }
function isStalePerutah(ds, data = {}) {
  const currentEpoch = numberFrom(ds.perutahEpoch, 0);
  const incomingEpoch = numberFrom(data.perutahEpoch, -1);
  if (data.reset) return false;
  return currentEpoch > 0 && incomingEpoch < currentEpoch;
}
function rememberEpoch(ds, data = {}) {
  if (Number.isFinite(Number(data.perutahEpoch))) ds.perutahEpoch = String(Number(data.perutahEpoch));
}
function paint(host, $, data = {}) {
  const actualHost = host?.dataset ? host : find("gameHUD") || document.body;
  const ds = datasetOf(actualHost);
  if (isStalePerutah(ds, data)) return;
  rememberEpoch(ds, data);
  const required = numberFrom(data.requiredPerutos ?? ds.requiredPerutos, DEFAULT_REQUIRED) || DEFAULT_REQUIRED;
  const oldCollected = numberFrom(ds.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : oldCollected + numberFrom(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
  ds.requiredPerutos = String(required);
  ds.collectedPerutos = String(collected);
  writeGlobalCoins(globalCoins);
  const goal = pick($, "hud-perutah-goal") || find("hud-perutah-goal");
  const global = pick($, "hud-global-coins") || find("hud-global-coins");
  const bar = pick($, "hud-perutah-bar") || find("hud-perutah-bar");
  const status = pick($, "hud-perutah-status") || find("hud-perutah-status");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (bar) bar.style.width = `${percent}%`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
}
const cardStyle = {
  position: "fixed", top: "calc(8px + env(safe-area-inset-top))", left: "10px", zIndex: 23000,
  width: "min(310px, calc(100vw - 72px))", padding: "8px 10px", borderRadius: "16px", pointerEvents: "none",
  background: "linear-gradient(180deg,rgba(39,28,15,.78),rgba(18,12,6,.68))",
  border: "1px solid rgba(255,215,105,.36)", boxShadow: "0 6px 14px rgba(0,0,0,.20)",
  color: "#ffe8a6", fontFamily: "Arial, sans-serif", display: "grid",
  gridTemplateColumns: "1fr auto", columnGap: "10px", rowGap: "4px", alignItems: "center", fontSize: "12px", lineHeight: "1"
};
export default {
  shaym: "gameHUD", className: "game-hud desert-hud",
  attributes: { "data-required-perutos": String(DEFAULT_REQUIRED), "data-collected-perutos": "0", "data-perutah-epoch": "0" },
  on: {
    awtsmoosRevealed(e, $, ui) { paint(this, $, { requiredPerutos: DEFAULT_REQUIRED, collected: 0, globalCoins: readGlobalCoins(), perutahEpoch: 0 }); },
    levelGoal(e, $, ui) { paint(this, $, { requiredPerutos: numberFrom(e?.detail?.requiredPerutos, DEFAULT_REQUIRED), collected: 0, globalCoins: readGlobalCoins(), perutahEpoch: 0, reset: true }); },
    perutahProgress(e, $, ui) { paint(this, $, e?.detail || {}); },
    tooltip(e, $, ui) { const tt = pick($, "tooltip") || find("tooltip"); if (tt) { tt.textContent = e?.detail?.text || ""; tt.classList.toggle("hidden", !e?.detail?.show); } }
  },
  children: [
    { className: "desert-progress-card", style: cardStyle, children: [
      { shaym: "hud-perutah-status", style: { fontWeight: "800", letterSpacing: ".02em", color: "#ffeab0", fontSize: "12px", whiteSpace: "nowrap" }, textContent: "Collect Perutos" },
      { shaym: "hud-perutah-goal", style: { fontWeight: "900", fontSize: "17px", color: "#fff8d8", textShadow: "0 2px 6px #000", textAlign: "right", minWidth: "42px" }, textContent: "0/9" },
      { className: "hud-bar-container", style: { gridColumn: "1 / 3", height: "6px", background: "rgba(255,255,255,.15)", borderRadius: "999px", overflow: "hidden" }, children: [
        { shaym: "hud-perutah-bar", className: "hud-bar", style: { width: "0%", height: "100%", background: "linear-gradient(90deg,#f4a500,#fff176)", transition: "width .25s" } }
      ] },
      { shaym: "hud-global-coins", style: { gridColumn: "1 / 3", color: "#ffd166", fontWeight: "800", fontSize: "11px", textAlign: "left" }, textContent: "Global 0" }
    ] },
    { shaym: "tooltip", className: "tooltip hidden" },
    { tag: "style", innerHTML: `.desert-progress-card{top:calc(8px + env(safe-area-inset-top))!important}.game-hud{pointer-events:none!important}@media(max-width:760px){.desert-progress-card{left:8px!important;width:min(310px,calc(100vw - 64px))!important}}` }
  ]
};
