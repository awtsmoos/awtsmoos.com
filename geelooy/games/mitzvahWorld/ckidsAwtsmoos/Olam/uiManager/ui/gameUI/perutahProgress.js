// B"H
/**
 * @file perutahProgress.js
 * @description
 * Chapter 12: The copper moon finds its number.
 *
 * The Awtsmoos renews each perutah as a tiny sun trapped in copper. The worker
 * whispers the new count across the veil; this vessel catches it by name, paints
 * the HUD, and laughs with a small sparkle so collection feels alive.
 */
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

function findByShaym(name) {
  return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], .${name}, #${name}`);
}

function funnyPop(text) {
  const el = document.createElement("div");
  el.className = "perutah-funny-pop";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function paintHud(data, host) {
  const required = numberFrom(host.dataset.requiredPerutos || data.requiredPerutos, 7);
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

  if (goal) goal.textContent = `Perutos: ${collected} / ${required}`;
  if (bar) bar.style.width = `${percent}%`;
  if (global) global.textContent = `Global: ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Gate ready — zing!" : `${data.funnyText || "Perutah ping!"} ${Math.max(0, required - collected)} left`;
  funnyPop(data.globalAdded > 0 ? "GLOBAL SELA BOOM!" : "+1 shiny mitzvah coin!");
}

export const PerutahProgress = {
  shaym: "perutahProgress",
  className: "perutah-progress-vessel",
  style: { display: "none" },
  on: {
    awtsmoosRevealed(e) {
      paintHud(e.detail || {}, e.target);
    }
  }
};
