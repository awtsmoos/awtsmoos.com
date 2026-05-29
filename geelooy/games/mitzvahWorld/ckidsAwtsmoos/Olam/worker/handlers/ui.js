// B"H
/**
 * @module uiHandlers
 * @description Chapter 60: the charity box sings through Web Audio and throws
 * Hebrew letters like golden sparks before the mezuzah receives permission.
 */
import VeilController from "../../uiManager/logic/VeilController.js";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const q = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const hudHost = () => q("gameHUD") || q("desert-progress-card") || document.body;
const readGlobalCoins = () => { try { return n(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } };
const writeGlobalCoins = value => { try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} };

function updatePerutahHud(data = {}) {
  const host = hudHost(), ds = host.dataset || (host.dataset = {});
  const required = n(ds.requiredPerutos || data.requiredPerutos, 7) || 7;
  const old = n(ds.collectedPerutos, 0);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : old + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + n(data.globalAdded, 0);
  ds.requiredPerutos = String(required); ds.collectedPerutos = String(collected); writeGlobalCoins(globalCoins);
  const goal = q("hud-perutah-goal"), bar = q("hud-perutah-bar"), status = q("hud-perutah-status"), global = q("hud-global-coins");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (bar) bar.style.width = `${Math.min(100, required ? collected / required * 100 : 0)}%`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Tzedakah ready" : "Collect Perutos";
}

function setLevelGoal(data = {}) {
  const host = hudHost(), ds = host.dataset || (host.dataset = {});
  ds.requiredPerutos = String(n(data.requiredPerutos, 7) || 7); ds.collectedPerutos = "0";
  updatePerutahHud({ requiredPerutos: ds.requiredPerutos, collected: 0, globalCoins: readGlobalCoins() });
}

function navigateLevel(data = {}) {
  const next = String(data.next || data.path || "").trim().replace(/\.js$/i, ".json");
  if (!next) return;
  const url = new URL(window.location.href);
  url.searchParams.set("path", next);
  console.info('B"H | DOOR_NAV_TRACE', { next, href: url.href, source: data.source || "ui" });
  window.location.href = url.href;
}

function dispatchInventory(ob = {}) {
  window.dispatchEvent(new CustomEvent("awtsInventoryUpdate", { detail: ob }));
  document.getElementById("inventoryScreen")?.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles: true }));
}

function playTzedakahChord() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext, ctx = new Ctx();
    const master = ctx.createGain(); master.gain.value = 0.12; master.connect(ctx.destination);
    [392, 494, 587, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = i % 2 ? "triangle" : "sine"; osc.frequency.value = freq; gain.gain.value = 0;
      osc.connect(gain); gain.connect(master); osc.start(ctx.currentTime + i * 0.045);
      gain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + i * 0.045 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.05 + i * 0.08);
      osc.stop(ctx.currentTime + 1.35 + i * 0.08);
    });
    setTimeout(() => ctx.close?.(), 1700);
  } catch {}
}

function letterBit(text) {
  const bit = document.createElement("b"); bit.textContent = text;
  bit.style.cssText = "position:absolute;left:0;top:0;font:bold 26px Arial;color:#ffd54a;text-shadow:0 0 16px #3cff86,0 0 8px #000;opacity:.98;transform:translate(-12px,-12px) scale(1);transition:transform 1100ms cubic-bezier(.14,.72,.26,1),opacity 1100ms linear;will-change:transform,opacity;";
  return bit;
}

function tzedakahLetters(data = {}) {
  playTzedakahChord();
  const host = document.createElement("div"), letters = "צדקהתצילממותשערנפתח";
  host.style.cssText = "position:fixed;left:50%;top:43%;width:1px;height:1px;z-index:2147483646;pointer-events:none;contain:layout style paint;";
  document.body.appendChild(host);
  for (let i = 0; i < 44; i += 1) {
    const bit = letterBit(letters[i % letters.length]), angle = Math.PI * 2 * i / 44, distance = 70 + (i % 7) * 20;
    host.appendChild(bit);
    requestAnimationFrame(() => { bit.style.transform = `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance - 65}px) scale(.35) rotate(${i * 31}deg)`; bit.style.opacity = "0"; });
  }
  const msg = document.createElement("div"); msg.textContent = data.text || "צדקה תציל ממות — Giving opens the gate";
  msg.style.cssText = "position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:2147483647;font:bold 24px Arial;color:#ffd54a;text-align:center;text-shadow:0 0 18px #3cff86,0 0 10px #000;pointer-events:none;";
  document.body.appendChild(msg); setTimeout(() => { host.remove(); msg.remove(); }, 1400);
}

function finishCountdown(manager, veil) {
  manager?.eved?.postMessage?.({ enableAfterSpikeReset: { reason: "countdown-complete" } });
  if (!veil) return; veil.style.opacity = "0"; veil.style.transition = "opacity .18s ease"; setTimeout(() => veil.remove(), 190);
}

function startResetCountdown(manager) {
  const veil = document.getElementById("awtsmoos-spike-reset-veil"), text = veil?.querySelector?.("[data-spike-countdown]"), hint = veil?.querySelector?.("[data-spike-hint]");
  let count = 3; if (text) { text.hidden = false; text.textContent = String(count); } if (hint) hint.textContent = "Resetting fast…";
  const timer = setInterval(() => { count -= 1; if (text) text.textContent = count > 0 ? String(count) : "GO"; if (count <= 0) { clearInterval(timer); setTimeout(() => finishCountdown(manager, veil), 260); } }, 300);
}

function postLocalReset(manager) {
  const veil = document.getElementById("awtsmoos-spike-reset-veil"); if (veil?.dataset.resetting === "true") return; if (veil) veil.dataset.resetting = "true";
  manager?.eved?.postMessage?.({ resetAfterSpikeDeath: { position: { x: -8, y: 5, z: 0 }, keepColliderDisabled: true, forceRunMode: true, resetLevelCollectibles: true } });
  document.getElementById("awtsmoos-css-spike-burst")?.remove(); updatePerutahHud({ collected: 0, globalCoins: readGlobalCoins() }); startResetCountdown(manager);
}

function makeParticle(text) {
  const bit = document.createElement("i"); bit.textContent = text;
  bit.style.cssText = "position:absolute;left:0;top:0;font:bold 22px Arial;background:#ff5a18;color:#ffd447;padding:2px 5px;border-radius:3px;box-shadow:0 0 14px #ff2a00;opacity:.95;transform:translate(-9px,-9px) scale(1);transition:transform 720ms cubic-bezier(.14,.72,.26,1),opacity 720ms linear;will-change:transform,opacity;";
  return bit;
}

function makeCssBurst() {
  if (document.getElementById("awtsmoos-css-spike-burst")) return;
  const host = document.createElement("div"), letters = "אבטסמוסLAVA"; host.id = "awtsmoos-css-spike-burst";
  host.style.cssText = "position:fixed;left:50%;top:45%;width:1px;height:1px;z-index:2147483646;pointer-events:none;contain:layout style paint;"; document.body.appendChild(host);
  for (let i = 0; i < 32; i += 1) { const bit = makeParticle(letters[i % letters.length]), angle = Math.PI * 2 * i / 32, distance = 95 + (i % 5) * 32; host.appendChild(bit); requestAnimationFrame(() => { bit.style.transform = `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance - 55}px) scale(.25) rotate(${i * 47}deg)`; bit.style.opacity = "0"; }); }
  setTimeout(() => host.remove(), 850);
}

function showSpikeResetOverlay(manager, data = {}) { makeCssBurst(); if (document.getElementById("awtsmoos-spike-reset-veil")) return; setTimeout(() => installSpikeResetGate(manager, data), n(data.overlayDelayMs, 3000) || 3000); }
function installSpikeResetGate(manager, data = {}) {
  if (document.getElementById("awtsmoos-spike-reset-veil")) return;
  const veil = document.createElement("div"); veil.id = "awtsmoos-spike-reset-veil"; veil.setAttribute("shaym", "awtsmoos-spike-reset-veil");
  veil.style.cssText = "position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.58);color:#fff;text-align:center;font-family:Arial,sans-serif;pointer-events:auto;touch-action:none;";
  veil.innerHTML = `<div style="padding:24px 30px;border:2px solid #ffcc55;border-radius:18px;background:rgba(20,0,0,.84);box-shadow:0 0 38px #f33;max-width:88vw"><div style="font-size:30px;margin-bottom:8px;color:#ffdd66">${data.title || "LAVA HIT"}</div><div style="font-size:20px;letter-spacing:1px">HIT ANY KEY TO CONTINUE</div><div data-spike-countdown hidden style="font-size:54px;margin-top:12px;color:#76ff8a;line-height:1">3</div><div data-spike-hint style="font-size:13px;margin-top:8px;color:#ffd9d9">tap / click / key to reset</div></div>`;
  document.body.appendChild(veil); const reset = e => { e?.preventDefault?.(); e?.stopPropagation?.(); postLocalReset(manager); };
  window.addEventListener("keydown", reset, { once: true, capture: true }); window.addEventListener("mousedown", reset, { once: true, capture: true }); window.addEventListener("touchstart", reset, { once: true, capture: true, passive: false }); veil.addEventListener("click", reset, { once: true }); veil.addEventListener("touchstart", reset, { once: true, passive: false });
}

function floatingText(data = {}) {
  if (!data.text || data.effect === "spikeDeath") return;
  const el = document.createElement("div"); el.textContent = data.text;
  el.style.cssText = `position:fixed;left:50%;top:34%;z-index:2147483646;transform:translate(-50%,-50%);font:bold 24px Arial;color:${data.color || "#fff"};text-shadow:0 0 12px #000;pointer-events:none;`;
  document.body.appendChild(el); setTimeout(() => el.remove(), 900);
}

function directFallback(manager, shaym, ob) {
  if (shaym === "levelGoal") setLevelGoal(ob); if (shaym === "perutahProgress") updatePerutahHud(ob); if (shaym === "inventoryScreen") dispatchInventory(ob); if (shaym === "navigateLevel") navigateLevel(ob); if (shaym === "tzedakahBlessing") tzedakahLetters(ob);
  if (shaym === "effectsOverlay") { if (ob?.effect === "tzedakahBlessing") tzedakahLetters(ob); floatingText(ob); if (ob?.effect === "spikeDeath") showSpikeResetOverlay(manager, ob); }
}

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(data) { showSpikeResetOverlay(manager, data); }, spikeResetComplete() {}, spikeEnableComplete() {},
    hideLoadingScreen() { VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data) {
      const percent = (data?.amount || 0) + "%"; manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } });
      const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = percent;
      const text = document.getElementById("genesisActionText") || document.querySelector('[shaym="action loading"]'); if (text && data?.action) text.textContent = data.action;
    },
    resetPercentage() { const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) {
      const { shaym, ob, id } = data || {};
      try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch (error) { console.warn('B"H - UI peula fallback engaged', shaym, error); }
      directFallback(manager, shaym, ob); if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id });
    }
  };
}
