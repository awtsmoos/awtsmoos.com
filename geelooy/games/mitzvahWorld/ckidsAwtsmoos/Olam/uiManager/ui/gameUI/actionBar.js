// B"H
/**
 * @file actionBar.js
 * @description
 * Chapter 47: The side dock becomes exact. VIEW toggles first/third person,
 * EYE returns to village and loses progress, TOOL speaks to the NPC/interaction
 * key, and no button opens a builder panel by accident.
 */
const ACTIONS = [
  { cls: "bag-slot", icon: "🎒", label: "BAG", kind: "inventory" },
  { cls: "run-slot", icon: "🏃", label: "RUN", kind: "run" },
  { cls: "scope-slot", icon: "👁️", label: "VIEW", kind: "toggleView" },
  { cls: "magic-slot", icon: "✨", label: "TALK", kind: "pulse", code: "KeyC" },
  { cls: "eagle-slot", icon: "🏠", label: "VILLAGE", kind: "village" }
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
  el.querySelector(".slotBtn").textContent = running ? "🏃" : "🚶";
  el.querySelector(".slotName").textContent = running ? "RUN" : "WALK";
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
}
function bindTap(el, fn) {
  let last = 0;
  el.addEventListener("pointerdown", event => { stop(event); const at = performance.now(); if (at - last < 160) return; last = at; fn(event); }, { passive: false });
}
function button(action) {
  return { className: `actionSlot ${action.cls}`, dataset: { awtsUi: "true", running: action.kind === "run" ? "true" : undefined }, ready(el) { bindTap(el, () => fire(el)); }, children: [{ className: "slotBtn", textContent: action.icon }, { className: "slotName", textContent: action.label }] };
}
const css = `
#actionBar.compact-action-dock{position:fixed!important;right:0!important;top:44%!important;transform:translateY(-50%)!important;width:0!important;height:0!important;z-index:26000!important;pointer-events:none!important;background:transparent!important;border:0!important;box-shadow:none!important;overflow:visible!important;touch-action:none!important}
#actionBar .dock-handle{position:absolute!important;right:0!important;top:0!important;width:44px!important;height:58px!important;border-radius:16px 0 0 16px!important;background:#28124f!important;border:2px solid #ffd34f!important;border-right:0!important;color:#ffe680!important;font:bold 28px Arial!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:auto!important;touch-action:manipulation!important;box-shadow:0 6px 12px rgba(0,0,0,.35)!important;user-select:none!important}
#actionBar.open .dock-handle{color:#7dfcff!important;border-color:#7dfcff!important}
#actionSlots{position:absolute!important;right:48px!important;top:-116px!important;width:68px!important;display:grid!important;grid-template-columns:1fr!important;gap:7px!important;background:transparent!important;pointer-events:auto!important}
#actionBar.closed #actionSlots,#actionBar[data-open="false"] #actionSlots{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
#actionBar .actionSlot{width:62px!important;height:62px!important;border-radius:18px!important;background:#20104b!important;border:2px solid rgba(255,215,0,.72)!important;box-shadow:0 7px 14px rgba(0,0,0,.42)!important;pointer-events:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;overflow:hidden!important;touch-action:manipulation!important;color:#fff!important}
#actionBar .slotBtn{font-size:27px!important;line-height:1!important}#actionBar .slotName{position:absolute!important;left:5px!important;right:5px!important;bottom:4px!important;text-align:center!important;font:bold 9px Arial!important;color:#ffeaa4!important;text-shadow:0 1px 3px #000!important;background:rgba(0,0,0,.38)!important;border-radius:8px!important;letter-spacing:.04em!important}
`;
const ActionBar = { shaym: "action bar", id: "actionBar", className: "awtsmoosAction compact-action-dock closed", awtsmoosClick: true, ready() { setTimeout(() => setOpen(false), 0); }, children: [
  { className: "dock-handle", textContent: "‹", ready(el) { bindTap(el, () => setOpen(!openState())); } },
  { className: "slots", shaym: "action slots", id: "actionSlots", children: ACTIONS.map(button) },
  { tag: "style", innerHTML: css }
], on: { updateActionSlots() {} } };
export default ActionBar;
