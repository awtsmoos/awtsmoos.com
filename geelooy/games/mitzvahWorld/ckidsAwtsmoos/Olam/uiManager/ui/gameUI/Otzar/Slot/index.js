
/**
 * B"H
 * @module Slot
 * @description
 * THE VESSEL OF POTENTIAL (KELI)
 * 
 * "And they made vessels of gold..." 
 * This is the refined, modular manifestation of an inventory slot.
 */
import Icon from "./Icon.js";
import Badge from "./Badge.js";

export default function createSlot(slot, i, containerMode, ui) {
    let className = 'inventory-slot';

    if (slot) {
        className += ' occupied';
        if (slot.isEquipped) className += ' equipped';
    } else {
        className += ' empty';
    }

    return {
        className: className,
        "awtsmoosSlotData": slot,
        onmouseenter(e, $, uiInstance, el) {
            const menu = $("itemContextMenu");
            if (slot && (!menu || menu.classList.contains('hidden'))) {
                uiInstance.peula("ikar", { olamPeula: { showTooltip: { item: slot, x: e.clientX, y: e.clientY } } });
            }
        },
        onmouseleave(e, $, uiInstance) {
            uiInstance.peula("ikar", { olamPeula: { hideTooltip: true } });
        },
        onclick(e, $, uiInstance, el) {
             if (slot && slot.isContainer) {
                 uiInstance.peula("ikar", { 
                    olamPeula: { openContainer: { item: slot, index: i, sourceType: containerMode ? 'container' : 'inventory' } } 
                 });
             }
        },
        oncontextmenu(e, $, uiInstance, el) {
            e.preventDefault();
            if (slot) {
                uiInstance.peula("inventoryScreen", { 
                    showContextMenu: { 
                        item: slot, 
                        index: i, 
                        sourceType: containerMode ? 'container' : 'inventory', 
                        x: e.clientX, y: e.clientY 
                    } 
                });
            }
        },
        children: [
            Icon(slot),
            Badge(slot?.quantity)
        ]
    };
}
