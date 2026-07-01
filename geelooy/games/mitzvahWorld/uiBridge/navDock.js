// B"H
/**
 * @file navDock.js
 * @description Permanent large action dock and late UI sizing rules.
 *
 * B"H — the dock is a ladder, not a flood. On phones it rises above the hotbar
 * and shrinks into four clean columns so CLEAR no longer crushes the vessel.
 */
import { clearCenter, closePanel } from "./domCore.js";
import { olamOf } from "./worldMarkers.js";

const ACTIONS = [
  ["strike", "STRIKE", "V", o => o?.ayshPeula?.("combatAttack", { source:"dock", allowAutoFace:true, preferMelee:true, allowAutoTarget:true })],
  ["talk", "TALK / INTERACT", "F", o => o?.ayshPeula?.("interact", { source:"dock" })],
  ["bag", "BAG", "B", o => o?.ayshPeula?.("openBag")],
  ["quests", "QUESTS", "L", o => o?.ayshPeula?.("openMissionLog")],
  ["map", "MAP / FPS", "M", o => o?.ayshPeula?.("toggleFPS")],
  ["loot", "LOOT", "G", () => globalThis.__MITZVAH_LOOT_NEAREST_CARCASS__?.()],
  ["return", "RETURN", "R", o => o?.ayshPeula?.("returnVillage")],
  ["clear", "CLEAR", "ESC", () => closeAllPanels()]
];

function toast(text) {
  olamOf(globalThis)?.ayshPeula?.("ui event", "effectsOverlay", { text, color:"#ffe680", source:"dock" });
}

function injectLateStyles() {
  if (document.getElementById("mitzvahDockLateStyles")) return;
  const style = document.createElement("style");
  style.id = "mitzvahDockLateStyles";
  style.textContent = `#mitzvahActionDock{position:fixed!important;left:50%!important;bottom:calc(14px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%)!important;z-index:9500!important;width:min(1060px,calc(100vw - 24px))!important;display:grid!important;grid-template-columns:repeat(8,minmax(82px,1fr))!important;gap:8px!important;pointer-events:none!important}.mitzvahDockButton{pointer-events:auto!important;min-height:58px!important;border:2px solid rgba(255,226,122,.72)!important;border-radius:8px!important;color:#fff8d5!important;background:linear-gradient(180deg,rgba(29,78,216,.92),rgba(12,18,31,.96))!important;font:950 13px/1.05 Inter,system-ui,sans-serif!important;text-align:center!important;padding:8px 7px!important}.mitzvahDockButton kbd{display:block!important;margin-top:3px!important;padding:3px 5px!important;border-radius:5px!important;background:#05070b!important;color:#9fffd0!important}.mitzvahPanel{font-size:12px!important;line-height:1.32!important;border-radius:8px!important;padding:9px 11px!important}.mitzvahMini{width:32px!important;height:32px!important;border-radius:8px!important}.mitzvahChoice,.mitzvahBtn{min-height:44px!important;font-size:14px!important;padding:12px 14px!important;border-radius:8px!important;font-weight:850!important}@media(max-width:840px){#mitzvahActionDock{bottom:calc(138px + env(safe-area-inset-bottom,0px))!important;width:min(94vw,520px)!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}.mitzvahDockButton{min-height:48px!important;font-size:12px!important;padding:7px 6px!important}#mitzvahBottomCenter{bottom:calc(150px + env(safe-area-inset-bottom,0px))!important;width:min(94vw,520px)!important}}`;
  document.head.appendChild(style);
}

export function closeAllPanels() {
  clearCenter();
  ["uiGossip", "uiQuestPanel", "uiLootWindow", "uiSpiritHealer"].forEach(closePanel);
  toast("UI CLEARED");
}

function run(action) {
  try {
    const result = action[3](olamOf(globalThis));
    toast(`${action[1]} READY`);
    return result;
  } catch (error) {
    toast(`${action[1]} FAILED`);
    throw error;
  }
}

export function installNavDock() {
  injectLateStyles();
  let dock = document.getElementById("mitzvahActionDock");
  if (!dock) {
    dock = document.createElement("nav");
    dock.id = "mitzvahActionDock";
    dock.setAttribute("aria-label", "Mitzvah World actions");
    document.body.appendChild(dock);
  }
  dock.innerHTML = ACTIONS.map(([id, label, key]) => `<button type="button" class="mitzvahDockButton" data-action="${id}"><span>${label}</span><kbd>${key}</kbd></button>`).join("");
  for (const button of dock.querySelectorAll("button[data-action]")) {
    const action = ACTIONS.find(row => row[0] === button.dataset.action);
    button.onclick = () => run(action);
  }
  globalThis.__MITZVAH_CLOSE_TOP_PANEL__ = closeAllPanels;
  globalThis.closeTopPanel = closeAllPanels;
  return dock;
}
