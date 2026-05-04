
/**
 * B"H
 * @module ItemContextMenu
 * Entry point for the contextual intellect (Mochin) over physical sparks.
 * Uses profound event delegation to bypass the worker veil.
 */

import ContextMenuRenderer from "./Renderer.js";
import { Toast } from "../../components/Toast.js";

export const ItemContextMenu = {
    shaym: "itemContextMenu",
    className: "awtsmoosContextMenu hidden",
    awtsmoosClick: true,
    on: {
        async render(e, $, ui) {
            await ContextMenuRenderer.render(e.target, $, ui);
        },
        /**
         * B"H: Event Delegation Handler
         */
        async click(e, $, ui) {
            const btn = e.target.closest('.ctx-btn');
            if (btn) {
                e.stopPropagation(); 
                const payloadStr = btn.getAttribute('data-awts-payload');
                if (payloadStr && payloadStr !== "null") {
                    try {
                        const payload = JSON.parse(decodeURIComponent(payloadStr));
                        // B"H: silent

                        
                        // B"H: Providing feedback to the soul
                        const actionKey = Object.keys(payload)[0];
                        Toast.show(`Executing: ${actionKey}`, "info", ui);
                        
                        await ui.peula("ikar", { olamPeula: payload });
                    } catch (err) {
                        console.error("B\"H - Failed to unpack sacred payload:", err);
                        Toast.show("Decree failed!", "error", ui);
                    }
                }
                await ui.htmlAction({ shaym: "itemContextMenu", methods: { classList: { add: "hidden" } } });
            }
        }
    }
};


