// B"H
/**
 * @file slots.js
 * @description Chapter 29: Touch-first wardrobe slot renderer.
 */
import { resolveItemIcon } from "../../../../../systems/inventory/ItemIconResolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const categoryFor = item => item?.equipSlot || (item?.className === "Container" ? "all" : "all");
const isVisibleFor = (item, filter) => !filter || filter === "all" || categoryFor(item) === filter || (filter === "acc" && ["rightHand", "leftHand"].includes(item?.equipSlot));
const iconIsImage = icon => icon && (icon.includes("/") || icon.includes("data:"));

function iconNode(item) {
  if (!item) return null;
  const icon = resolveItemIcon(item);
  if (iconIsImage(icon)) return { tag: "div", className: "slotBtn", style: { backgroundImage: `url("${icon}")` } };
  return { tag: "div", className: "slotBtn", textContent: icon || "✦" };
}

function markSelected(root, el, item, index, sourceType) {
  root.querySelectorAll(".actionSlot.selected").forEach(node => node.classList.remove("selected"));
  el.classList.add("selected");
  root.__awtsSelectedSlot = { item, index, sourceType };
  const label = root.querySelector(".selected-label");
  if (label) label.textContent = `${item.name || "Item"} selected`;
}

function requestContext(root, el, item, index, sourceType, ui, event) {
  const rect = el.getBoundingClientRect();
  ui.peula(root, { showContextMenu: { item, index, sourceType, x: event.clientX || rect.left, y: event.clientY || rect.top } });
}

function bindSlot(el, item, index, sourceType, ui) {
  const root = document.getElementById("inventoryScreen");
  if (!item || !root) return;
  const choose = event => {
    event.preventDefault();
    event.stopPropagation();
    markSelected(root, el, item, index, sourceType);
  };
  el.addEventListener("click", choose);
  el.addEventListener("touchstart", choose, { passive: false });
  el.addEventListener("contextmenu", event => {
    event.preventDefault();
    event.stopPropagation();
    requestContext(root, el, item, index, sourceType, ui, event);
  });
  el.addEventListener("dblclick", event => {
    event.preventDefault();
    const target = item.equipSlot || "jacket";
    ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } });
  });
}

export default function updateSlots(e, $, ui) {
  const data = e.detail || e;
  const slotsData = data.slots || (Array.isArray(data) ? data : []);
  const containerMode = !!data.containerMode;
  const root = $("inventoryScreen");
  if (!root) return;
  const titleEl = root.querySelector(".header .text");
  const backBtn = root.querySelector(".back-inv-btn");
  if (titleEl) titleEl.textContent = containerMode ? (data.containerName || "CONTAINER") : "INVENTORY / WARDROBE";
  if (backBtn) backBtn.classList.toggle("hidden", !containerMode);
  const slotsContainer = root.querySelector(".slots");
  if (!slotsContainer) return;
  const filter = root.getAttribute("data-filter") || "all";
  slotsContainer.innerHTML = "";
  slotsData.forEach((item, index) => {
    if (item && !isVisibleFor(item, filter)) return;
    const sourceType = containerMode ? "container" : "inventory";
    ui.html({
      parent: slotsContainer,
      className: `actionSlot ${item ? "occupied" : "empty"} ${item?.isEquipped ? "equipped" : ""}`,
      style: { pointerEvents: "auto" },
      ready(el) { bindSlot(el, item, index, sourceType, ui); },
      children: [{ className: "innerSlot", children: item ? [iconNode(item), { className: "slotName", textContent: item.name || "Spark" }, { className: "slotQuantity", textContent: item.quantity > 1 ? item.quantity : "" }, item.isEquipped ? { className: "equippedMark", textContent: "✓" } : null].filter(Boolean) : [] }]
    });
  });
  root.onwardrobeFilter = () => updateSlots({ detail: data }, $, ui);
}
