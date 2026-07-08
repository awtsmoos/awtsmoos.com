// B"H
/** @file index.js @description Worker game UI roots with viewport-aware mobile controls. */
import hud from "./hud.js?compact=true&v=mission-card-ui-20260610-bh711";
import missionCard from "./missionCard.js?compact=true&v=village-polish-20260612-bh810";
import unitFrames from "./unitFrames.js?compact=true&v=mobile-target-safe-area-20260706-bh1";
import settingsPanel from "./settingsPanel.js?compact=true&v=player-probe-copy-20260701-bh1";
import effectsOverlay from "../components/effectsOverlay.js?compact=true&v=ray-ground-ui-20260602-bh126";
import joystick from "../joystick.js?compact=true&v=solid-browser-verify-20260702-bh8";
import ActionBar from "./actionBar.js?compact=true&v=solid-browser-verify-20260702-bh8";
import InventoryScreen from "./inventory/index.js?compact=true&v=ray-ground-ui-20260602-bh126";
import InventoryStyle from "./inventory/style.js?compact=true&v=mobile-icon-grid-20260706-bh1";
import storeScreen from "../screens/storeScreen.js?compact=true&v=shop-stock-mobile-grid-20260706-bh1";
import npcGuideOverlay from "./npcGuideOverlay.js?compact=true&v=ui-glass-click-proof-20260603-bh366";
import dialogues from "./dialogues.js?compact=true&v=village-combat-20260611-bh805";
import { Toast } from "./components/Toast.js?compact=true&v=ray-ground-ui-20260602-bh126";
import { InteractionPrompt } from "./components/InteractionPrompt.js?compact=true&v=ray-ground-ui-20260602-bh126";
import { PerutahProgress } from "./perutahProgress.js?compact=true&v=village-hud-born-hidden-20260603-bh366";

const sideRoots = ["torahSkills","torahSpellbook","knowledgeMenu","skillBar","torahCodex","objectiveProgress","torahActionBar","macroPanel","farmPanel","combatLog","questTracker","chatPanel","mapReveal","minimap","carcassPanel","lootSparkle","loot","bagState"];
const isMobileLike = () => {
  if (typeof window === "undefined") return /Mobile|Android|iPhone|iPad|iPod/i.test(globalThis.navigator?.userAgent || "");
  const ua = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  const media = window.matchMedia?.("(max-width:820px), (max-height:720px), (pointer:coarse), (hover:none)")?.matches;
  return Boolean(ua || media || window.innerWidth <= 820 || window.innerHeight <= 720);
};
const root = shaym => document.querySelector(`[shaym="${shaym}"]`);
const payload = event => event && typeof event === "object" && "detail" in event ? event.detail || {} : event || {};
const esc = (value, fallback = "") => String(value ?? fallback).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" }[ch]));
const ratio = (hp, maxHp) => Math.max(0, Math.min(1, Number(hp || 0) / Math.max(1, Number(maxHp || 1))));
const setText = (box, selector, value) => { const el = box?.querySelector?.(selector); if (el) el.textContent = value; };
const setScale = (box, selector, value) => { const el = box?.querySelector?.(selector); if (el) el.style.transform = `scaleX(${Math.max(0, Math.min(1, Number(value) || 0))})`; };
const labelFrom = shaym => shaym.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase());
const plateHtml = p => `<div class="nameplate-item"><span>${esc(p.name || p.species, "Target")}</span><div class="nameplate-hp"><div class="nameplate-hp-fill" style="transform:scaleX(${ratio(p.hp ?? p.currentHp, p.maxHp ?? p.max)})"></div></div></div>`;

function updateNameplates(input) {
  const d = payload(input), box = root("nameplates"), list = box?.querySelector?.(".nameplate-list") || box;
  if (!list) return;
  const plates = Array.isArray(d.plates) ? d.plates : d.target ? [d.target] : d.name || d.species ? [d] : [];
  list.innerHTML = plates.slice(0, 6).map(plateHtml).join("");
}
function updatePlayerProgress(input) {
  const d = payload(input), box = root("playerProgress"), p = d.player || d;
  if (!box) return;
  setText(box, ".progress-row.level", `Level ${esc(p.level, 1)}`);
  setText(box, ".progress-detail", `${esc(p.xp ?? p.experience ?? 0)} XP`);
  setScale(box, ".progress-fill", p.percent ?? p.progress ?? p.xpPercent ?? 0);
}
function updateSimplePanel(shaym, input, fallbackTitle = labelFrom(shaym)) {
  const d = payload(input), box = root(shaym);
  if (!box) return;
  const title = d.title || d.name || d.category || fallbackTitle, body = d.text || d.message || d.description || d.hint || d.status || d.label || "";
  const items = Array.isArray(d.items) ? d.items.slice(0, 8).map(item => `<li>${esc(item?.name || item?.title || item)}</li>`).join("") : "";
  box.innerHTML = body || items ? `<strong>${esc(title)}</strong>${body ? `<span>${esc(body)}</span>` : ""}${items ? `<ul>${items}</ul>` : ""}` : "";
  box.classList.toggle("empty", !(body || items));
}
function updateFloatingCombatText(input) {
  const d = payload(input), box = root("floatingCombatText"), text = d.text || d.amount || d.message || d.value || "";
  if (!box || !text) return;
  const item = document.createElement("div");
  item.className = "floating-combat-item";
  item.textContent = text;
  box.appendChild(item);
  setTimeout(() => item.remove(), 1600);
  while (box.children.length > 8) box.firstElementChild?.remove();
}

const styleText = `.mobile-feature-roots{position:fixed;inset:0;pointer-events:none;z-index:24010;font-family:Arial,sans-serif}.mobile-feature-roots .empty{display:none!important}.mobile-nameplates{position:absolute;left:50%;top:20%;transform:translateX(-50%);display:flex;flex-direction:column;gap:4px;align-items:center}.nameplate-item{min-width:112px;max-width:190px;padding:3px 7px;border-radius:999px;background:rgba(8,10,13,.72);border:1px solid rgba(255,221,120,.5);box-shadow:0 4px 12px rgba(0,0,0,.35);color:#fff8ce;font-size:11px;text-align:center}.nameplate-hp{height:4px;margin-top:2px;border-radius:999px;background:#210707;overflow:hidden}.nameplate-hp-fill{height:100%;background:linear-gradient(90deg,#8b1717,#ff6a4d);transform-origin:left center}.mobile-player-progress{position:absolute;left:8px;top:76px;width:210px;padding:6px 8px;border-radius:12px;background:rgba(8,12,20,.72);border:1px solid rgba(105,230,255,.35);color:#dff8ff;font-size:10px;box-shadow:0 5px 15px rgba(0,0,0,.34)}.progress-title{font-weight:900;color:#fff4b7}.progress-row{margin-top:2px}.progress-bar{height:6px;background:#071421;border-radius:999px;overflow:hidden;margin-top:3px}.progress-fill{height:100%;background:linear-gradient(90deg,#1f92ff,#78ffff);transform-origin:left center;transform:scaleX(0)}.mobile-side-panel{position:absolute;right:8px;top:94px;max-width:210px;padding:7px 9px;border-radius:12px;background:rgba(5,9,18,.78);border:1px solid rgba(255,224,138,.36);color:#fff7d0;font-size:10px;box-shadow:0 5px 15px rgba(0,0,0,.35)}.mobile-side-panel span{display:block;margin-top:2px;color:#d9f7ff}.mobile-side-panel ul{margin:3px 0 0 14px;padding:0}.tutorial-hint{position:absolute;left:50%;bottom:94px;transform:translateX(-50%);max-width:320px;padding:8px 11px;border-radius:15px;background:rgba(8,12,28,.84);border:1px solid rgba(105,240,255,.5);color:#fff;font-size:12px;text-align:center;box-shadow:0 5px 18px rgba(0,0,0,.35)}.mobile-cast-bar{position:absolute;left:50%;top:34%;transform:translateX(-50%);min-width:160px;height:13px;border-radius:999px;background:rgba(0,0,0,.6);border:1px solid rgba(255,230,150,.5)}.floating-combat-text{position:absolute;left:50%;top:42%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:3px}.floating-combat-item{font:900 18px/1 Arial,sans-serif;color:#ffe76b;text-shadow:0 2px 5px #000;animation:awtsFloatHit 1.55s ease-out forwards}@keyframes awtsFloatHit{0%{opacity:0;transform:translateY(12px) scale(.8)}15%{opacity:1}100%{opacity:0;transform:translateY(-48px) scale(1.12)}}@media(max-width:720px){.mobile-player-progress{top:66px;width:150px;font-size:9px;opacity:.88}.mobile-nameplates{top:18%}.nameplate-item{font-size:10px;min-width:92px}.mobile-side-panel{top:82px;max-width:150px;font-size:9px}.tutorial-hint{bottom:86px;max-width:245px;font-size:11px}}`;
const rootChildren = [{ shaym:"nameplates", className:"nameplates mobile-nameplates", children:[{ className:"nameplate-list" }] }, { shaym:"playerProgress", className:"player-progress mobile-player-progress", children:[{ className:"progress-title", textContent:"Progress" }, { className:"progress-row level", textContent:"Level 1" }, { className:"progress-bar", children:[{ className:"progress-fill" }] }, { className:"progress-detail", textContent:"0 XP" }] }, ...sideRoots.map(shaym => ({ shaym, className:`mobile-side-panel ${shaym} empty` })), { shaym:"tutorialHint", className:"mobile-bottom-hint tutorial-hint empty" }, { shaym:"targetCastBar", className:"mobile-cast-bar empty" }, { shaym:"castBar", className:"mobile-cast-bar empty" }, { shaym:"floatingCombatText", className:"floating-combat-text" }, { tag:"style", innerHTML:styleText }];
const handlers = Object.fromEntries(sideRoots.map(shaym => [shaym, e => updateSimplePanel(shaym, e)]));
const MobileFeatureRoots = { shaym:"mobileFeatureRoots", className:"mobile-feature-roots", children:rootChildren, on:{ ...handlers, tutorialHint:e => updateSimplePanel("tutorialHint", e, "Hint"), targetCastBar:e => updateSimplePanel("targetCastBar", e, "Casting"), castBar:e => updateSimplePanel("castBar", e, "Casting"), nameplates:updateNameplates, playerProgress:updatePlayerProgress, floatingCombatText:updateFloatingCombatText, gameHUD(e) { const d = payload(e); if (d.nameplates) updateNameplates(d.nameplates); if (d.playerProgress || d.progress) updatePlayerProgress(d.playerProgress || d.progress); } } };
const vessels = [hud, unitFrames, MobileFeatureRoots, missionCard, PerutahProgress, ActionBar, settingsPanel, InventoryStyle, InventoryScreen, storeScreen, npcGuideOverlay, ...dialogues, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike()) vessels.push(...joystick);
export default vessels;
