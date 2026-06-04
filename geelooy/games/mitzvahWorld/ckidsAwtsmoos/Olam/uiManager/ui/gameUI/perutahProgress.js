// B"H
/**
 * @file perutahProgress.js
 * @description
 * Chapter 361: The hidden village counter stays hidden.
 *
 * This small companion component no longer revives the perutah HUD in village
 * mode. When requiredPerutos is zero or hidePerutahHud is true, it hides the
 * visible card and exits.
 */
function readGlobalCoins() { try { return Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function numberFrom(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function findByShaym(name) { return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], .${name}, #${name}`); }
function isVillageUrl() { return /village/i.test(String(globalThis.location?.href || "")); }
function setCardHidden(hidden) { const card = findByShaym("hud-perutah-card") || document.querySelector(".desert-progress-card"); if (card) card.style.display = hidden ? "none" : "grid"; }
function funnyPop(text) { if (!text) return; const el = document.createElement("div"); el.className = "perutah-funny-pop"; el.textContent = text; document.body.appendChild(el); setTimeout(() => el.remove(), 900); }
function shouldHide(data, host) { return data?.hidePerutahHud === true || data?.villageRay === true || (isVillageUrl() && numberFrom(data?.requiredPerutos ?? host?.dataset?.requiredPerutos, 0) <= 0); }
function normalizeProgress(data, host) {
  const raw = numberFrom(data.requiredPerutos ?? host.dataset.requiredPerutos, 9);
  const required = raw > 0 ? raw : 9;
  const previous = numberFrom(host.dataset.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : previous + numberFrom(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = required > 0 ? Math.min(100, (collected / required) * 100) : 0;
  const pop = data.silent ? "" : data.globalAdded > 0 ? "+ SELA" : data.added ? "+1 Perutah" : "";
  return { required, collected, globalCoins, percent, pop };
}
function paintHud(data, host) {
  data ||= {};
  if (shouldHide(data, host)) { setCardHidden(true); return; }
  setCardHidden(false);
  const state = normalizeProgress(data, host);
  host.dataset.requiredPerutos = String(state.required);
  host.dataset.collectedPerutos = String(state.collected);
  writeGlobalCoins(state.globalCoins);
  const goal = findByShaym("hud-perutah-goal"), bar = findByShaym("hud-perutah-bar"), status = findByShaym("hud-perutah-status"), global = findByShaym("hud-global-coins");
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
    nivraNeechnas(e) { paintHud({ collected: 0, requiredPerutos: e?.detail?.requiredPerutos ?? 0, hidePerutahHud: e?.detail?.hidePerutahHud, villageRay: e?.detail?.villageRay, silent: true }, e.target); }
  }
};

export { paintHud };
