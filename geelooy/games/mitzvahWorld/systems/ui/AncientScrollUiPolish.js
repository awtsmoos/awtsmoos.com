// B"H
/**
 * @file AncientScrollUiPolish.js
 * @description
 * Ancient scroll UI, now split through dirty hashes, toast queue, and shlichus
 * book state. The Awtsmoos keeps the parchment beautiful and the DOM quiet.
 */
import { shouldRenderUi } from "./UiDirtyHashGuard.js?v=step-by-step-20260621-bh1";
import { scrollToast } from "./ScrollToastQueue.js?v=step-by-step-20260621-bh1";
import { setShlichusBookOpen, toggleShlichusBook, shlichusBookState } from "./ShlichusBookState.js?v=step-by-step-20260621-bh1";

const QUEST_IDS = new Set(["uiQuestTracker", "uiQuestMarkers", "uiQuestProgress"]);
const CENTER_IDS = new Set(["uiQuestPanel", "uiGossip", "uiLootWindow", "uiSpiritHealer"]);
function qs(id) { return document.getElementById(id); }
function make(tag, attrs = {}, html = "") { const el = document.createElement(tag); Object.assign(el, attrs); el.innerHTML = html; return el; }
function collapsed(el, yes = true) { el?.classList?.toggle("mitzvahCollapsed", yes); }

function installStyle() {
  if (qs("ancientScrollUiStyle")) return;
  document.head.appendChild(make("style", { id:"ancientScrollUiStyle" }, `
    #mitzvahUiBridge.scrollUiMode { font-family: Georgia, 'Times New Roman', serif; }
    .mitzvahPanel { background:radial-gradient(circle at 40% 0%, rgba(255,239,183,.93), rgba(166,112,55,.84) 52%, rgba(72,36,14,.86)) !important; color:#2a1708 !important; border:2px solid rgba(92,48,18,.75) !important; border-radius:14px !important; box-shadow:0 8px 26px rgba(0,0,0,.36), inset 0 0 24px rgba(255,246,190,.35) !important; max-width:min(430px,92vw) !important; max-height:min(58vh,520px) !important; overflow:auto !important; }
    .mitzvahPanelHead { color:#2a1708 !important; background:linear-gradient(90deg, rgba(88,45,17,.12), rgba(255,236,177,.38), rgba(88,45,17,.12)) !important; border-bottom:1px solid rgba(92,48,18,.35); }
    .mitzvahTitle, .mitzvahPanel strong, .mitzvahPanel small { color:#351d08 !important; }
    .mitzvahChoice, .mitzvahBtn { background:rgba(78,38,10,.12) !important; color:#251304 !important; border:1px solid rgba(74,38,14,.48) !important; }
    #mitzvahTopRight { width:auto !important; max-width:min(340px,42vw); pointer-events:none; }
    #mitzvahTopRight .mitzvahPanel:not(.scrollBookOpen) { display:none !important; }
    #uiQuestProgress { display:none !important; }
    #scrollBookButton { position:fixed; right:14px; top:14px; z-index:9200; pointer-events:auto; border-radius:999px; border:2px solid #6c3c17; background:linear-gradient(#f9e7ad,#b77a31); color:#2b1606; font:700 13px Georgia,serif; padding:9px 12px; box-shadow:0 5px 16px rgba(0,0,0,.35); }
    #scrollToastStack { position:fixed; left:50%; bottom:76px; transform:translateX(-50%); z-index:9300; pointer-events:none; display:flex; flex-direction:column; gap:7px; width:min(520px,88vw); align-items:center; }
    .scrollToast { background:linear-gradient(90deg, rgba(71,36,10,.9), rgba(245,218,146,.94), rgba(71,36,10,.9)); color:#251304; border:1px solid #6c3c17; border-radius:12px; padding:8px 12px; box-shadow:0 6px 18px rgba(0,0,0,.35); font:700 13px Georgia,serif; max-width:100%; animation:scrollToastIn .18s ease-out; }
    @keyframes scrollToastIn { from { opacity:0; transform:translateY(10px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
    #mitzvahCenter { width:min(460px,86vw) !important; max-height:76vh !important; }
    #mitzvahCenter .mitzvahPanel { max-height:76vh !important; }
  `));
}

function installBookButton() {
  if (qs("scrollBookButton")) return;
  const btn = make("button", { id:"scrollBookButton", type:"button", textContent:"📜 Shlichus" });
  btn.onclick = () => setShlichusBookOpen(true);
  document.body.appendChild(btn);
}

function polishPanel(el) {
  if (!el?.id || !el.classList?.contains("mitzvahPanel")) return;
  if (!shouldRenderUi(`polish:${el.id}`, el.textContent || el.innerHTML || "")) return;
  if (QUEST_IDS.has(el.id)) { collapsed(el, true); el.classList.remove("scrollBookOpen"); scrollToast(el.id === "uiQuestProgress" ? "Shlichus updated." : "Shlichus book updated. Open the scroll to review."); }
  if (CENTER_IDS.has(el.id)) el.classList.add("scrollBookOpen");
  el.querySelectorAll("button").forEach(b => b.setAttribute("type", "button"));
}

function observe() {
  const root = qs("mitzvahUiBridge");
  root?.classList?.add("scrollUiMode");
  const obs = new MutationObserver(records => records.forEach(r => r.addedNodes.forEach(n => { polishPanel(n); n.querySelectorAll?.(".mitzvahPanel")?.forEach(polishPanel); })));
  if (root) obs.observe(root, { childList:true, subtree:true });
  document.addEventListener("keydown", e => { if (e.code === "KeyL" && !e.metaKey && !e.ctrlKey) toggleShlichusBook(); if (e.code === "Escape") setShlichusBookOpen(false); });
  ["uiQuestTracker", "uiQuestMarkers", "uiQuestProgress"].forEach(id => polishPanel(qs(id)));
}

export function bootAncientScrollUi() {
  installStyle(); installBookButton(); observe();
  window.__AWTSMOOS_SCROLL_UI__ = { toast:scrollToast, toggleBook:toggleShlichusBook, openBook:setShlichusBookOpen, state:shlichusBookState, mode:"ancient-scroll-wow-shlichus", collapsible:true, transientUpdates:true, dirtyHash:true };
}
bootAncientScrollUi();
export default bootAncientScrollUi;
