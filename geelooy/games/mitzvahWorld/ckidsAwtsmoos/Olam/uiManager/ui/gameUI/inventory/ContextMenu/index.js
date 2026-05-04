
/**
 * B"H
 * @module ItemContextMenu
 * Entry point for the contextual intellect (Mochin) over physical sparks.
 * Uses profound event delegation to bypass the worker veil.
 */

import ContextMenuRenderer from "./Renderer.js";

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
         * When the soul clicks anywhere within the menu, we trace the source.
         */
        async click(e, $, ui) {
            const btn = e.target.closest('.ctx-btn');
            if (btn) {
                // Halt the propagation to avoid closing other panels accidentally
                e.stopPropagation(); 
                
                const payloadStr = btn.getAttribute('data-awts-payload');
                if (payloadStr && payloadStr !== "null") {
                    try {
                        const payload = JSON.parse(decodeURIComponent(payloadStr));
                        // B"H: silent

                        await ui.peula("ikar", { olamPeula: payload });
                    } catch (err) {
                        console.error("B\"H - Failed to unpack sacred payload:", err);
                    }
                }
                
                // Dissolve the menu
                await ui.htmlAction({ shaym: "itemContextMenu", methods: { classList: { add: "hidden" } } });
            }
        }
    }
};
