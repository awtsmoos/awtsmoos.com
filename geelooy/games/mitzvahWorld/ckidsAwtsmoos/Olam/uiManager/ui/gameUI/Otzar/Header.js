
/**
 * B"H
 * @module Header
 * @description
 * THE CROWN OF THE TREASURY (KETER)
 * 
 * This module manifests the upper boundary of the Otzar, 
 * declaring its identity and providing the exit portal.
 */
export default {
    className: "header",
    children: [
        { className: "text", textContent: "THE OTZAR (TREASURY)" }, 
        { 
            tag: "button", className: "back-inv-btn hidden", textContent: "⬅ RETURN", 
            onclick(e, $, ui) { 
                console.log('B"H - 🔙 [OTZAR]: Returning to the main level of the Treasury.');
                ui.peula("ikar", { olamPeula: { closeContainer: true } }); 
            }
        },
        { 
            tag: "button",
            className: "close", 
            textContent: "X", 
            style: { pointerEvents: "auto" },
            onclick(e, $, ui) { 
                console.log('B"H - ❌ [OTZAR]: Closing the Treasury vessels.');
                ui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { add: "hidden" } } }); 
                ui.htmlAction({ shaym: "itemContextMenu", id: "itemContextMenu", methods: { classList: { add: "hidden" } } });
            } 
        }
    ]
};
