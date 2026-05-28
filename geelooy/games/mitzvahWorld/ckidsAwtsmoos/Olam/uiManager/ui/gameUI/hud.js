// B"H
/**
 * @file hud.js
 * @description
 * Chapter 17: The perutah counter becomes a clean little scroll.
 *
 * The Awtsmoos counts without crowding: one mission line, one number line, one
 * global line, and a tiny bar. No overlapping letters. No question marks. The
 * HUD is a lamp, not a wall.
 */
const DEFAULT_REQUIRED = 7;

function readGlobalCoins() {
  try { return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0); }
  catch { return 0; }
}

function writeGlobalCoins(value) {
  try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value)); }
  catch {}
}

function numberFrom(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function paint(host, $, data = {}) {
  const required = numberFrom(data.requiredPerutos || host.dataset.requiredPerutos, DEFAULT_REQUIRED) || DEFAULT_REQUIRED;
  const oldCollected = numberFrom(host.dataset.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : oldCollected + numberFrom(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;

  host.dataset.requiredPerutos = String(required);
  host.dataset.collectedPerutos = String(collected);
  writeGlobalCoins(globalCoins);

  const goal = $("hud-perutah-goal");
  const global = $("hud-global-coins");
  const bar = $("hud-perutah-bar");
  const status = $("hud-perutah-status");
  if (goal) goal.textContent = `${collected} / ${required}`;
  if (global) global.textContent = `Global: ${globalCoins}`;
  if (bar) bar.style.width = `${percent}%`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
}

export default {
  shaym: "gameHUD",
  className: "game-hud desert-hud",
  attributes: { "data-required-perutos": String(DEFAULT_REQUIRED), "data-collected-perutos": "0" },
  on: {
    awtsmoosRevealed(e, $, ui) { paint(this, $, { requiredPerutos: DEFAULT_REQUIRED, collected: 0, globalCoins: readGlobalCoins() }); },
    levelGoal(e, $, ui) { paint(this, $, { requiredPerutos: numberFrom(e.detail?.requiredPerutos, DEFAULT_REQUIRED), collected: 0, globalCoins: readGlobalCoins() }); },
    perutahProgress(e, $, ui) { paint(this, $, e.detail || {}); },
    tooltip(e, $, ui) {
      const data = e.detail || {};
      const tt = $("tooltip");
      if (!tt) return;
      tt.textContent = data.text || "";
      tt.classList.toggle("hidden", !data.show);
    }
  },
  children: [
    {
      className: "desert-progress-card",
      style: {
        position: "absolute", top: "10px", left: "10px", zIndex: 1000,
        width: "176px", padding: "7px 9px", borderRadius: "12px",
        background: "rgba(30,18,8,.56)", border: "1px solid rgba(255,210,100,.38)",
        color: "#ffe9a8", fontFamily: "Arial, sans-serif", pointerEvents: "none",
        display: "grid", gridTemplateColumns: "1fr auto", columnGap: "8px", rowGap: "2px",
        alignItems: "center", fontSize: "13px", lineHeight: "1.15"
      },
      children: [
        { shaym: "hud-perutah-status", style: { gridColumn: "1 / 2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, textContent: "Collect Perutos" },
        { shaym: "hud-perutah-goal", className: "hud-text", style: { gridColumn: "2 / 3", fontWeight: "700", whiteSpace: "nowrap" }, textContent: "0 / 7" },
        {
          className: "hud-bar-container",
          style: { gridColumn: "1 / 3", height: "7px", background: "rgba(255,255,255,.16)", borderRadius: "999px", overflow: "hidden" },
          children: [{ shaym: "hud-perutah-bar", className: "hud-bar", style: { width: "0%", height: "100%", background: "linear-gradient(90deg,#ffb000,#fff176)", transition: "width .25s" } }]
        },
        { shaym: "hud-global-coins", style: { gridColumn: "1 / 3", fontSize: "12px", color: "#ffd166" }, textContent: "Global: 0" }
      ]
    },
    { shaym: "tooltip", className: "tooltip hidden" }
  ]
};
