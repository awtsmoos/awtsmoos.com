// B"H
/**
 * @file index.js
 * @description Chapter 918: The bag stops reincarnating itself. Chrome proved
 * wardrobe-tabs and slots were rebuilding into long-task-adjacent mutation
 * bursts. This module now renders only when visible and only when content keys
 * change; selection and equip marks mutate in place.
 */
import { resolveItemIcon } from "../../../../../systems/inventory/ItemIconResolver.js";

const PERSONAL_KEY = "awtsmoosMitzvahPersonalPerutas";
const FALLBACK_ITEMS = [
  { id:"top_hat", name:"Black Hat", icon:"🎩", equipSlot:"head", isEquipped:true },
  { id:"shirt", name:"White Shirt", icon:"👕", equipSlot:"shirt", isEquipped:true },
  { id:"pants", name:"Black Pants", icon:"👖", equipSlot:"legs", isEquipped:true },
  { id:"shoes", name:"Black Shoes", icon:"👞", equipSlot:"feet", isEquipped:true }
];
const TABS = [["all","▦","All"],["head","🎩","Hats"],["shirt","👕","Shirts"],["jacket","🧥","Coats"],["legs","👖","Pants"],["feet","👞","Shoes"]];
const state = { slots:FALLBACK_ITEMS, filter:"all", selected:null, slotKey:"", tabKey:"", label:"", open:false };
const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const perutas = () => { try { return number(localStorage.getItem(PERSONAL_KEY)); } catch { return 0; } };
const root = () => document.getElementById("inventoryScreen");
const worker = () => window.mana?.socket?.eved || window.mana?.eved || null;
function stop(event) { event?.preventDefault?.(); event?.stopPropagation?.(); }
function setText(host, selector, text) { const el = host?.querySelector(selector); if (el && el.textContent !== text) el.textContent = text; }
function category(item) { return item?.category || item?.equipSlot || (item?.className === "Apparel" ? "jacket" : "all"); }
function perutaItem() { const qty = perutas(); return { id:"personal_perutas", name:`Perutas x${qty}`, icon:"🪙", stackable:true, quantity:qty, locked:true, category:"currency" }; }
function allItems() { return [perutaItem(), ...state.slots]; }
function shownItems() { return allItems().map((item, index) => ({ item, index })).filter(row => row.item && (state.filter === "all" || category(row.item) === state.filter)); }
function itemKey(item, index) { return [index,item?.id,item?.name,resolveItemIcon(item),item?.equipSlot,item?.category,item?.quantity,item?.locked,item?.isEquipped].join(":"); }
function slotsKey() { return `${state.filter}|${shownItems().map(({ item, index }) => itemKey(item, index)).join("|")}`; }
function tabsKey() { return `${state.filter}|${TABS.map(t => t[0]).join("|")}`; }
function send(inner) { const detail = { olamPeula:inner }; document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles:true, detail })); worker()?.postMessage?.(detail); }
function addClass(el, name) { if (el && !el.classList.contains(name)) el.classList.add(name); }
function removeClass(el, name) { if (el?.classList.contains(name)) el.classList.remove(name); }
function closeLoosePanels() { document.getElementById("awtsmoos-npc-overlay")?.remove(); addClass(document.querySelector(".store-container"), "hidden"); document.querySelectorAll(".awtsmoosContextMenu,.bz-panel,.construction-screen").forEach(el => addClass(el, "hidden")); }
function closeInventory(host = root()) { addClass(host, "hidden"); removeClass(document.getElementById("actionBar"), "inventory-open"); state.open = false; }
function cardIndex(card) { return Number(card.dataset.index); }
function realSlotIndex(displayIndex) { return displayIndex - 1; }
function updateSelection(host) {
  host?.querySelectorAll?.(".inv-card").forEach(card => card.classList.toggle("selected", cardIndex(card) === state.selected?.index));
  const next = state.selected?.item?.name ? `${state.selected.item.name} selected` : `Bag Perutas: ${perutas()}`;
  if (state.label !== next) { state.label = next; setText(host, ".selected-label", next); }
}
function updateEquippedMarks(host) {
  host?.querySelectorAll?.(".inv-card").forEach(card => {
    const idx = realSlotIndex(cardIndex(card)); const item = idx >= 0 ? state.slots[idx] : perutaItem();
    card.classList.toggle("equipped", Boolean(item?.isEquipped));
    let mark = card.querySelector(".equippedMark");
    if (item?.isEquipped && !mark) { mark = document.createElement("span"); mark.className = "equippedMark"; mark.textContent = "✓"; card.appendChild(mark); }
    else if (!item?.isEquipped && mark) mark.remove();
  });
}
function renderTabs(host) {
  const wrap = host?.querySelector(".wardrobe-tabs"), key = tabsKey(); if (!wrap || state.tabKey === key) return;
  state.tabKey = key; const frag = document.createDocumentFragment();
  for (const [keyName, icon, label] of TABS) {
    const button = document.createElement("button"); button.type = "button"; button.className = `wardrobe-tab ${state.filter === keyName ? "active" : ""}`;
    button.innerHTML = `<span class="ico">${icon}</span><span>${label}</span>`;
    button.addEventListener("pointerdown", event => { stop(event); if (state.filter === keyName) return; state.filter = keyName; state.selected = null; state.slotKey = ""; state.tabKey = ""; render(host, true); }, { passive:false });
    frag.appendChild(button);
  }
  wrap.replaceChildren(frag);
}
function renderGrid(host, force = false) {
  const wrap = host?.querySelector(".slots"), key = slotsKey(); if (!wrap || (!force && state.slotKey === key)) return;
  state.slotKey = key; const rows = shownItems();
  if (!rows.length) { if (wrap.__empty) return; wrap.__empty = true; wrap.innerHTML = `<div class="empty-inventory-note">No items in this section.</div>`; return; }
  wrap.__empty = false; const frag = document.createDocumentFragment();
  for (const { item, index } of rows) {
    const card = document.createElement("button"); card.type = "button"; card.dataset.index = String(index);
    card.className = `inv-card ${item.locked ? "locked" : ""} ${item.isEquipped ? "equipped" : ""} ${state.selected?.index === index ? "selected" : ""}`;
    card.innerHTML = `<span class="slotBtn">${resolveItemIcon(item) || "✦"}</span><span class="slotName">${item.name || "Item"}</span>${item.isEquipped ? '<span class="equippedMark">✓</span>' : ""}`;
    card.addEventListener("pointerdown", event => { stop(event); state.selected = { item, index }; updateSelection(host); }, { passive:false });
    frag.appendChild(card);
  }
  wrap.replaceChildren(frag);
}
function render(host = root(), force = false) { if (!host || host.classList.contains("hidden")) return; renderTabs(host); renderGrid(host, force); updateSelection(host); }
function receive(detail = {}) {
  const update = detail.updateSlots || detail;
  if (Array.isArray(update.slots) && update.slots.some(Boolean)) {
    const next = update.slots.filter(Boolean); const key = JSON.stringify(next.map((x, i) => itemKey(x, i)));
    if (state.__sourceKey !== key) { state.__sourceKey = key; state.slots = next; state.slotKey = ""; }
  }
  render(root());
}
function equip(host) {
  if (!state.selected?.item) return setText(host, ".selected-label", "Select clothing first");
  if (state.selected.item.locked) return setText(host, ".selected-label", "Perutas stay in your bag");
  const index = realSlotIndex(state.selected.index), item = state.slots[index], target = item?.equipSlot || "jacket";
  state.slots.forEach(slot => { if (slot?.equipSlot === target) slot.isEquipped = false; }); item.isEquipped = true;
  state.slotKey = ""; send({ equipItem:{ sourceType:"inventory", index, target } }); updateEquippedMarks(host); updateSelection(host); setText(host, ".selected-label", `${item.name || "Item"} equipped`);
}
function openInventory(host) { closeLoosePanels(); removeClass(host, "hidden"); addClass(document.getElementById("actionBar"), "inventory-open"); if (!state.open) { state.open = true; state.selected = null; } render(host); }
const InventoryScreen = { shaym:"inventoryScreen", id:"inventoryScreen", awtsmoosClick:true, className:"awtsmoosInventoryViewer hidden", dataset:{ awtsUi:"true" }, style:{ pointerEvents:"auto", touchAction:"none" }, ready(host) { host.__awtsRenderSlots = () => render(host); host.addEventListener("awtsInventoryOpen", () => openInventory(host)); window.addEventListener("awtsInventoryUpdate", event => receive(event.detail || {})); window.addEventListener("awtsmoosPersonalPerutas", () => { state.slotKey = ""; render(host); }); }, children:[
  { className:"header", children:[{ className:"text", textContent:"BAG / WARDROBE" }, { tag:"button", className:"close", textContent:"×", ready(el) { el.addEventListener("pointerdown", event => { stop(event); closeInventory(); }, { passive:false }); } }] },
  { className:"inventory-body", children:[{ className:"wardrobe-tabs" }, { className:"main-slots-holder", children:[{ className:"slots" }] }, { className:"wardrobe-footer", children:[{ className:"selected-label", textContent:"Bag Perutas: 0" }, { tag:"button", className:"equip-main-btn", textContent:"👕 EQUIP", ready(el) { el.addEventListener("pointerdown", event => { stop(event); equip(root()); }, { passive:false }); } }] }] }
], on:{ updateSlots(e) { receive(e.detail || e); } } };
export default InventoryScreen;
