
/**
 * B"H
 * @module Grid
 * @description
 * THE FOUNDATION OF YESOD
 * 
 * Manages the rendering of the primary inventory grid.
 */
import createSlot from "./Slot.js";

export default async function updateGrid(e, $, ui) {
    const { slots, containerMode, containerName } = e.detail;
    
    const slotsContainer = $("slots-grid") || document.getElementById("slots-grid");
    const titleEl = document.querySelector(".inventory-title");

    if (titleEl) {
        titleEl.textContent = containerMode ? (containerName || "Container").toUpperCase() : "THE OTZAR (TREASURY)";
    }

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
