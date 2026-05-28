// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 13: UI events get a direct DOM fallback.
 *
 * The Awtsmoos sends sparks from the worker, but the old UI registry sometimes
 * misses a vessel name. This handler now still calls the sacred UI layer first,
 * then directly paints the HUD/reset veil for the tiny Level 1 pipeline.
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
  if (goal) goal.textContent = `Perutos: ${collected} / ${required}`;
  if (bar) bar.style.width = `${percent}%`;
  if (global) global.textContent = `Global: ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Gate ready — zing!" : `${data.funnyText || "Perutah ping!"} ${Math.max(0, required - collected)} left`;
}

function setLevelGoal(data = {}) {
  const host = q("gameHUD") || document.body;
  const required = numberFrom(data.requiredPerutos, 7) || 7;
  if (host.dataset) {
    host.dataset.requiredPerutos = String(required);
    host.dataset.collectedPerutos = "0";
  }
  updatePerutahHud({ requiredPerutos: required, collected: 0, globalCoins: readGlobalCoins(), funnyText: "Collect Perutos" });
}

function makeParticle(parent, text) {
  const el = document.createElement("div");
  el.className = "awtsmoos-reset-letter";
  el.textContent = text;
  el.style.cssText = `position:absolute;left:50%;top:50%;font-size:28px;color:#ffd45a;text-shadow:0 0 12px #f33;transform:translate(${Math.random()*520-260}px,${Math.random()*360-180}px) rotate(${Math.random()*720}deg);transition:opacity 1.2s, transform 1.2s;pointer-events:none;`;
  parent.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = "0"; el.style.transform += " scale(1.8)"; });
  setTimeout(() => el.remove(), 1400);
}

function showSpikeResetOverlay(data = {}) {
  let veil = q("awtsmoos-spike-reset-veil");
  if (veil) return;
  veil = document.createElement("div");
  veil.setAttribute("shaym", "awtsmoos-spike-reset-veil");
  veil.style.cssText = "position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,rgba(80,0,0,.45),rgba(0,0,0,.88));color:#fff;text-align:center;font-family:Arial,sans-serif;pointer-events:auto;";
  veil.innerHTML = `<div style="padding:30px 38px;border:2px solid #ffcc55;border-radius:22px;background:rgba(20,0,0,.72);box-shadow:0 0 45px #f33"><div style="font-size:44px;margin-bottom:10px;color:#ffdd66">נפילה בקוצים</div><div style="font-size:26px;letter-spacing:2px">PRESS ANY KEY TO RESET</div><div style="font-size:15px;margin-top:10px;color:#ffd9d9">or click / tap</div></div>`;
  document.body.appendChild(veil);
  "אבגדהוזחטיכלמנסעפצקרשת".split("").forEach(letter => makeParticle(veil, letter));
  const reset = () => location.href = `${location.pathname}?path=ladder-1.js&bh=reset-${Date.now()}`;
  window.addEventListener("keydown", reset, { once: true });
  window.addEventListener("mousedown", reset, { once: true });
  window.addEventListener("touchstart", reset, { once: true });
}

function floatingText(data = {}) {
  if (!data.text) return;
  const el = document.createElement("div");
  el.textContent = data.text;
  el.style.cssText = `position:fixed;left:50%;top:35%;z-index:999998;transform:translate(-50%,-50%);font:bold 26px Arial;color:${data.color || "#fff"};text-shadow:0 0 12px #000;pointer-events:none;`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function directFallback(shaym, ob) {
  if (shaym === "levelGoal") setLevelGoal(ob);
  if (shaym === "perutahProgress") updatePerutahHud(ob);
  if (shaym === "effectsOverlay") {
    floatingText(ob);
    if (ob?.effect === "spikeDeath") setTimeout(() => showSpikeResetOverlay(ob), numberFrom(ob.overlayDelayMs, 0));
  }
}

export default function uiHandlers(manager) {
  return {
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
      if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id);
      directFallback(shaym, ob);
      if (id && manager.eved) manager.eved.postMessage({ type: 'uiEvented', id });
    }
  };
}
