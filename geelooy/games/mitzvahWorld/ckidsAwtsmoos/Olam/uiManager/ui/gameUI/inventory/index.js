// B"H
/**
 * @file index.js
 * @description
 * Chapter 50: The bag receives perutas as an item and stops flashing. The
 * Awtsmoos paints selection without re-birthing the grid, closes stray panels
 * on open, and shows owned perutas as a stackable Torah coin row.
 */
const PERSONAL_KEY = "awtsmoosMitzvahPersonalPerutas";
const FALLBACK_ITEMS = [
  { id: "top_hat", name: "Black Hat", icon: "🎩", equipSlot: "head", isEquipped: true },
  { id: "shirt", name: "White Shirt", icon: "👕", equipSlot: "shirt", isEquipped: true },
  { id: "pants", name: "Black Pants", icon: "👖", equipSlot: "legs", isEquipped: true },
  { id: "shoes", name: "Black Shoes", icon: "👞", equipSlot: "feet", isEquipped: true }
];
const TABS = [["all", "▦", "All"], ["head", "🎩", "Hats"], ["shirt", "👕", "Shirts"], ["jacket", "🧥", "Coats"], ["legs", "👖", "Pants"], ["feet", "👞", "Shoes"]];
const state = { slots: FALLBACK_ITEMS, filter: "all", selected: null };
const number = v => Number.isFinite(Number(v)) ? Number(v) : 0;
const perutas = () => { try { return number(localStorage.getItem(PERSONAL_KEY)); } catch { return 0; } };
function stop(event) { event?.preventDefault?.(); event?.stopPropagation?.(); }
function root() { return document.getElementById("inventoryScreen"); }
function worker() { return window.mana?.socket?.eved || window.mana?.eved || null; }
function setText(host, selector, text) { const el = host?.querySelector(selector); if (el) el.textContent = text; }
function category(item) { return item?.equipSlot || (item?.className === "Apparel" ? "jacket" : "all"); }
function perutaItem() { const qty = perutas(); return { id: "personal_perutas", name: `Perutas x${qty}`, icon: "🪙", stackable: true, quantity: qty, locked: true, category: "currency" }; }
function allItems() { return [perutaItem(), ...state.slots]; }
function shownItems() { return allItems().map((item, index) => ({ item, index })).filter(row => row.item && (state.filter === "all" || category(row.item) === state.filter)); }
function send(inner) { const detail = { olamPeula: inner }; document.querySelector('[shaym="ikar"]')?.dispatchEvent(new CustomEvent("olamPeula", { bubbles: true, detail })); worker()?.postMessage?.(detail); }
function closeLoosePanels() { document.getElementById("awtsmoos-npc-overlay")?.remove(); document.querySelector(".store-container")?.classList.add("hidden"); document.querySelectorAll(".awtsmoosContextMenu,.bz-panel,.construction-screen").forEach(el => el.classList.add("hidden")); }
function closeInventory(host = root()) { host?.classList.add("hidden"); document.getElementById("actionBar")?.classList.remove("inventory-open"); }
function cardIndex(card) { return Number(card.dataset.index); }
function realSlotIndex(displayIndex) { return displayIndex - 1; }
function updateSelection(host) { host?.querySelectorAll?.(".inv-card").forEach(card => card.classList.toggle("selected", cardIndex(card) === state.selected?.index)); const name = state.selected?.item?.name; setText(host, ".selected-label", name ? `${name} selected` : `Bag Perutas: ${perutas()}`); }
function updateEquippedMarks(host) { host?.querySelectorAll?.(".inv-card").forEach(card => { const idx = realSlotIndex(cardIndex(card)); const item = idx >= 0 ? state.slots[idx] : perutaItem(); card.classList.toggle("equipped", Boolean(item?.isEquipped)); let mark = card.querySelector(".equippedMark"); if (item?.isEquipped && !mark) { mark = document.createElement("span"); mark.className = "equippedMark"; mark.textContent = "✓"; card.appendChild(mark); } else if (!item?.isEquipped && mark) mark.remove(); }); }
function renderTabs(host) { const wrap = host.querySelector(".wardrobe-tabs"); if (!wrap) return; wrap.innerHTML = ""; for (const [key, icon, label] of TABS) { const button = document.createElement("button"); button.type = "button"; button.className = `wardrobe-tab ${state.filter === key ? "active" : ""}`; button.innerHTML = `<span class="ico">${icon}</span><span>${label}</span>`; button.addEventListener("pointerdown", event => { stop(event); if (state.filter === key) return; state.filter = key; state.selected = null; render(host); }, { passive: false }); wrap.appendChild(button); } }
function select(host, item, index) { state.selected = { item, index }; updateSelection(host); }
function renderGrid(host) { const wrap = host.querySelector(".slots"); if (!wrap) return; wrap.innerHTML = ""; const rows = shownItems(); if (!rows.length) { wrap.innerHTML = `<div class="empty-inventory-note">No items in this section.</div>`; return; } for (const { item, index } of rows) { const card = document.createElement("button"); card.type = "button"; card.dataset.index = String(index); card.className = `inv-card ${item.locked ? "locked" : ""} ${item.isEquipped ? "equipped" : ""} ${state.selected?.index === index ? "selected" : ""}`; card.innerHTML = `<span class="slotBtn">${item.icon || "✦"}</span><span class="slotName">${item.name || "Item"}</span>${item.isEquipped ? '<span class="equippedMark">✓</span>' : ""}`; card.addEventListener("pointerdown", event => { stop(event); select(host, item, index); }, { passive: false }); wrap.appendChild(card); } }
function render(host = root()) { if (!host) return; renderTabs(host); renderGrid(host); updateSelection(host); }
function receive(detail = {}) { const update = detail.updateSlots || detail; if (Array.isArray(update.slots) && update.slots.some(Boolean)) state.slots = update.slots.filter(Boolean); render(); }
function equip(host) { if (!state.selected?.item) return setText(host, ".selected-label", "Select clothing first"); if (state.selected.item.locked) return setText(host, ".selected-label", "Perutas stay in your bag"); const index = realSlotIndex(state.selected.index); const item = state.slots[index]; const target = item?.equipSlot || "jacket"; state.slots.forEach(slot => { if (slot?.equipSlot === target) slot.isEquipped = false; }); item.isEquipped = true; send({ equipItem: { sourceType: "inventory", index, target } }); updateEquippedMarks(host); updateSelection(host); setText(host, ".selected-label", `${item.name || "Item"} equipped`); }
const InventoryScreen = { shaym: "inventoryScreen", id: "inventoryScreen", awtsmoosClick: true, className: "awtsmoosInventoryViewer hidden", dataset: { awtsUi: "true" }, style: { pointerEvents: "auto", touchAction: "none" }, ready(host) { host.__awtsRenderSlots = () => render(host); host.addEventListener("awtsInventoryOpen", () => { closeLoosePanels(); document.getElementById("actionBar")?.classList.add("inventory-open"); state.selected = null; render(host); }); window.addEventListener("awtsInventoryUpdate", event => receive(event.detail || {})); window.addEventListener("awtsmoosPersonalPerutas", () => render(host)); setTimeout(() => render(host), 0); }, children: [
  { className: "header", children: [{ className: "text", textContent: "BAG / WARDROBE" }, { tag: "button", className: "close", textContent: "×", ready(el) { el.addEventListener("pointerdown", event => { stop(event); closeInventory(); }, { passive: false }); } }] },
  { className: "inventory-body", children: [{ className: "wardrobe-tabs" }, { className: "main-slots-holder", children: [{ className: "slots" }] }, { className: "wardrobe-footer", children: [{ className: "selected-label", textContent: "Bag Perutas: 0" }, { tag: "button", className: "equip-main-btn", textContent: "👕 EQUIP", ready(el) { el.addEventListener("pointerdown", event => { stop(event); equip(root()); }, { passive: false }); } }] }] }
], on: { updateSlots(e) { receive(e.detail || e); } } };
export default InventoryScreen;
