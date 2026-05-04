
/**
 * B"H
 * @module Equipment
 * @description
 * THE GARMENTS OF THE SOUL
 */
import Renderer from "./Renderer.js";

export default async function updateEquipment(e, $, ui) {
    const equipment = e.detail || e;
    // B"H: silent

    
    const inventoryElement = $("inventoryScreen") || document.getElementById("inventoryScreen");
    if (!inventoryElement) return;

    const equipContainer = inventoryElement.querySelector(".equipment-slots");
    if (equipContainer) {
        await Renderer.render(equipment, equipContainer, ui);
    }
}
