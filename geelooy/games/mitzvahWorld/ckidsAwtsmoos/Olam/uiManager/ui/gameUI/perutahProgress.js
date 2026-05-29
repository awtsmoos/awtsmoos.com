// B"H
/**
 * @file perutahProgress.js
 * @description Chapter 68: Perutos follow the current level's compact HUD goal.
 */
function readGlobalCoins() { try { return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function numberFrom(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function findByShaym(name) { return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], .${name}, #${name}`); }
function funnyPop(text) {
  const el = document.createElement("div");
  el.className = "perutah-funny-pop";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}
function paintHud(data, host) {
  const required = numberFrom(data.requiredPerutos ?? host.dataset.requiredPerutos, 9);
  const oldCollected = numberFrom(host.dataset.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : oldCollected + numberFrom(data.added, 1);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
  host.dataset.requiredPerutos = String(required);
  host.dataset.collectedPerutos = String(collected);
  writeGlobalCoins(globalCoins);
  const goal = findByShaym("hud-perutah-goal");
  const bar = findByShaym("hud-perutah-bar");
  const status = findByShaym("hud-perutah-status");
  const global = findByShaym("hud-global-coins");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (bar) bar.style.width = `${percent}%`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
  funnyPop(data.globalAdded > 0 ? "+ SELA" : "+1 Perutah");
}
export const PerutahProgress = { shaym: "perutahProgress", className: "perutah-progress-vessel", style: { display: "none" }, on: { awtsmoosRevealed(e) { paintHud(e.detail || {}, e.target); } } };
