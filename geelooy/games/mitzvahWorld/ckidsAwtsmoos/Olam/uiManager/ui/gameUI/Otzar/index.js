
/**
 * B"H
 * @module Otzar (The Treasury)
 * @description
 * THE PALACE OF POSSESSIONS
 * 
 * "And they shall make for Me a sanctuary..."
 * The Otzar is the central hub for all interaction with the soul's 
 * gathered sparks. It coordinates the Header (Keter), the Grid (Yesod), 
 * and the Equipment (Levushim).
 */
import Header from "./Header/index.js";
import updateGrid from "./Grid/index.js";
import updateEquipment from "./Equipment/index.js";
import inventorySkin from "../../skins/2/inventory.js";

const Otzar = {
    shaym: "inventoryScreen",
    id: "inventoryScreen",
    awtsmoosClick: true,
    className: "awtsmoosInventoryViewer hidden",
    children: [
        { tag: "style", textContent: inventorySkin },
        {
            className: "inventory-container",
            children: [
                Header,
                {
                    className: "inventory-body",
                    children: [
                        {
                            className: "equip-slots-holder",
                            children: [{ className: "equipment-slots" }]
                        },
                        {
                            className: "main-slots-holder",
                            children: [{ className: "slots-grid", shaym: "slots-grid" }]
                        }
                    ]
                }
            ]
        }
    ],

    on: {
        updateSlots: updateGrid,
        updateEquipment,
        async showContextMenu(e, $, ui) {
             const data = e.detail;
             const ctxId = "itemContextMenu";
             let finalX = data.x;
             let finalY = data.y;
             
             // Ensure window boundaries
             if (finalX + 240 > window.innerWidth) finalX = window.innerWidth - 250;
             if (finalY + 280 > window.innerHeight) finalY = window.innerHeight - 290;
             
             await ui.htmlAction({ 
                 shaym: ctxId, 
                 properties: { 
                     contextData: data, 
                     style: { left: finalX + "px", top: finalY + "px" } 
                 },
                 methods: { classList: { remove: "hidden" } }
             });

             
             const ctxEl = $(ctxId);
             if(ctxEl) {
                 ctxEl.contextData = data;
                 await ui.peula(ctxEl, { render: true });
             }
        }
    },
    ready(el, $, ui) {
        // B"H: The Decree of Closure
        // Clicking outside the Treasury or the Menu shall vanish the spectral menu.
        document.addEventListener('mousedown', (e) => {
            const menu = $("itemContextMenu");
            if (menu && !menu.classList.contains('hidden')) {
                if (!menu.contains(e.target)) {
                    ui.htmlAction({ shaym: "itemContextMenu", methods: { classList: { add: "hidden" } } });
                }
            }
        });
    }
};

export default Otzar;
