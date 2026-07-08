// B"H
/**
 * @file equipment.js
 * @description Chapter 29: Equipment slots become thumb-readable vessels.
 */
import { resolveItemIcon } from "../../../../../systems/inventory/ItemIconResolver.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const labels = { head: "Hat", eyes: "Eyes", shirt: "Shirt", jacket: "Coat", legs: "Pants", feet: "Shoes", rightHand: "Tool", leftHand: "Hand" };
const order = ["head", "eyes", "shirt", "jacket", "legs", "feet", "rightHand", "leftHand"];
const isImage = icon => icon && (icon.includes("/") || icon.includes("data:"));

function childFor(item) {
  if (!item) return [];
  const icon = resolveItemIcon(item);
  if (isImage(icon)) return [{ className: "slotBtn", style: { backgroundImage: `url("${icon}")` } }];
  return [{ className: "slotBtn", textContent: icon || "✓" }];
}

function bindEquipSlot(el, slotName, item, ui) {
  const stop = event => { event.preventDefault(); event.stopPropagation(); };
  el.addEventListener("touchstart", stop, { passive: false });
  el.addEventListener("click", event => {
    stop(event);
    if (item) ui.peula("ikar", { olamPeula: { unequipItem: slotName } });
  });
}

export default function updateEquipment(e, $, ui) {
  const equipData = e.detail || {};
  const root = $("inventoryScreen");
  const equipContainer = root?.querySelector(".equipment-slots");
  if (!equipContainer) return;
  equipContainer.innerHTML = "";
  order.forEach(slotName => {
    const item = equipData[slotName];
    ui.html({
      parent: equipContainer,
      className: `equip-slot ${slotName} ${item ? "occupied" : "empty"}`,
      dataset: { label: labels[slotName] || slotName },
      style: { pointerEvents: "auto" },
      ready(el) { bindEquipSlot(el, slotName, item, ui); },
      children: item ? childFor(item) : [{ tag: "span", textContent: labels[slotName] || slotName }]
    });
  });
}
