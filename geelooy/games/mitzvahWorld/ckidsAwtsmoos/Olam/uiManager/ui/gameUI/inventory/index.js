// B"H
/**
 * @file index.js
 * @description Chapter 39: Mobile wardrobe becomes one clean sheet: header, tabs, grid, equip.
 */
const FALLBACK_ITEMS = [
  { id: "top_hat", name: "Black Hat", icon: "🎩", equipSlot: "head", isEquipped: true },
  { id: "streimel", name: "Shtreimel", icon: "🧢", equipSlot: "head" },
  { id: "kipa", name: "Kipa", icon: "🔵", equipSlot: "head" },
  { id: "jacket", name: "Black Coat", icon: "🧥", equipSlot: "jacket", isEquipped: true },
  { id: "shirt", name: "White Shirt", icon: "👕", equipSlot: "shirt", isEquipped: true },
  { id: "blue_coat", name: "Blue Coat", icon: "🥼", equipSlot: "jacket" },
  { id: "pants", name: "Black Pants", icon: "👖", equipSlot: "legs", isEquipped: true },
  { id: "gray_pants", name: "Gray Pants", icon: "▮", equipSlot: "legs" },
  { id: "shoes", name: "Black Shoes", icon: "👞", equipSlot: "feet", isEquipped: true }
];
const TABS = [["all", "▦", "All"], ["head", "🎩", "Hats"], ["jacket", "🧥", "Coats"], ["legs", "👖", "Pants"], ["feet", "👞", "Shoes"], ["eyes", "👓", "Glasses"]];
const state = { slots: FALLBACK_ITEMS, filter: "all", selected: null };
function stop(event) { event?.preventDefault?.(); event?.stopPropagation?.(); }
function root() { return document.getElementById("inventoryScreen"); }
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function send(inner) {
  const detail = { olamPeula: inner };
  document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles: true, detail }));
  worker()?.postMessage?.(detail);
}
function category(item) { return item?.equipSlot || "all"; }
function visibleItems() { return state.slots.map((item, index) => ({ item, index })).filter(row => row.item && (state.filter === "all" || category(row.item) === state.filter)); }
function setDockHidden(hidden) { document.getElementById("actionBar")?.classList.toggle("inventory-open", hidden); }
function closeInventory(host = root()) { host?.classList.add("hidden"); setDockHidden(false); }
function renderTabs(host) {
  const wrap = host.querySelector(".wardrobe-tabs");
  wrap.innerHTML = "";
  TABS.forEach(([key, icon, label]) => {
    const button = document.createElement("button");
    button.className = `wardrobe-tab ${state.filter === key ? "active" : ""}`;
    button.innerHTML = `<span class="ico">${icon}</span><span>${label}</span>`;
    button.addEventListener("pointerdown", event => { stop(event); state.filter = key; render(host); }, { passive: false });
    wrap.appendChild(button);
  });
}
function select(host, item, index, card) {
  state.selected = { item, index };
  host.querySelectorAll(".inv-card.selected").forEach(el => el.classList.remove("selected"));
  card.classList.add("selected");
  host.querySelector(".selected-label").textContent = `${item.name || "Item"} selected`;
}
function renderGrid(host) {
  const wrap = host.querySelector(".slots");
  wrap.innerHTML = "";
  visibleItems().forEach(({ item, index }) => {
    const card = document.createElement("button");
    card.className = `inv-card ${item.isEquipped ? "equipped" : ""}`;
    card.innerHTML = `<span class="slotBtn">${item.icon || "✦"}</span><span class="slotName">${item.name || "Item"}</span>${item.isEquipped ? '<span class="equippedMark">✓</span>' : ""}`;
    card.addEventListener("pointerdown", event => { stop(event); select(host, item, index, card); }, { passive: false });
    wrap.appendChild(card);
  });
}
function render(host = root()) { if (host) { renderTabs(host); renderGrid(host); } }
function receive(detail = {}) {
  if (Array.isArray(detail.slots) && detail.slots.some(Boolean)) state.slots = detail.slots.filter(Boolean);
  if (detail.updateSlots?.slots?.some?.(Boolean)) state.slots = detail.updateSlots.slots.filter(Boolean);
  render();
}
function equip(host) {
  if (!state.selected?.item) return;
  const { item, index } = state.selected;
  const target = item.equipSlot || "jacket";
  state.slots.forEach(slot => { if (slot?.equipSlot === target) slot.isEquipped = false; });
  item.isEquipped = true;
  send({ equipItem: { sourceType: "inventory", index, target } });
  render(host);
}
const InventoryScreen = {
  shaym: "inventoryScreen", id: "inventoryScreen", awtsmoosClick: true, className: "awtsmoosInventoryViewer hidden", dataset: { awtsUi: "true" }, style: { pointerEvents: "auto", touchAction: "none" },
  ready(host) { host.__awtsRenderSlots = () => render(host); host.addEventListener("awtsInventoryOpen", () => { setDockHidden(true); render(host); }); window.addEventListener("awtsInventoryUpdate", event => receive(event.detail || {})); setTimeout(() => render(host), 0); },
  children: [
    { className: "header", children: [{ className: "text", textContent: "INVENTORY / WARDROBE" }, { tag: "button", className: "close", textContent: "×", ready(el) { el.addEventListener("pointerdown", event => { stop(event); closeInventory(); }, { passive: false }); } }] },
    { className: "inventory-body", children: [{ className: "wardrobe-tabs" }, { className: "main-slots-holder", children: [{ className: "slots" }] }, { className: "wardrobe-footer", children: [{ className: "selected-label", textContent: "Tap clothing to select" }, { tag: "button", className: "equip-main-btn", textContent: "👕 EQUIP", ready(el) { el.addEventListener("pointerdown", event => { stop(event); equip(root()); }, { passive: false }); } }] }] }
  ], on: { updateSlots(e) { receive(e.detail || e); } }
};
export default InventoryScreen;
