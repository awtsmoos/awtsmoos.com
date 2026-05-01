
/**
 * B"H
 * @module Grid
 * @description
 * THE FOUNDATION OF THE TREASURY
 */
import Renderer from "./Renderer.js";

export default async function updateGrid(e, $, ui) {
    const { slots, containerMode, containerName } = e.detail;
    
    const slotsContainer = $("slots-grid") || document.getElementById("slots-grid");
    const titleEl = document.querySelector(".inventory-title");

    if (titleEl) {
        titleEl.textContent = containerMode ? (containerName || "Container").toUpperCase() : "THE OTZAR (TREASURY)";
    }

    if (slotsContainer) {
        await Renderer.render(slots, slotsContainer, containerMode, ui);
    }
}
