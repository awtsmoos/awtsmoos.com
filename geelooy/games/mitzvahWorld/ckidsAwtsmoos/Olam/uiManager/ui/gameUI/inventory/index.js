
/**
 * B"H
 * @module InventoryViewer
 * @description
 * * Chapter 17: The GREAT LEDGER OF POSSESSIONS
 * Central Hub for the rendering of slots, equipment, and the great Treasury context menu.
 * "And they brought the Tabernacle unto Moses... the vessels, and all his furniture."
 * * This module binds the fragmented slot and equipment logic into a single 
 * coherent palace of interaction.
 */
import updateSlots from "./slots.js";
import updateEquipment from "./equipment.js";
import ContextMenuRenderer from "./ContextMenu/Renderer.js";

const ItemContextMenu = {
    shaym: "itemContextMenu",
    className: "awtsmoosContextMenu hidden",
    awtsmoosClick: true,
    style: { pointerEvents: "auto" }, // B"H: The Voice of Decision must be solid!
    on: {
        async render(e, $, ui) {
            await ContextMenuRenderer.render(e.target, $, ui);
        },
        
        async click(e, $, ui) {
            const btn = e.target.closest('.ctx-btn');
            if (btn) {
                e.stopPropagation(); 
                const payloadStr = btn.getAttribute('data-awts-payload');
                if (payloadStr && payloadStr !== "null") {
                    try {
                        const payload = JSON.parse(decodeURIComponent(payloadStr));
                        // B"H: Execute the decree on the Ikar (Main World) via the event bus
                        await ui.peula("ikar", { olamPeula: payload });
                    } catch (err) {
                        console.error("B\"H - Menu Payload Error:", err);
                    }
                }
                // Dissolve the menu back into the potential
                await ui.htmlAction({ 
                    shaym: "itemContextMenu", 
                    methods: { classList: { add: "hidden" } } 
                });
            }
        }
    }
};

export default {
    shaym: "inventoryScreen",
    id: "inventoryScreen",
    awtsmoosClick: true,
    className: "awtsmoosInventoryViewer hidden",
    style: { pointerEvents: "auto" }, // PIERCING THE VOID
    children: [
        {
            className: "header",
            children: [
                { className: "text", textContent: "THE OTZAR (TREASURY)" }, 
                { 
                    tag: "button", className: "back-inv-btn hidden", textContent: "⬅ RETURN", 
                    onclick(e, $, ui) { ui.peula("ikar", { olamPeula: { closeContainer: true } }); }
                },
                { 
                    className: "close", textContent: "X", 
                    onclick(e, $, ui) { 
                        ui.htmlAction({ shaym: "inventoryScreen", methods: { classList: { add: "hidden" } } }); 
                        ui.htmlAction({ shaym: "itemContextMenu", methods: { classList: { add: "hidden" } } });
                    } 
                }
            ]
        },
        {
            className: "inventory-body",
            children: [
                {
                    className: "equip-slots-holder",
                    children: [{ className: "equipment-slots" }]
                },
                {
                    className: "main-slots-holder",
                    children: [{ className: "slots" }]
                }
            ]
        },
        ItemContextMenu 
    ],
    on: {
        updateSlots,
        updateEquipment,
        async showContextMenu(e, $, ui) {
             const data = e.detail;
             const ctxId = "itemContextMenu";
             
             // B"H: Coordinate Rectification - ensuring menu fits within the physical eye's reach
             let finalX = data.x;
             let finalY = data.y;
             if (finalX + 220 > window.innerWidth) finalX = window.innerWidth - 230;
             if (finalY + 240 > window.innerHeight) finalY = window.innerHeight - 250;
             
             await ui.htmlAction({ 
                 shaym: ctxId, 
                 properties: { 
                     contextData: data, 
                     style: { left: finalX + "px", top: finalY + "px", display: "flex", pointerEvents: "auto" } 
                 },
                 methods: { classList: { remove: "hidden" } }
             });
             
             // Greet the newly manifested element and tell it to render its options
             const ctxEl = $(ctxId);
             if(ctxEl) {
                 ctxEl.contextData = data;
                 await ui.peula(ctxEl, { render: true });
             }
        }
    }
};
