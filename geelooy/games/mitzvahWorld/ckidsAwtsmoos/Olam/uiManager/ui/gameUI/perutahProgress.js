// B"H
/**
 * @file perutahProgress.js
 * @description
 * Chapter 8: The Counter Remembered Aleph.
 *
 * The Awtsmoos lets the HUD hear the current level's required perutos instead
 * of falling back to an old seven-coin memory. Fresh lava starts at 0/9; each
 * collected coin advances the same living count.
 */

/** @returns {number} Saved global perutos. */
function readGlobalCoins() { try { return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0); } catch { return 0; } }

/** @param {number} value Global perutos. @returns {void} */
function writeGlobalCoins(value) { try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }

/** @param {unknown} value Candidate. @param {number} fallback Fallback. @returns {number} */
function numberFrom(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }

/** @param {string} name Element shaym/id/class. @returns {Element|null} */
function findByShaym(name) { return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], .${name}, #${name}`); }

/** @param {string} text Popup text. @returns {void} */
function funnyPop(text) {
  if (!text) return;
  const el = document.createElement("div");
  el.className = "perutah-funny-pop";
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

/**
 * Normalizes any perutah payload into a stable HUD state.
 *
 * @param {object} data Incoming UI event.
 * @param {HTMLElement} host Component root.
 * @returns {{required:number,collected:number,globalCoins:number,percent:number,pop:string}}
 */
function normalizeProgress(data, host) {
  const required = numberFrom(data.requiredPerutos ?? host.dataset.requiredPerutos, 9) || 9;
  const previous = numberFrom(host.dataset.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : previous + numberFrom(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
  const pop = data.silent ? "" : data.globalAdded > 0 ? "+ SELA" : data.added ? "+1 Perutah" : "";
  return { required, collected, globalCoins, percent, pop };
}

/**
 * Paints the HUD with current level data.
 *
 * @param {object} data Incoming UI event.
 * @param {HTMLElement} host Component root.
 * @returns {void}
 */
function paintHud(data, host) {
  const state = normalizeProgress(data || {}, host);
  host.dataset.requiredPerutos = String(state.required);
  host.dataset.collectedPerutos = String(state.collected);
  writeGlobalCoins(state.globalCoins);
  const goal = findByShaym("hud-perutah-goal");
  const bar = findByShaym("hud-perutah-bar");
  const status = findByShaym("hud-perutah-status");
  const global = findByShaym("hud-global-coins");
  if (goal) goal.textContent = `${state.collected}/${state.required}`;
  if (bar) bar.style.width = `${state.percent}%`;
  if (global) global.textContent = `Global ${state.globalCoins}`;
  if (status) status.textContent = state.collected >= state.required ? "Gate ready" : "Collect Perutos";
  funnyPop(state.pop);
}

export const PerutahProgress = {
  shaym: "perutahProgress",
  className: "perutah-progress-vessel",
  style: { display: "none" },
  on: {
    awtsmoosRevealed(e) { paintHud(e.detail || {}, e.target); },
    nivraNeechnas(e) { paintHud({ collected: 0, requiredPerutos: e?.detail?.requiredPerutos ?? 9, silent: true }, e.target); }
  }
};

export { paintHud };
