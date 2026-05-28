// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 21: Spike death visuals are CSS-only and cannot freeze the worker.
 *
 * The Awtsmoos moves the explosion entirely out of Three and out of the worker
 * render loop. The main thread creates a tiny DOM/CSS burst with one-time
 * transitions only. Reset posts back to the live worker; no page reload, no
 * world regeneration, no scene particles.
 */
import VeilController from "../../uiManager/logic/VeilController.js";

function q(name) {
  return document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
}

function numberFrom(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function readGlobalCoins() {
  try { return numberFrom(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); }
  catch { return 0; }
}

function writeGlobalCoins(value) {
  try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); }
  catch {}
}

function updatePerutahHud(data = {}) {
  const host = q("gameHUD") || document.body;
  const required = numberFrom(host.dataset?.requiredPerutos || data.requiredPerutos, 7) || 7;
  const previous = numberFrom(host.dataset?.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : previous + numberFrom(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + numberFrom(data.globalAdded, 0);
  const percent = Math.min(100, required > 0 ? (collected / required) * 100 : 0);
  if (host.dataset) {
    host.dataset.requiredPerutos = String(required);
    host.dataset.collectedPerutos = String(collected);
  }
  writeGlobalCoins(globalCoins);
  const goal = q("hud-perutah-goal");
  const bar = q("hud-perutah-bar");
  const status = q("hud-perutah-status");
  const global = q("hud-global-coins");
  if (goal) goal.textContent = `${collected} / ${required}`;
  if (bar) bar.style.width = `${percent}%`;
  if (global) global.textContent = `Global: ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Gate ready" : "Collect Perutos";
}

function setLevelGoal(data = {}) {
  const host = q("gameHUD") || document.body;
  const required = numberFrom(data.requiredPerutos, 7) || 7;
  if (host.dataset) {
    host.dataset.requiredPerutos = String(required);
    host.dataset.collectedPerutos = "0";
  }
  updatePerutahHud({ requiredPerutos: required, collected: 0, globalCoins: readGlobalCoins() });
}

function postLocalReset(manager) {
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'main-reset-requested' });
  manager?.eved?.postMessage?.({ resetAfterSpikeDeath: { position: { x: -8, y: 5, z: 0 } } });
  document.getElementById("awtsmoos-css-spike-burst")?.remove();
  const veil = document.getElementById("awtsmoos-spike-reset-veil");
  if (veil) {
    veil.style.opacity = "0";
    veil.style.transition = "opacity .18s ease";
    setTimeout(() => veil.remove(), 190);
  }
}

function makeCssBurst() {
  if (document.getElementById("awtsmoos-css-spike-burst")) return;
  const host = document.createElement("div");
  host.id = "awtsmoos-css-spike-burst";
  host.style.cssText = "position:fixed;left:50%;top:45%;width:1px;height:1px;z-index:2147483646;pointer-events:none;contain:layout style paint;";
  document.body.appendChild(host);
  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const bit = document.createElement("i");
    const angle = (Math.PI * 2 * i) / count;
    const distance = 70 + (i % 4) * 26;
    const color = i % 2 ? "#ff3155" : "#ffd447";
    bit.style.cssText = `position:absolute;left:0;top:0;width:18px;height:18px;background:${color};opacity:.88;transform:translate(-9px,-9px) scale(1);border-radius:3px;transition:transform 520ms cubic-bezier(.14,.72,.26,1),opacity 520ms linear;will-change:transform,opacity;`;
    host.appendChild(bit);
    requestAnimationFrame(() => {
      bit.style.transform = `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance - 45}px) scale(.35) rotate(${i * 47}deg)`;
      bit.style.opacity = "0";
    });
  }
  setTimeout(() => host.remove(), 700);
}

function showSpikeResetOverlay(manager, data = {}) {
  makeCssBurst();
  let veil = document.getElementById("awtsmoos-spike-reset-veil");
  if (veil) return;
  console.info('B"H | SPIKE_RESET_TRACE', { stage: 'main-overlay-created', reason: data.reason, cssOnly: true });
  veil = document.createElement("div");
  veil.id = "awtsmoos-spike-reset-veil";
  veil.setAttribute("shaym", "awtsmoos-spike-reset-veil");
  veil.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.58);color:#fff;text-align:center;font-family:Arial,sans-serif;pointer-events:auto;touch-action:none;";
  veil.innerHTML = `<div style="padding:24px 30px;border:2px solid #ffcc55;border-radius:18px;background:rgba(20,0,0,.80);box-shadow:0 0 38px #f33"><div style="font-size:30px;margin-bottom:8px;color:#ffdd66">נפילה בקוצים</div><div style="font-size:20px;letter-spacing:1px">PRESS ANY KEY TO RESET</div><div style="font-size:13px;margin-top:8px;color:#ffd9d9">or click / tap — local reset</div></div>`;
  document.body.appendChild(veil);
  const reset = event => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    postLocalReset(manager);
  };
  window.addEventListener("keydown", reset, { once: true, capture: true });
  window.addEventListener("mousedown", reset, { once: true, capture: true });
  window.addEventListener("touchstart", reset, { once: true, capture: true, passive: false });
  veil.addEventListener("click", reset, { once: true });
  veil.addEventListener("touchstart", reset, { once: true, passive: false });
}

function floatingText(data = {}) {
  if (!data.text || data.effect === "spikeDeath") return;
  const el = document.createElement("div");
  el.textContent = data.text;
  el.style.cssText = `position:fixed;left:50%;top:34%;z-index:2147483646;transform:translate(-50%,-50%);font:bold 24px Arial;color:${data.color || "#fff"};text-shadow:0 0 12px #000;pointer-events:none;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function directFallback(manager, shaym, ob) {
  if (shaym === "levelGoal") setLevelGoal(ob);
  if (shaym === "perutahProgress") updatePerutahHud(ob);
  if (shaym === "effectsOverlay") {
    floatingText(ob);
    if (ob?.effect === "spikeDeath") showSpikeResetOverlay(manager, ob);
  }
}

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(data) { showSpikeResetOverlay(manager, data || {}); },
    spikeResetComplete(data) { console.info('B"H | SPIKE_RESET_TRACE', { stage: 'main-reset-complete', ok: data?.ok }); },

    hideLoadingScreen() {
      VeilController.lift();
      document.body.style.overflow = 'hidden';
    },

    increasedOlamLoading(data) {
      const { amount, action } = data || {};
      const percent = (amount || 0) + "%";
      manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } });
      const bar = document.getElementById('genesisProgressBar');
      if (bar) bar.style.width = percent;
      const textVessel = document.getElementById('genesisActionText') || document.querySelector('[shaym="action loading"]');
      if (textVessel && action) textVessel.textContent = action;
    },

    resetPercentage() {
      const bar = document.getElementById('genesisProgressBar');
      if (bar) bar.style.width = "0%";
    },

    sendUiEvent(data) {
      const { shaym, ob, id } = data || {};
      try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); }
      catch (error) { console.warn('B"H - UI peula fallback engaged', shaym, error); }
      directFallback(manager, shaym, ob);
      if (id && manager.eved) manager.eved.postMessage({ type: 'uiEvented', id });
    }
  };
}
