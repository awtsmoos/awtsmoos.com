// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 133: One NPC UI path only. Future AI: do not create another left-edge
 * dialogue card. Worker `sendUiEvent(openNpcChallengeOverlay)` owns the guide UI;
 * old `dialogue-vessel`, `premium-dialogue-container`, and hidden component
 * paths must be removed before this overlay opens.
 */
import VeilController from "../../uiManager/logic/VeilController.js";

const DIRECT = new Set(["openNpcChallengeOverlay", "openLevelSelect", "navigateLevel", "tzedakahBlessing"]);
const LEVELS = Object.freeze([["ladder-1.json", "Level 1"], ["ladder-2.json", "Level 2"], ["ladder-3.json", "Level 3"], ["ladder-4.json", "Level 4"], ["ladder-5.json", "Level 5"]]);
const LEVEL_BASE = "/games/mitzvahWorld/levels/ladder/data/";
const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const q = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const esc = s => String(s || "").replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));

function worker(manager) { return manager?.eved || window.mana?.socket?.eved || window.mana?.eved || null; }
function oldPanels() { return ".premium-dialogue-container,[shaym='dialogue-vessel'],.npcChallengeOverlay,.npc-challenge-overlay,.challengeOverlay,#awtsmoos-npc-overlay"; }
function closeNpcOverlay() { document.querySelectorAll(oldPanels()).forEach(el => el.remove()); }
function readGlobalCoins() { try { return n(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function hudHost() { return q("gameHUD") || q("desert-progress-card") || document.body; }
function lineHtml(lines = []) { return (Array.isArray(lines) ? lines : [lines]).slice(0, 3).map(line => `<p>${esc(line)}</p>`).join(""); }
function buttonsHtml() { return LEVELS.map(([id, label]) => `<button data-level-id="${id}" class="awts-npc-btn awts-primary">${label}</button>`).join(""); }
function shopPayload(data = {}, mode = "buy") { return { entityId: data.entityId || data.fromNpc || "Village Guide", npcName: data.npcName || data.fromNpc || "Village Guide", mode, items: data.shopInventory || [], playerInventory: [] }; }
function openStoreViaDom(data, mode) { closeNpcOverlay(); document.dispatchEvent(new CustomEvent("awtsmoosNpcShop", { detail: { open: shopPayload(data, mode) } })); }

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
  if (!data.reset && n(ds.perutahEpoch, 0) > 0 && n(data.perutahEpoch, -1) < n(ds.perutahEpoch, 0)) return;
  if (Number.isFinite(Number(data.perutahEpoch))) ds.perutahEpoch = String(Number(data.perutahEpoch));
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
  const host = hudHost(); const ds = host.dataset || (host.dataset = {});
  ds.requiredPerutos = String(n(data.requiredPerutos, 9) || 9); ds.collectedPerutos = "0"; ds.perutahEpoch = "0";
  updatePerutahHud({ requiredPerutos: ds.requiredPerutos, collected: 0, globalCoins: readGlobalCoins(), perutahEpoch: 0, reset: true });
}

function installNpcCss() {
  document.getElementById("awts-npc-ui-style")?.remove();
  const style = document.createElement("style");
  style.id = "awts-npc-ui-style";
  style.textContent = `#awtsmoos-npc-overlay{position:fixed!important;inset:0!important;z-index:2147483400!important;display:grid!important;place-items:center!important;padding:calc(14px + env(safe-area-inset-top)) 14px calc(88px + env(safe-area-inset-bottom))!important;box-sizing:border-box!important;background:rgba(0,0,0,.28)!important;pointer-events:auto!important;overflow:hidden!important}#awtsmoos-npc-overlay *{box-sizing:border-box!important}#awtsmoos-npc-overlay .awts-npc-card{width:min(640px,calc(100vw - 28px))!important;max-height:calc(100dvh - 132px)!important;overflow:auto!important;margin:0!important;padding:18px!important;border-radius:26px!important;border:3px solid #d7b665!important;background:linear-gradient(180deg,#fff9d8,#f1e4ab)!important;color:#1e1508!important;box-shadow:0 20px 60px rgba(0,0,0,.46)!important;font-family:Fredoka One,Arial,sans-serif!important;text-align:left!important}.awts-npc-title{font-size:clamp(26px,7vw,40px)!important;line-height:1!important;margin:0 0 12px!important}.awts-npc-lines p{font:900 clamp(16px,4.2vw,22px)/1.25 Arial,sans-serif!important;margin:10px 0!important}.awts-npc-actions,.awts-npc-level-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin-top:14px!important}.awts-npc-btn{min-height:58px!important;width:100%!important;border:0!important;border-radius:18px!important;color:#fff!important;font:900 clamp(16px,4.3vw,23px)/1 Arial,sans-serif!important;letter-spacing:.2px!important;touch-action:manipulation!important}.awts-close{background:#835b1b!important}.awts-primary{background:#5b38ff!important}.awts-shop{background:#bf780d!important}@media(max-width:360px){.awts-npc-actions,.awts-npc-level-grid{grid-template-columns:1fr!important}}`;
  document.head.appendChild(style);
}

function openLevelSelect(manager, data = {}) { openNpcChallengeOverlay(manager, { ...data, title: data.title || "Choose Levels", lines: data.lines || ["Pick a challenge."], chooserOpen: true }); }
function openNpcChallengeOverlay(manager, data = {}) {
  closeNpcOverlay(); installNpcCss();
  const overlay = document.createElement("div");
  overlay.id = "awtsmoos-npc-overlay";
  const chooser = data.chooserOpen ? `<div class="awts-npc-level-grid">${buttonsHtml()}</div>` : "";
  const menu = data.chatOnly || data.chooserOpen ? "" : `<button data-npc-choose class="awts-npc-btn awts-primary">LEVELS</button><button data-npc-buy class="awts-npc-btn awts-shop">BUY</button><button data-npc-sell class="awts-npc-btn awts-shop">SELL</button>`;
  overlay.innerHTML = `<section class="awts-npc-card"><h2 class="awts-npc-title">${esc(data.title || data.fromNpc || "Village Guide")}</h2><div class="awts-npc-lines">${lineHtml(data.lines || [])}</div>${chooser}<div class="awts-npc-actions"><button data-npc-close class="awts-npc-btn awts-close">CLOSE</button>${menu}</div></section>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("pointerdown", e => { if (e.target === overlay) closeNpcOverlay(); }, { passive: true });
  overlay.querySelector("[data-npc-close]")?.addEventListener("click", closeNpcOverlay);
  overlay.querySelector("[data-npc-choose]")?.addEventListener("click", () => openLevelSelect(manager, { title: data.selectorTitle || "NPC CHALLENGES", lines: data.lines }));
  overlay.querySelector("[data-npc-buy]")?.addEventListener("click", () => openStoreViaDom(data, "buy"));
  overlay.querySelector("[data-npc-sell]")?.addEventListener("click", () => openStoreViaDom(data, "sell"));
  overlay.querySelectorAll("[data-level-id]").forEach(btn => btn.addEventListener("click", async () => { try { closeNpcOverlay(); await launchLevel(manager, btn.dataset.levelId); } catch (error) { console.error('B"H - NPC level launch failed', error); alert("Could not load that level yet."); } }));
}

function navigateLevel(manager, data = {}) { const next = String(data.next || data.path || "").trim().replace(/\.js$/i, ".json"); if (next) launchLevel(manager, next).catch(error => console.error('B"H - direct level navigation failed', error)); }
function dispatchInventory(ob = {}) { window.dispatchEvent(new CustomEvent("awtsInventoryUpdate", { detail: ob })); document.getElementById("inventoryScreen")?.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles: true })); }
function tzedakahLetters(data = {}) { const msg = document.createElement("div"); msg.textContent = data.text || "צדקה תציל ממות — Giving opens the gate"; msg.style.cssText = "position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:2147483647;font:bold 24px Arial;color:#ffd54a;text-align:center;text-shadow:0 0 18px #3cff86,0 0 10px #000;pointer-events:none;white-space:pre-line;"; document.body.appendChild(msg); setTimeout(() => msg.remove(), 1400); }
function postSpikeReset(manager) { worker(manager)?.postMessage?.({ resetAfterSpikeDeath: { position: START_FEET, forceRunMode: false, resetLevelCollectibles: true } }); }
function showSpikeResetOverlay(manager) { if (document.getElementById("awtsmoos-spike-reset-overlay")) return; const overlay = document.createElement("div"); overlay.id = "awtsmoos-spike-reset-overlay"; overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(30,0,0,.82);display:grid;place-items:center;color:#fff;font-family:Fredoka One,system-ui;text-align:center;pointer-events:auto;"; overlay.innerHTML = `<div style="padding:24px;border-radius:28px;background:rgba(35,6,0,.72);border:3px solid #ffd260"><div style="font-size:34px">לבה!</div><div data-spike-reset-text>Tap or press any key to return</div><div data-spike-count style="font-size:72px;color:#ffd54a"></div></div>`; document.body.appendChild(overlay); const text = overlay.querySelector("[data-spike-reset-text]"); const count = overlay.querySelector("[data-spike-count]"); let started = false; const start = () => { if (started) return; started = true; text.textContent = "Returning in..."; let left = 3; count.textContent = String(left); const timer = setInterval(() => { left -= 1; if (left <= 0) { clearInterval(timer); overlay.remove(); postSpikeReset(manager); return; } count.textContent = String(left); }, 700); }; overlay.addEventListener("pointerdown", start, { once: true }); window.addEventListener("keydown", start, { once: true }); }
function directFallback(manager, shaym, ob) { if (shaym === "openNpcChallengeOverlay") openNpcChallengeOverlay(manager, ob); if (shaym === "openLevelSelect") openLevelSelect(manager, ob); if (shaym === "levelGoal") setLevelGoal(ob); if (shaym === "perutahProgress") updatePerutahHud(ob); if (shaym === "inventoryScreen") dispatchInventory(ob); if (shaym === "storeScreen" && ob?.open) openStoreViaDom(ob.open, ob.open.mode || "buy"); if (shaym === "navigateLevel") navigateLevel(manager, ob); if (shaym === "tzedakahBlessing") tzedakahLetters(ob); if (shaym === "effectsOverlay" && ob?.effect === "spikeDeath") showSpikeResetOverlay(manager); if (shaym === "effectsOverlay" && ob?.effect === "tzedakahBlessing") tzedakahLetters(ob); }

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay() { showSpikeResetOverlay(manager); }, spikeResetComplete() {}, spikeEnableComplete() {},
    hideLoadingScreen() { VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data) { const percent = (data?.amount || 0) + "%"; manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } }); const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = percent; },
    resetPercentage() { const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) { const { shaym, ob, id } = data || {}; if (DIRECT.has(shaym)) directFallback(manager, shaym, ob); else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {} directFallback(manager, shaym, ob); } if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id }); }
  };
}
