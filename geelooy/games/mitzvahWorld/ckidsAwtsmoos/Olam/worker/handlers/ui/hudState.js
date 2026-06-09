// B"H
/**
 * @file hudState.js
 * @description
 * Chapter 161: Coins, goals, and sparks are counted without vanity. The
 * Awtsmoos lets the HUD appear only where a level truly needs perutah progress.
 */
import { n, q } from "./domKit.js";
const BAG_KEY = "awtsmoosMitzvahPersonalPerutas";
export const readBag = () => { try { return n(localStorage.getItem(BAG_KEY), 0); } catch { return 0; } };
export const writeBag = value => { try { localStorage.setItem(BAG_KEY, String(Math.max(0, Math.floor(n(value))))); } catch {} };
export function changeBag(delta, reason) {
  const value = Math.max(0, readBag() + n(delta));
  writeBag(value);
  window.dispatchEvent(new CustomEvent("awtsmoosPersonalPerutas", { detail: { personalPerutas: value, delta, reason } }));
  return value;
}
function readGlobalCoins() { try { return n(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function hudHost() { return q("gameHUD") || document.body; }
function hudCard() { return q("hud-perutah-card") || document.querySelector(".desert-progress-card"); }
function hideHud(host = hudHost()) { const c = hudCard(); if (c) c.style.display = "none"; if (host?.dataset) { host.dataset.hidePerutahHud = "true"; host.dataset.requiredPerutos = "0"; } }
function showHud(host = hudHost()) { const c = hudCard(); if (c) c.style.display = "grid"; if (host?.dataset) host.dataset.hidePerutahHud = "false"; }
function mustHideHud(data = {}) { return data.hidePerutahHud === true || data.villageRay === true || !(Number(data.requiredPerutos) > 0); }
export function updatePerutahHud(data = {}) {
  const host = hudHost();
  if (mustHideHud(data)) return hideHud(host);
  showHud(host);
  const ds = host.dataset || (host.dataset = {}), required = n(data.requiredPerutos, 9);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : n(ds.collectedPerutos, 0) + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + n(data.globalAdded, 0);
  ds.requiredPerutos = String(required); ds.collectedPerutos = String(collected); writeGlobalCoins(globalCoins);
  q("hud-perutah-goal") && (q("hud-perutah-goal").textContent = `${collected}/${required}`);
  q("hud-perutah-bar") && (q("hud-perutah-bar").style.width = `${Math.min(100, required ? collected / required * 100 : 0)}%`);
  q("hud-global-coins") && (q("hud-global-coins").textContent = `Global ${globalCoins}`);
  q("hud-perutah-status") && (q("hud-perutah-status").textContent = collected >= required ? "Tzedakah ready" : "Collect Perutos");
}
export function setLevelGoal(data = {}) { if (mustHideHud(data)) return hideHud(); updatePerutahHud({ requiredPerutos: n(data.requiredPerutos, 9), collected: 0, globalCoins: readGlobalCoins(), reset: true }); }
