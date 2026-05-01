
/**
 * B"H
 * @module GridRenderer
 * @description
 * THE RADIATING YESOD
 */
import createSlot from "../Slot/index.js";

export default {
    async render(slots, slotsContainer, containerMode, ui) {
        if (!slotsContainer) return;
        slotsContainer.innerHTML = '';
        
        if (Array.isArray(slots)) {
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                ui.html({
                    parent: slotsContainer,
                    ...createSlot(slot, i, containerMode, ui)
                });
            }
        }
    }
};
