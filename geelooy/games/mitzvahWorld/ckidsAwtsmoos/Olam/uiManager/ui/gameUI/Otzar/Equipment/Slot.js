/**
 * B"H
 * @module EquipmentSlot
 * @description
 * THE INDIVIDUAL GARMENT VESSEL
 */
import SlotIcon from "../Slot/Icon.js";

export default (slotId, itemData, ui) => {
    return {
        className: `inventory-slot equipment-slot-${slotId} ` + (itemData ? 'occupied' : 'empty'),
        "awtsmoosSlotData": itemData,
        "awtsmoosSlotId": slotId,
        onclick(e, $local, uiInstance, el) {
            if (itemData) {
                uiInstance.peula("ikar", { olamPeula: { unequipItem: slotId } });
            }
        },
        onmouseenter(e, $, uiInstance, el) {
            if (itemData) {
                uiInstance.peula("ikar", { olamPeula: { showTooltip: { item: itemData, x: e.clientX, y: e.clientY } } });
            }
        },
        onmouseleave(e, $, uiInstance) {
            uiInstance.peula("ikar", { olamPeula: { hideTooltip: true } });
        },
        children: [
            SlotIcon(itemData, slotId)
        ]
    };
};
