
/**
 * B"H
 * @module Slot
 * @description
 * THE VESSEL OF POTENTIAL (KELI)
 * 
 * Each slot is a boundary that holds a specific spark (item).
 */
export default function createSlot(slot, i, containerMode, ui) {
    let iconStyle = {};
    let textIcon = null;
    let className = 'inventory-slot';

    if (slot) {
        className += ' occupied';
        if (slot.isEquipped) className += ' equipped';

        const isUrl = slot.icon && (slot.icon.includes('/') || slot.icon.includes('data:'));
        if (isUrl) {
            iconStyle = { backgroundImage: `url("${slot.icon}")` };
        } else {
            textIcon = slot.icon;
        }
    }

    return {
        className: className,
        "awtsmoosSlotData": slot,
        onmouseenter(e, $, uiInstance, el) {
            // Only show tooltip if context menu is hidden
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
                 uiInstance.peula("ikar", { olamPeula: { openContainer: { item: slot, index: i, sourceType: containerMode ? 'container' : 'inventory' } } });
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
            { className: "slot-icon", style: iconStyle, textContent: textIcon },
            (slot && slot.quantity > 1) ? { className: "qty-badge", textContent: slot.quantity } : null
        ]
    };
}
