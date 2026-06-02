// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 28: The Lava Pause Became A Gate.
 *
 * The Awtsmoos no longer flings the player back instantly after lava. The page
 * shows a clear molten veil, waits for any tap/key, counts down three breaths,
 * then asks the worker to return the Chossid to the authored starting platform.
 */
import VeilController from "../../uiManager/logic/VeilController.js";

const DIRECT_EVENTS = new Set(["openNpcChallengeOverlay", "openLevelSelect", "navigateLevel", "tzedakahBlessing"]);
const LADDER_LEVELS = Object.freeze([["ladder-1.json", "Level 1"], ["ladder-2.json", "Level 2"], ["ladder-3.json", "Level 3"], ["ladder-4.json", "Level 4"], ["ladder-5.json", "Level 5"]]);
const LEVEL_BASE = "/games/mitzvahWorld/levels/ladder/data/";
const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const q = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const esc = s => String(s || "").replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

function readGlobalCoins() { try { return n(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function hudHost() { return q("gameHUD") || q("desert-progress-card") || document.body; }
function closeNpcOverlay() { document.getElementById("awtsmoos-npc-overlay")?.remove(); }
function lineHtml(lines = []) { return (Array.isArray(lines) ? lines : [String(lines)]).slice(0, 3).map(line => `<p>${esc(line)}</p>`).join(""); }
function buttonsHtml() { return LADDER_LEVELS.map(([id, label]) => `<button data-level-id="${id}" style="padding:12px 14px;border:0;border-radius:14px;background:#5b3cff;color:white;font:inherit">${label}</button>`).join(""); }

async function fetchLevel(id) {
  const clean = String(id || "").trim().replace(/\.js$/i, ".json");
  const res = await fetch(LEVEL_BASE + encodeURIComponent(clean), { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not fetch ${clean}`);
  const data = await res.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Bad level ${clean}`);
  return { id: clean, data };
}

async function launchLevel(manager, id) {
  const { id: clean, data } = await fetchLevel(id);
  q("loading")?.classList.remove("hidden");
  const owner = manager?._managerOfAllWorlds || window.mana;
  if (owner?.startWorld) return Boolean(await owner.startWorld({ worldDayuh: data, sourcePath: clean, gameUiHTML: window.awtsmoosGameUI }) || true);
  const ikar = q("ikar") || document.getElementById("ikar") || document.body.querySelector("[shaym='ikar']");
  if (!ikar) throw new Error("ikar element missing and manager unavailable");
  ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: clean, gameUiHTML: window.awtsmoosGameUI } }));
  return true;
}

function updatePerutahHud(data = {}) {
  const host = hudHost();
  const ds = host.dataset || (host.dataset = {});
  const required = n(data.requiredPerutos ?? ds.requiredPerutos, 9) || 9;
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : n(ds.collectedPerutos, 0) + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + n(data.globalAdded, 0);
  ds.requiredPerutos = String(required); ds.collectedPerutos = String(collected); writeGlobalCoins(globalCoins);
  const goal = q("hud-perutah-goal"), bar = q("hud-perutah-bar"), status = q("hud-perutah-status"), global = q("hud-global-coins");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (bar) bar.style.width = `${Math.min(100, required ? collected / required * 100 : 0)}%`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Tzedakah ready" : "Collect Perutos";
}

function setLevelGoal(data = {}) {
  const host = hudHost();
  const ds = host.dataset || (host.dataset = {});
  ds.requiredPerutos = String(n(data.requiredPerutos, 9) || 9);
  ds.collectedPerutos = "0";
  updatePerutahHud({ requiredPerutos: ds.requiredPerutos, collected: 0, globalCoins: readGlobalCoins() });
}

function openLevelSelect(manager, data = {}) { openNpcChallengeOverlay(manager, { title: data.title || "Choose Levels", lines: ["Pick a challenge."], chooserOpen: true }); }
function openNpcChallengeOverlay(manager, data = {}) {
  closeNpcOverlay();
  const overlay = document.createElement("div");
  overlay.id = "awtsmoos-npc-overlay";
  overlay.style.cssText = "position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:2147483200;width:min(560px,92vw);font-family:Fredoka One,system-ui,sans-serif;color:#1f1508;pointer-events:auto;";
  const choose = data.chatOnly ? "" : `<button data-npc-choose style="flex:1;padding:13px 16px;border:0;border-radius:16px;background:#5b3cff;color:white;font:inherit;box-shadow:0 8px 22px rgba(0,0,0,.25)">Choose levels</button>`;
  const chooser = data.chooserOpen ? `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px">${buttonsHtml()}</div>` : "";
  overlay.innerHTML = `<div style="background:rgba(255,248,220,.96);border:3px solid rgba(96,66,25,.34);border-radius:22px;padding:16px 18px;box-shadow:0 16px 52px rgba(0,0,0,.34)"><div style="font-size:22px;margin-bottom:8px">${esc(data.title || data.fromNpc || "NPC")}</div><div style="font:600 15px/1.35 system-ui,sans-serif">${lineHtml(data.lines || [])}</div>${chooser}<div style="display:flex;gap:10px;margin-top:14px"><button data-npc-close style="padding:13px 16px;border:0;border-radius:16px;background:#76521e;color:white;font:inherit">Close</button>${choose}</div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector("[data-npc-close]")?.addEventListener("click", closeNpcOverlay);
  overlay.querySelector("[data-npc-choose]")?.addEventListener("click", () => openLevelSelect(manager, { title: data.selectorTitle || "NPC CHALLENGES" }));
  overlay.querySelectorAll("[data-level-id]").forEach(btn => btn.addEventListener("click", async () => { try { closeNpcOverlay(); await launchLevel(manager, btn.dataset.levelId); } catch (error) { console.error('B"H - NPC level launch failed', error); alert("Could not load that level yet."); } }));
}

function navigateLevel(manager, data = {}) { const next = String(data.next || data.path || "").trim().replace(/\.js$/i, ".json"); if (next) launchLevel(manager, next).catch(error => console.error('B"H - direct level navigation failed', error)); }
function dispatchInventory(ob = {}) { window.dispatchEvent(new CustomEvent("awtsInventoryUpdate", { detail: ob })); document.getElementById("inventoryScreen")?.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles: true })); }
function tzedakahLetters(data = {}) { const msg = document.createElement("div"); msg.textContent = data.text || "צדקה תציל ממות — Giving opens the gate"; msg.style.cssText = "position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:2147483647;font:bold 24px Arial;color:#ffd54a;text-align:center;text-shadow:0 0 18px #3cff86,0 0 10px #000;pointer-events:none;"; document.body.appendChild(msg); setTimeout(() => msg.remove(), 1400); }
function floatingText(data = {}) { if (!data.text || data.effect === "spikeDeath") return; const el = document.createElement("div"); el.textContent = data.text; el.style.cssText = `position:fixed;left:50%;top:34%;z-index:2147483646;transform:translate(-50%,-50%);font:bold 24px Arial;color:${data.color || "#fff"};text-shadow:0 0 12px #000;pointer-events:none;`; document.body.appendChild(el); setTimeout(() => el.remove(), 900); }

function postSpikeReset(manager) {
  manager?.eved?.postMessage?.({ resetAfterSpikeDeath: { position: START_FEET, forceRunMode: false, resetLevelCollectibles: true } });
}

function showSpikeResetOverlay(manager, data = {}) {
  if (document.getElementById("awtsmoos-spike-reset-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "awtsmoos-spike-reset-overlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at 50% 45%,rgba(255,215,80,.28),rgba(255,80,0,.5),rgba(20,0,0,.82));display:grid;place-items:center;color:#fff;font-family:Fredoka One,system-ui,sans-serif;text-align:center;text-shadow:0 4px 20px #000;pointer-events:auto;";
  overlay.innerHTML = `<div style="max-width:min(560px,90vw);padding:24px;border-radius:28px;background:rgba(35,6,0,.72);border:3px solid rgba(255,210,96,.72);box-shadow:0 20px 80px rgba(0,0,0,.55)"><div style="font-size:34px;margin-bottom:10px">לבה!</div><div data-spike-reset-text style="font:800 20px/1.35 system-ui,sans-serif">Tap or press any key to return</div><div data-spike-count style="font-size:72px;margin-top:14px;color:#ffd54a"></div></div>`;
  document.body.appendChild(overlay);
  const text = overlay.querySelector("[data-spike-reset-text]");
  const count = overlay.querySelector("[data-spike-count]");
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    text.textContent = "Returning in...";
    let left = 3;
    count.textContent = String(left);
    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) { clearInterval(timer); overlay.remove(); postSpikeReset(manager); return; }
      count.textContent = String(left);
    }, 700);
  };
  overlay.addEventListener("pointerdown", start, { once: true });
  window.addEventListener("keydown", start, { once: true });
}

function directFallback(manager, shaym, ob) {
  if (shaym === "openNpcChallengeOverlay") openNpcChallengeOverlay(manager, ob);
  if (shaym === "openLevelSelect") openLevelSelect(manager, ob);
  if (shaym === "levelGoal") setLevelGoal(ob);
  if (shaym === "perutahProgress") updatePerutahHud(ob);
  if (shaym === "inventoryScreen") dispatchInventory(ob);
  if (shaym === "navigateLevel") navigateLevel(manager, ob);
  if (shaym === "tzedakahBlessing") tzedakahLetters(ob);
  if (shaym === "effectsOverlay") { if (ob?.effect === "tzedakahBlessing") tzedakahLetters(ob); floatingText(ob); if (ob?.effect === "spikeDeath") showSpikeResetOverlay(manager, ob); }
}

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(data) { showSpikeResetOverlay(manager, data); },
    spikeResetComplete() {},
    spikeEnableComplete() {},
    hideLoadingScreen() { VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data) { const percent = (data?.amount || 0) + "%"; manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } }); const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = percent; const text = document.getElementById("genesisActionText") || document.querySelector('[shaym="action loading"]'); if (text && data?.action) text.textContent = data.action; },
    resetPercentage() { const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) { const { shaym, ob, id } = data || {}; if (DIRECT_EVENTS.has(shaym)) directFallback(manager, shaym, ob); else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch (error) { console.warn('B"H - UI peula fallback engaged', shaym, error); } directFallback(manager, shaym, ob); } if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id }); }
  };
}
