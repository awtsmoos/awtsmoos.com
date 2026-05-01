
/**
 * B"H
 * @module EquipmentRenderer
 * @description
 * THE RADIATING LEVUSHIM
 */
import EquipmentSlot from "./Slot.js";

export default {
    async render(equipment, equipContainer, ui) {
        if (!equipContainer) return;
        equipContainer.innerHTML = '';

        Object.entries(equipment).forEach(([slotId, itemData]) => {
            ui.html({
                parent: equipContainer,
                ...EquipmentSlot(slotId, itemData, ui)
            });
        });
        
        // B"H: Trigger a reflow
        void equipContainer.offsetWidth;
    }
};



