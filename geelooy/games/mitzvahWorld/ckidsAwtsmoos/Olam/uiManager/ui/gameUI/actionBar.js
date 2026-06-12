// B"H
/**
 * @file actionBar.js
 * @description
 * Chapter 706: The dock becomes a real combat bar.
 *
 * The Awtsmoos gives the player's hands clear gates: attack, weapon forms,
 * talk, camera view, movement gait, inventory, and village return. Every slot
 * dispatches data into the worker instead of guessing through stale UI panels.
 */
const ACTIONS = [
  { cls: "attack-slot", icon: "ATK", label: "V", kind: "combatAttack" },
  { cls: "sword-slot", icon: "ALEF", label: "1", kind: "combatEquip", weaponId: "cherev_hakodesh" },
  { cls: "bow-slot", icon: "SHIN", label: "2", kind: "combatEquip", weaponId: "keshes_haemes" },
  { cls: "staff-slot", icon: "ALL", label: "3", kind: "combatEquip", weaponId: "mateh_hatorah" },
  { cls: "talk-slot", icon: "TALK", label: "C", kind: "pulse", code: "KeyC" },
  { cls: "bag-slot", icon: "BAG", label: "I", kind: "inventory" }
];

function stop(event) { event?.preventDefault?.(); event?.stopPropagation?.(); }
function bar() { return document.getElementById("actionBar"); }
function inventory() { return document.getElementById("inventoryScreen"); }
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function openState() { return bar()?.dataset.open === "true"; }
function send(inner) {
  const detail = { olamPeula: inner };
  document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles: true, detail }));
  worker()?.postMessage?.(detail);
}
function closeLoosePanels() {
  document.getElementById("awtsmoos-npc-overlay")?.remove();
  document.querySelectorAll(".awtsmoosContextMenu,.bz-panel,.construction-screen").forEach(el => el.classList.add("hidden"));
}
function setOpen(open) {
  const root = bar();
  if (!root) return;
  root.dataset.open = open ? "true" : "false";
  root.classList.toggle("open", open);
  root.classList.toggle("closed", !open);
}
function showInventory(open) {
  const inv = inventory();
  if (!inv) return;
  if (open) closeLoosePanels();
  inv.classList.toggle("hidden", !open);
  if (open) inv.dispatchEvent(new CustomEvent("awtsInventoryOpen", { bubbles: true }));
  setOpen(false);
}
function pulse(code) { send({ setInput: { code } }); setTimeout(() => send({ setInputOut: { code } }), 120); }
function setRun(el) {
  const running = el.dataset.running === "false";
  el.dataset.running = running ? "true" : "false";
  el.querySelector(".slotBtn").textContent = running ? "RUN" : "WALK";
  send({ setRunMode: { running } });
}
function fire(el) {
  const action = ACTIONS.find(item => el.classList.contains(item.cls));
  if (!action) return;
  if (action.kind === "inventory") showInventory(Boolean(inventory()?.classList.contains("hidden")));
  if (action.kind === "run") setRun(el);
  if (action.kind === "pulse") pulse(action.code);
  if (action.kind === "toggleView") send({ toggleFPS: true });
  if (action.kind === "village") send({ returnVillage: true });
  if (action.kind === "combatAttack") send({ combatAttack: { source: "actionBar" } });
  if (action.kind === "combatEquip") send({ combatEquip: { weaponId: action.weaponId } });
}
function bindTap(el, fn) {
  let last = 0;
  el.addEventListener("pointerdown", event => {
    stop(event);
    const at = performance.now();
    if (at - last < 130) return;
    last = at;
    fn(event);
  }, { passive: false });
}
function button(action) {
  return {
    className: `actionSlot ${action.cls}`,
    dataset: { awtsUi: "true", running: action.kind === "run" ? "true" : undefined },
    ready(el) { bindTap(el, () => fire(el)); },
    children: [{ className: "slotBtn", textContent: action.icon }, { className: "slotName", textContent: action.label }]
  };
}
const css = `
#actionBar.combat-action-dock{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:12px!important;width:auto!important;height:auto!important;padding:0!important;transform:translateX(-50%)!important;z-index:26000!important;pointer-events:none!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;backdrop-filter:none!important;overflow:visible!important}
#actionBar .dock-handle{display:none!important}
#actionSlots{display:grid!important;grid-template-columns:repeat(6,54px)!important;gap:6px!important;padding:7px!important;border-radius:14px!important;background:rgba(12,18,28,.78)!important;border:1px solid rgba(255,224,138,.42)!important;box-shadow:0 10px 24px rgba(0,0,0,.34)!important;backdrop-filter:blur(7px)!important;pointer-events:auto!important}
#actionBar .actionSlot{width:54px!important;height:52px!important;border-radius:8px!important;background:linear-gradient(180deg,rgba(52,71,90,.95),rgba(21,28,40,.95))!important;border:1px solid rgba(255,224,138,.62)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 4px 10px rgba(0,0,0,.28)!important;display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;overflow:hidden!important;touch-action:manipulation!important;color:#fff!important}
#actionBar .attack-slot{border-color:#ffdf60!important;background:linear-gradient(180deg,rgba(122,51,36,.96),rgba(48,22,20,.96))!important}
#actionBar .sword-slot,#actionBar .bow-slot,#actionBar .staff-slot{background:linear-gradient(180deg,rgba(37,75,92,.96),rgba(16,35,48,.96))!important}
#actionBar .slotBtn{font:bold 13px Arial!important;line-height:1!important;text-align:center!important;color:#fff6c9!important;text-shadow:0 1px 3px #000!important}
#actionBar .slotName{position:absolute!important;left:4px!important;right:4px!important;bottom:3px!important;text-align:center!important;font:bold 9px Arial!important;color:#9effd0!important;background:rgba(0,0,0,.42)!important;border-radius:5px!important}
@media(max-width:760px){#actionBar.combat-action-dock{left:6px!important;right:6px!important;bottom:calc(8px + env(safe-area-inset-bottom))!important;transform:none!important}#actionSlots{grid-template-columns:repeat(6,minmax(42px,1fr))!important;gap:4px!important}#actionBar .actionSlot{width:auto!important;height:48px!important}}
`;

const ActionBar = {
  shaym: "action bar",
  id: "actionBar",
  className: "awtsmoosAction combat-action-dock open",
  awtsmoosClick: true,
  ready() { setTimeout(() => setOpen(true), 0); },
  children: [
    { className: "dock-handle", textContent: "<", ready(el) { bindTap(el, () => setOpen(!openState())); } },
    { className: "slots", shaym: "action slots", id: "actionSlots", children: ACTIONS.map(button) },
    { tag: "style", innerHTML: css }
  ],
  on: { updateActionSlots() {} }
};

export default ActionBar;
