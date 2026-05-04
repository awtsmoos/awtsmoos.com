
/**
 * B"H
 * @module ContextMenu
 * @description
 * 
 * Chapter 44: The Voice of Choice (Da'as)
 * "Behold, I have set before you life and good, death and evil..." (Devarim 30:15)
 * 
 * Every object (Spark) within the inventory demands a choice. The Context Menu is the 
 * manifestation of that choice. This module cleanly structures the pure virtual DOM nodes 
 * and sends them down into the web worker, rendering perfectly on both Desktop and Mobile!
 */

export const ItemContextMenu = {
    shaym: "itemContextMenu",
    className: "awtsmoosContextMenu hidden",
    // No inline styles here, governed strictly by contextMenuCSS.js!
    on: {
        /**
         * @function render
         * @description Emits an array of children directly to the UI renderer.
         */
        async render(e, $, ui) {
            const ctx = e.target;
            const data = ctx.contextData;
            
            if(!data || !data.item) {
                console.error("B\"H: Context Menu requested without a holy vessel!");
                return;
            }

            const item = data.item;
            const titleName = (item.name || item.className || "Spark of Tohu").toUpperCase();
            const targetSlot = item.equipSlot;

            // 1. Shatter the previous manifestation to prevent "Unknown Spark" ghosts
            await ui.htmlAction({ shaym: "itemContextMenu", properties: { innerHTML: "" } });

            // 2. Formulate the array of new geometric children
            const menuChildren = [
                {
                    className: "ctx-title",
                    textContent: titleName
                }
            ];

            const addBtn = (text, color, clickPayload) => {
                menuChildren.push({
                    tag: "button",
                    className: "ctx-btn",
                    style: { borderLeft: `4px solid ${color}` },
                    textContent: text,
                    onclick: async (ev, $local, uiLocal) => {
                         // B"H: silent

                         if (clickPayload) {
                             await uiLocal.peula("ikar", { olamPeula: clickPayload });
                         }
                         await uiLocal.htmlAction({ shaym: "itemContextMenu", methods: { classList: { add: "hidden" } } });
                    }
                });
            };

            // 3. Populate logical decrees
            if (targetSlot) {
                const actionText = targetSlot === 'rightHand' ? "HOLD IN HAND" : "WEAR VESSEL";
                const actionColor = targetSlot === 'rightHand' ? "#00ffed" : "#ff00ea";
                addBtn(actionText, actionColor, { 
                    equipItem: { sourceType: data.sourceType, index: data.index, target: targetSlot } 
                });
            }

            if (item.isContainer) {
                addBtn("OPEN CONTAINER", "#FFD700", { 
                    openContainer: { item, index: data.index, sourceType: data.sourceType } 
                });
            }

            addBtn("DROP FOCUS", "#ff4757", null);

            // 4. Emit the newly forged elements into the exact parent node
            await ui.html({
                parent: "itemContextMenu",
                children: menuChildren,
                ready(el) {
                    // B"H: silent

                }
            });
        }
    }
};
