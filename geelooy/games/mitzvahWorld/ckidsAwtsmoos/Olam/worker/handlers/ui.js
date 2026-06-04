// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 394: NPC UI becomes a sealed vessel, not a leaky veil.
 *
 * Every overlay listener now captures pointer/touch/mouse/click and calls the
 * full sealing triad: preventDefault, stopPropagation, stopImmediatePropagation.
 * The 3D world receives nothing while the menu is open. The level board now
 * lists all twenty existing JSON levels and launches them directly from the NPC.
 */
import VeilController from "../../uiManager/logic/VeilController.js";

const DIRECT = new Set(["openNpcChallengeOverlay", "openLevelSelect", "navigateLevel", "tzedakahBlessing"]);
const LEVELS = Object.freeze(Array.from({ length: 20 }, (_, i) => [`ladder-${i + 1}.json`, `Level ${i + 1}`]));
const LEVEL_BASE = "/games/mitzvahWorld/levels/ladder/data/";
const START_FEET = Object.freeze({ x: -10.5, y: 0.425, z: 0 });
const BAG_KEY = "awtsmoosMitzvahPersonalPerutas";
const CAPTURE_EVENTS = ["pointerdown", "pointerup", "click", "mousedown", "mouseup", "touchstart", "touchend"];
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const esc = s => String(s || "").replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&#39;" }[c]));
const q = name => document.querySelector(`[shaym="${name}"], [data-shaym="${name}"], #${name}, .${name}`);
const worker = manager => manager?.eved || window.mana?.socket?.eved || window.mana?.eved || null;

function sealEvent(event) { event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.(); }
function bindClick(el, fn) { if (!el) return; el.addEventListener("click", event => { sealEvent(event); fn(event); }, true); }
function sealDomIsland(root) { CAPTURE_EVENTS.forEach(type => root.addEventListener(type, event => { if (event.target === root && type === "click") return; sealEvent(event); }, true)); }
function oldPanels() { return ".premium-dialogue-container,[shaym='dialogue-vessel'],.npcChallengeOverlay,.npc-challenge-overlay,.challengeOverlay,#awtsmoos-npc-overlay,#awtsmoos-npc-shop,#inventoryScreen,.store-container,.bz-panel,.construction-screen"; }
function closeNpcOverlay(event) { sealEvent(event); document.querySelectorAll(oldPanels()).forEach(el => el.id === "inventoryScreen" || el.classList?.contains("store-container") ? el.classList.add("hidden") : el.remove()); }
function readBag() { try { return n(localStorage.getItem(BAG_KEY), 0); } catch { return 0; } }
function writeBag(value) { try { localStorage.setItem(BAG_KEY, String(Math.max(0, Math.floor(n(value))))); } catch {} }
function changeBag(delta, reason) { const value = Math.max(0, readBag() + n(delta)); writeBag(value); window.dispatchEvent(new CustomEvent("awtsmoosPersonalPerutas", { detail: { personalPerutas: value, delta, reason } })); return value; }
function send(inner) { const detail = { olamPeula: inner }; q("ikar")?.dispatchEvent(new CustomEvent("olamPeula", { bubbles: true, detail })); worker()?.postMessage?.(detail); }
function readGlobalCoins() { try { return n(localStorage.getItem("awtsmoosMitzvahGlobalCoins"), 0); } catch { return 0; } }
function writeGlobalCoins(value) { try { localStorage.setItem("awtsmoosMitzvahGlobalCoins", String(value)); } catch {} }
function hudHost() { return q("gameHUD") || document.body; }
function hudCard() { return q("hud-perutah-card") || document.querySelector(".desert-progress-card"); }
function hideHud(host = hudHost()) { const c = hudCard(); if (c) c.style.display = "none"; if (host?.dataset) { host.dataset.hidePerutahHud = "true"; host.dataset.requiredPerutos = "0"; } }
function showHud(host = hudHost()) { const c = hudCard(); if (c) c.style.display = "grid"; if (host?.dataset) host.dataset.hidePerutahHud = "false"; }
function mustHideHud(data = {}) { return data.hidePerutahHud === true || data.villageRay === true || !(Number(data.requiredPerutos) > 0); }
function lineHtml(lines = []) { return (Array.isArray(lines) ? lines : [lines]).slice(0, 4).map(line => `<p>${esc(line)}</p>`).join(""); }
function levelLabel(id, fallback) { const num = String(id).match(/ladder-(\d+)/)?.[1]; return num ? `${fallback} — ${id}` : fallback; }
function buttonsHtml() { return LEVELS.map(([id, label]) => `<button data-level-id="${esc(id)}" class="awts-npc-level-card"><strong>${esc(levelLabel(id, label))}</strong><span>Load JSON challenge</span></button>`).join(""); }
function clothing(item = {}) { return { className: "Apparel", quantity: 1, stackSize: 1, sellValue: item.sellValue || Math.max(1, Math.floor((item.price || 2) / 2)), ...item, isTintable: true }; }

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
  const ikar = q("ikar") || document.body.querySelector("[shaym='ikar']");
  if (!ikar) throw new Error("ikar element missing and manager unavailable");
  ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: clean, gameUiHTML: window.awtsmoosGameUI } }));
  return true;
}
function updatePerutahHud(data = {}) {
  const host = hudHost();
  if (mustHideHud(data)) return hideHud(host);
  showHud(host);
  const ds = host.dataset || (host.dataset = {});
  const required = n(data.requiredPerutos, 9);
  const collected = Number.isFinite(Number(data.collected)) ? Number(data.collected) : n(ds.collectedPerutos, 0) + n(data.added, 0);
  const globalCoins = Number.isFinite(Number(data.globalCoins)) ? Number(data.globalCoins) : readGlobalCoins() + n(data.globalAdded, 0);
  ds.requiredPerutos = String(required); ds.collectedPerutos = String(collected); writeGlobalCoins(globalCoins);
  const goal = q("hud-perutah-goal"), bar = q("hud-perutah-bar"), status = q("hud-perutah-status"), global = q("hud-global-coins");
  if (goal) goal.textContent = `${collected}/${required}`;
  if (bar) bar.style.width = `${Math.min(100, required ? collected / required * 100 : 0)}%`;
  if (global) global.textContent = `Global ${globalCoins}`;
  if (status) status.textContent = collected >= required ? "Tzedakah ready" : "Collect Perutos";
}
function setLevelGoal(data = {}) { if (mustHideHud(data)) return hideHud(); updatePerutahHud({ requiredPerutos: n(data.requiredPerutos, 9), collected: 0, globalCoins: readGlobalCoins(), reset: true }); }
function installNpcCss() {
  document.getElementById("awts-npc-ui-style")?.remove();
  const style = document.createElement("style"); style.id = "awts-npc-ui-style";
  style.textContent = `#awtsmoos-npc-overlay,#awtsmoos-npc-shop{position:fixed!important;inset:0!important;z-index:2147483400!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:calc(14px + env(safe-area-inset-top)) 14px calc(92px + env(safe-area-inset-bottom))!important;background:rgba(0,0,0,.42)!important;box-sizing:border-box!important;pointer-events:auto!important;overflow:hidden!important;touch-action:none!important}#awtsmoos-npc-overlay *,#awtsmoos-npc-shop *{box-sizing:border-box!important;pointer-events:auto!important;touch-action:manipulation!important}.awts-npc-card,.awts-shop-card{width:min(720px,calc(100vw - 28px))!important;max-height:min(700px,calc(100dvh - 126px))!important;overflow:auto!important;margin:0!important;padding:clamp(16px,4vw,22px)!important;border-radius:26px!important;border:3px solid #d7b665!important;background:linear-gradient(180deg,#fff9dc,#f2e5ad)!important;color:#1e1508!important;box-shadow:0 20px 60px rgba(0,0,0,.48)!important;font-family:Arial,sans-serif!important;text-align:left!important;-webkit-overflow-scrolling:touch!important}.awts-npc-title,.awts-shop-title{font:900 clamp(28px,7vw,42px)/1 Arial,sans-serif!important;margin:0 0 12px!important;color:#1b1205!important}.awts-npc-lines p{font:900 clamp(16px,4vw,22px)/1.25 Arial,sans-serif!important;margin:8px 0!important}.awts-npc-actions,.awts-shop-tabs{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;margin-top:16px!important}.awts-npc-level-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))!important;gap:10px!important;margin-top:14px!important}.awts-npc-btn,.awts-shop-btn,.awts-npc-level-card{min-height:58px!important;width:100%!important;border:0!important;border-radius:18px!important;color:#fff!important;font:900 clamp(15px,4.1vw,22px)/1 Arial,sans-serif!important}.awts-npc-level-card{display:grid!important;gap:4px!important;align-content:center!important;text-align:left!important;padding:12px!important;background:linear-gradient(135deg,#3c246e,#5b38ff)!important;border:2px solid rgba(255,255,255,.22)!important}.awts-npc-level-card span{font-size:12px!important;opacity:.82!important}.awts-close{background:#835b1b!important}.awts-primary{background:#5b38ff!important}.awts-shop-warm{background:#bf780d!important}.awts-shop-list{display:grid!important;gap:10px!important;margin-top:12px!important}.awts-shop-row{display:grid!important;grid-template-columns:54px minmax(0,1fr) 88px!important;gap:10px!important;align-items:center!important;background:#fffbe0!important;border:2px solid #d7aa45!important;border-radius:18px!important;padding:10px!important}.awts-shop-icon{font-size:32px!important;text-align:center!important}.awts-shop-row h3{margin:0!important;font-size:18px!important}.awts-shop-row p{margin:4px 0!important;font-size:13px!important}.awts-shop-price,.awts-shop-wallet{font-weight:900!important;color:#255d13!important}.awts-muted{font-weight:900!important;padding:20px!important;text-align:center!important}@media(max-width:390px){.awts-npc-actions,.awts-shop-tabs{grid-template-columns:1fr!important}.awts-shop-row{grid-template-columns:46px 1fr!important}.awts-shop-row button{grid-column:1/-1!important}}`;
  document.head.appendChild(style);
}
function openLevelSelect(manager, data = {}) { openNpcChallengeOverlay(manager, { ...data, title: data.title || "Choose Levels", lines: data.lines || ["Pick any challenge."], chooserOpen: true }); }
function openNpcChallengeOverlay(manager, data = {}) {
  closeNpcOverlay(); installNpcCss();
  const overlay = document.createElement("div"); overlay.id = "awtsmoos-npc-overlay"; overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true");
  const chooser = data.chooserOpen ? `<div class="awts-npc-level-grid">${buttonsHtml()}</div>` : "";
  const menu = data.chatOnly || data.chooserOpen ? "" : `<button data-npc-choose class="awts-npc-btn awts-primary">LEVELS</button><button data-npc-buy class="awts-npc-btn awts-shop-warm">BUY</button><button data-npc-sell class="awts-npc-btn awts-shop-warm">SELL</button>`;
  overlay.innerHTML = `<section class="awts-npc-card"><h2 class="awts-npc-title">${esc(data.title || data.fromNpc || "Village Guide")}</h2><div class="awts-npc-lines">${lineHtml(data.lines || [])}</div>${chooser}<div class="awts-npc-actions"><button data-npc-close class="awts-npc-btn awts-close">CLOSE</button>${menu}</div></section>`;
  document.body.appendChild(overlay); sealDomIsland(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeNpcOverlay(e); }, true);
  bindClick(overlay.querySelector("[data-npc-close]"), closeNpcOverlay);
  bindClick(overlay.querySelector("[data-npc-choose]"), () => openLevelSelect(manager, { title: data.selectorTitle || "NPC CHALLENGES", lines: data.lines }));
  bindClick(overlay.querySelector("[data-npc-buy]"), () => openShopOverlay(manager, data, "buy"));
  bindClick(overlay.querySelector("[data-npc-sell]"), () => openShopOverlay(manager, data, "sell"));
  overlay.querySelectorAll("[data-level-id]").forEach(btn => bindClick(btn, async () => { try { closeNpcOverlay(); await launchLevel(manager, btn.dataset.levelId); } catch (error) { console.error('B"H - NPC level launch failed', error); alert("Could not load that level yet."); } }));
}
function shopRows(data, mode) { const buy = data.shopInventory || data.items || [], sell = data.playerInventory || []; return mode === "sell" ? sell.map((item, index) => item && { ...item, index, type: "sell", price: item.sellValue || 1 }).filter(Boolean) : buy.map((item, index) => ({ ...item, index, type: "buy", price: item.price || item.sellValue || 1 })); }
function openShopOverlay(manager, data = {}, mode = "buy") { closeNpcOverlay(); installNpcCss(); const host = document.createElement("div"); host.id = "awtsmoos-npc-shop"; host.dataset.mode = mode; host.__awtsData = data; host.setAttribute("role", "dialog"); host.setAttribute("aria-modal", "true"); document.body.appendChild(host); sealDomIsland(host); renderShop(host, manager); }
function renderShop(host, manager) {
  const data = host.__awtsData || {}, mode = host.dataset.mode || "buy", rows = shopRows(data, mode);
  host.innerHTML = `<section class="awts-shop-card"><h2 class="awts-shop-title">${esc(data.npcName || data.fromNpc || "Guide")} Market</h2><div class="awts-shop-wallet">Bag: ${readBag()} perutas</div><div class="awts-shop-tabs"><button data-shop-tab="buy" class="awts-shop-btn ${mode === "buy" ? "awts-primary" : "awts-shop-warm"}">BUY</button><button data-shop-tab="sell" class="awts-shop-btn ${mode === "sell" ? "awts-primary" : "awts-shop-warm"}">SELL</button></div><div class="awts-shop-list">${rows.length ? rows.map(row => `<div class="awts-shop-row"><div class="awts-shop-icon">${esc(row.icon || "✦")}</div><div><h3>${esc(row.name || "Item")}</h3><p>${esc(row.description || "Colored clothing.")}</p><div class="awts-shop-price">${row.price} perutas</div></div><button data-shop-act="${row.type}" data-shop-index="${row.index}" class="awts-shop-btn awts-shop-warm">${row.type === "buy" ? "BUY" : "SELL"}</button></div>`).join("") : `<div class="awts-muted">Nothing here yet.</div>`}</div><div class="awts-npc-actions"><button data-shop-close class="awts-npc-btn awts-close">CLOSE</button><button data-shop-back class="awts-npc-btn awts-primary">BACK</button></div></section>`;
  bindClick(host.querySelector("[data-shop-close]"), closeNpcOverlay);
  bindClick(host.querySelector("[data-shop-back]"), () => openNpcChallengeOverlay(manager, data));
  host.querySelectorAll("[data-shop-tab]").forEach(btn => bindClick(btn, () => { host.dataset.mode = btn.dataset.shopTab; renderShop(host, manager); }));
  host.querySelectorAll("[data-shop-act]").forEach(btn => bindClick(btn, () => shopAction(host, Number(btn.dataset.shopIndex), btn.dataset.shopAct)));
}
function shopAction(host, index, act) { const data = host.__awtsData || {}, rows = shopRows(data, act === "sell" ? "sell" : "buy"), item = rows.find(row => row.index === index); if (!item) return; if (act === "buy") { if (readBag() < item.price) return alert("Not enough bag perutas."); changeBag(-item.price, "buy clothing"); send({ addItem: clothing(item) }); } if (act === "sell") { changeBag(item.price, "sell clothing"); send({ updateInventoryItem: { sourceType: "inventory", index: item.index, itemData: { ...item, quantity: 0 } } }); data.playerInventory[item.index] = null; } renderShop(host); }
function navigateLevel(manager, data = {}) { const next = String(data.next || data.path || "").trim().replace(/\.js$/i, ".json"); if (next) launchLevel(manager, next).catch(error => console.error('B"H - direct level navigation failed', error)); }
function dispatchInventory(ob = {}) { closeNpcOverlay(); window.dispatchEvent(new CustomEvent("awtsInventoryUpdate", { detail: ob })); document.getElementById("inventoryScreen")?.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles: true })); }
function tzedakahLetters(data = {}) { const msg = document.createElement("div"); msg.textContent = data.text || "צדקה תציל ממות — Giving opens the gate"; msg.style.cssText = "position:fixed;left:50%;top:32%;transform:translate(-50%,-50%);z-index:2147483647;font:bold 24px Arial;color:#ffd54a;text-align:center;text-shadow:0 0 18px #3cff86,0 0 10px #000;pointer-events:none;white-space:pre-line;"; document.body.appendChild(msg); setTimeout(() => msg.remove(), 1400); }
function postSpikeReset(manager) { worker(manager)?.postMessage?.({ resetAfterSpikeDeath: { position: START_FEET, forceRunMode: false, resetLevelCollectibles: true } }); }
function showSpikeResetOverlay(manager) { if (document.getElementById("awtsmoos-spike-reset-overlay")) return; const overlay = document.createElement("div"); overlay.id = "awtsmoos-spike-reset-overlay"; overlay.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(30,0,0,.82);display:grid;place-items:center;color:#fff;font-family:Arial;text-align:center;pointer-events:auto;"; overlay.innerHTML = `<div style="padding:24px;border-radius:28px;background:rgba(35,6,0,.72);border:3px solid #ffd260"><div style="font-size:34px">לבה!</div><div data-spike-reset-text>Tap or press any key to return</div><div data-spike-count style="font-size:72px;color:#ffd54a"></div></div>`; document.body.appendChild(overlay); sealDomIsland(overlay); const text = overlay.querySelector("[data-spike-reset-text]"), count = overlay.querySelector("[data-spike-count]"); let started = false; const start = e => { sealEvent(e); if (started) return; started = true; text.textContent = "Returning in..."; let left = 3; count.textContent = String(left); const timer = setInterval(() => { left -= 1; if (left <= 0) { clearInterval(timer); overlay.remove(); postSpikeReset(manager); return; } count.textContent = String(left); }, 700); }; overlay.addEventListener("pointerdown", start, { once: true, capture: true }); window.addEventListener("keydown", start, { once: true, capture: true }); }
function directFallback(manager, shaym, ob = {}) { if (shaym === "openNpcChallengeOverlay") openNpcChallengeOverlay(manager, ob); if (shaym === "openLevelSelect") openLevelSelect(manager, ob); if (shaym === "levelGoal") setLevelGoal(ob); if (shaym === "perutahProgress") updatePerutahHud(ob); if (shaym === "gameHUD") { if (ob.perutahProgress) updatePerutahHud(ob.perutahProgress); if (ob.personalPerutas) changeBag(ob.personalPerutas.personalDelta || 0, ob.personalPerutas.reason); } if (shaym === "inventoryScreen") dispatchInventory(ob); if (shaym === "storeScreen" && ob?.open) openShopOverlay(manager, ob.open, ob.open.mode || "buy"); if (shaym === "navigateLevel") navigateLevel(manager, ob); if (shaym === "tzedakahBlessing") tzedakahLetters(ob); if (shaym === "effectsOverlay" && ob?.effect === "spikeDeath") showSpikeResetOverlay(manager); if (shaym === "effectsOverlay" && ob?.effect === "tzedakahBlessing") tzedakahLetters(ob); }

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay() { showSpikeResetOverlay(manager); }, spikeResetComplete() {}, spikeEnableComplete() {},
    hideLoadingScreen() { VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data) { const percent = (data?.amount || 0) + "%"; manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } }); const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = percent; },
    resetPercentage() { const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) { const { shaym, ob, id } = data || {}; if (DIRECT.has(shaym)) directFallback(manager, shaym, ob); else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {} directFallback(manager, shaym, ob); } if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id }); }
  };
}
