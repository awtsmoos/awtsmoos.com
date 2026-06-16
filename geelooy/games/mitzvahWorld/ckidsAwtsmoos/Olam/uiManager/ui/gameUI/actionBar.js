// B"H
/**
 * @file actionBar.js
 * @description Chapter 916: the dock speaks to the living worker directly, once.
 * Runtime archaeology proved the generated game UI is detached from the old
 * UIManager event root after the menu transforms into the world. The static
 * shaym="ikar" vessel remains only as a canvas holder, so DOM bubbling cannot
 * reach the worker bridge. This file therefore uses one direct worker post with
 * a tiny dispatch ledger for verification, and no duplicate custom-event path.
 */
const ACTIONS = [
  { cls:"attack-slot", icon:"ATK", name:"Strike", label:"V", kind:"combatAttack" },
  { cls:"sword-slot", icon:"SWD", name:"Sword", label:"1", kind:"combatEquip", weaponId:"cherev_hakodesh" },
  { cls:"bow-slot", icon:"BOW", name:"Bow", label:"2", kind:"combatEquip", weaponId:"keshes_haemes" },
  { cls:"staff-slot", icon:"STF", name:"Staff", label:"3", kind:"combatEquip", weaponId:"mateh_hatorah" },
  { cls:"talk-slot", icon:"MSG", name:"Talk", label:"C", kind:"pulse", code:"KeyC" },
  { cls:"bag-slot", icon:"BAG", name:"Bag", label:"I", kind:"inventory" }
];
function stop(event) { event?.preventDefault?.(); event?.stopPropagation?.(); }
function inventory() { return document.getElementById("inventoryScreen"); }
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function send(inner) {
  const payload = { olamPeula:inner };
  window.__AWTS_ACTION_BAR_SENT__ ||= [];
  window.__AWTS_ACTION_BAR_SENT__.push({ at:Date.now(), payload:inner });
  window.__AWTS_ACTION_BAR_SENT__ = window.__AWTS_ACTION_BAR_SENT__.slice(-20);
  worker()?.postMessage?.(payload);
}
function closeLoosePanels() { document.getElementById("awtsmoos-npc-overlay")?.remove(); document.querySelectorAll(".awtsmoosContextMenu,.bz-panel,.construction-screen").forEach(el => el.classList.add("hidden")); }
function showInventory(open) { const inv = inventory(); if (!inv) return; if (open) closeLoosePanels(); inv.classList.toggle("hidden", !open); if (open) inv.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles:true })); }
function pulse(code) { send({ setInput:{ code } }); setTimeout(() => send({ setInputOut:{ code } }), 120); }
function fire(action) {
  if (action.kind === "inventory") return showInventory(Boolean(inventory()?.classList.contains("hidden")));
  if (action.kind === "pulse") return pulse(action.code);
  if (action.kind === "combatAttack") return send({ combatAttack:{ source:"actionBar", allowAutoFace:true, preferMelee:true, mobileAssist:true } });
  if (action.kind === "combatEquip") return send({ combatEquip:{ weaponId:action.weaponId, source:"actionBar" } });
}
function bindTap(el, action) { let last = 0; el.addEventListener("pointerdown", event => { stop(event); const at = performance.now(); if (at - last < 120) return; last = at; fire(action); }, { passive:false }); }
function button(action) { return { className:`actionSlot ${action.cls}`, dataset:{ awtsUi:"true", action:action.name }, title:action.name, ready(el) { bindTap(el, action); }, children:[{ className:"slotIcon", textContent:action.icon }, { className:"slotName", textContent:action.name }, { className:"slotKey", textContent:action.label }] }; }
const css = `#actionBar.combat-action-dock{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:calc(10px + env(safe-area-inset-bottom))!important;width:auto!important;height:auto!important;padding:0!important;transform:translateX(-50%)!important;z-index:26000!important;pointer-events:none!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important}#actionBar .dock-handle{display:none!important}#actionSlots{display:grid!important;grid-template-columns:repeat(6,58px)!important;gap:7px!important;padding:8px!important;border-radius:18px!important;background:linear-gradient(180deg,rgba(10,18,30,.76),rgba(5,8,15,.82))!important;border:1px solid rgba(255,224,138,.42)!important;box-shadow:0 12px 28px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.10)!important;backdrop-filter:blur(8px)!important;pointer-events:auto!important}#actionBar .actionSlot{width:58px!important;height:56px!important;border-radius:13px!important;background:radial-gradient(circle at 50% 18%,rgba(112,141,160,.55),rgba(15,27,40,.96) 62%,rgba(7,10,18,.98))!important;border:1px solid rgba(235,210,130,.6)!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;position:relative!important;overflow:hidden!important;touch-action:manipulation!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 5px 12px rgba(0,0,0,.32)!important}#actionBar .attack-slot{background:radial-gradient(circle at 50% 18%,rgba(255,116,74,.7),rgba(81,25,22,.98) 70%)!important;border-color:#ffd85a!important}#actionBar .slotIcon{font:800 12px/1 Arial,sans-serif!important;color:#fff7cc!important;text-shadow:0 2px 5px rgba(0,0,0,.8)!important;margin-top:2px!important}#actionBar .slotName{font:700 9px/1.1 Arial,sans-serif!important;color:#fff2bd!important;text-shadow:0 1px 2px #000!important;margin-top:2px!important;max-width:52px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}#actionBar .slotKey{position:absolute!important;left:4px!important;bottom:3px!important;min-width:13px!important;height:13px!important;border-radius:4px!important;text-align:center!important;font:800 8px/13px Arial!important;color:#9fffd0!important;background:rgba(0,0,0,.52)!important;border:1px solid rgba(159,255,208,.22)!important}@media(max-width:760px){#actionBar.combat-action-dock{left:10px!important;right:10px!important;transform:none!important}#actionSlots{grid-template-columns:repeat(6,minmax(44px,1fr))!important;gap:5px!important;padding:7px!important}#actionBar .actionSlot{width:auto!important;height:54px!important}.slotName{font-size:8px!important}}`;
const ActionBar = { shaym:"action bar", id:"actionBar", className:"awtsmoosAction combat-action-dock open", awtsmoosClick:true, children:[{ className:"dock-handle", textContent:"" }, { className:"slots", shaym:"action slots", id:"actionSlots", children:ACTIONS.map(button) }, { tag:"style", innerHTML:css }], on:{ updateActionSlots() {} } };
export default ActionBar;
