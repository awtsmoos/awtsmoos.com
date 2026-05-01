
/**
 * B"H
 * @module ActionBar
 * @description
 * * Chapter 15: The Right Hand of Action
 * The Action Bar is the manifest intent of the soul's current focus.
 * It holds the tools and blocks that the user has decided to bring 
 * from the potential of the Treasury (Inventory) into the active 
 * creation of the world. 
 * * This module dynamically handles the creation of action slots, 
 * mapping them to keys and mouse interactions, and ensures they 
 * remain clickable against the backdrop of the 3D void.
 */
import startSlotsConfig from "../startSlotsConfig.js";

const ActionBar = {
    /** @property {string} shaym - Unique spiritual identifier. */
    shaym: "action bar",
    id: "actionBar",
    className: "awtsmoosAction",
    awtsmoosClick: true,
    style: {
        pointerEvents: "none", // Background of container lets void clicks through to the world!
    },
    startSlotsConfig,
    children:[{
        className: "minimize opened",
        style: {
            pointerEvents: "auto" // Emphatic physical presence for the minimize button!
        },
        onclick(e, $, ui, el) {
            var bar = $("action bar") || document.getElementById("actionBar");
            if (!bar) return;
            bar.classList.toggle("minimized");
            el.classList.toggle("opened");
            el.classList.toggle("closed");
        }
    }, { 
        className: "slots", 
        shaym: "action slots", 
        id: "actionSlots",
        style: { pointerEvents: "none" },
        children: [
            // B"H: The Sacred Bag (Inventory Toggle) is now a permanent vessel!
            {
                className: "actionSlot occupied bag-slot",
                style: { pointerEvents: "auto" },
                onclick: async (e, $$, uui) => {
                    const inventoryScreen = $$("inventoryScreen") || document.getElementById("inventoryScreen");
                    if (inventoryScreen) {
                        const isHidden = inventoryScreen.classList.contains("hidden");
                        if (isHidden) {
                            await uui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { remove: "hidden" } } });
                        } else {
                            await uui.htmlAction({ shaym: "inventoryScreen", id: "inventoryScreen", methods: { classList: { add: "hidden" } } });
                        }
                    }
                },
                children: [{
                    className: "innerSlot",
                    children: [{
                        className: "slotBtn",
                        style: {
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "32px",
                            pointerEvents: "none"
                        },
                        textContent: "🎒"
                    }]
                }]
            }
        ]
    }],
    on: {
        /**
         * @method updateActionSlots
         * @description Refreshes the physical manifestation of the tools/blocks based on current inventory data.
         */
        async updateActionSlots(e, $, ui) {
            const actionSlotsData = e.detail || [];
            
            // B"H: Remove previous dynamic slots, but KEEP the Bag!
            const slotsContainer = $("actionSlots") || document.getElementById("actionSlots");
            if (slotsContainer) {
                // Remove all children EXCEPT the bag-slot
                const dynamicSlots = slotsContainer.querySelectorAll(".actionSlot:not(.bag-slot)");
                dynamicSlots.forEach(s => s.remove());
            }

            // 2. Manifest the Actionable Vessels (Tools/Blocks)
            for (let index = 0; index < actionSlotsData.length; index++) {
                const slotData = actionSlotsData[index];
                let iconStyle = {};
                let textIcon = null;
                let className = 'slotBtn';
                
                if (slotData) {
                    const isUrl = slotData.icon && (slotData.icon.includes('/') || slotData.icon.includes('data:'));
                    if (isUrl) {
                        const safeUrl = slotData.icon.replace(/[\r\n]+/g, "");
                        if (slotData.isTintable && slotData.customData && slotData.customData.color) {
                            iconStyle = {
                                backgroundColor: slotData.customData.color,
                                maskImage: `url("${safeUrl}")`, WebkitMaskImage: `url("${safeUrl}")`,
                                maskSize: "contain", WebkitMaskSize: "contain",
                                maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat",
                                maskPosition: "center", width: "100%", height: "100%"
                            };
                            className = 'slotBtn tinted-icon';
                        } else {
                            iconStyle = { backgroundImage: `url("${safeUrl}")` };
                        }
                    } else if (slotData.icon) {
                        textIcon = slotData.icon;
                        iconStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px', width: '100%', height: '100%' };
                    }
                }

                await ui.html({
                    parent: "actionSlots",
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    style: { pointerEvents: "auto" },
                    "awtsmoosSlotData": slotData,
                    "awtsmoosIndex": index,
                    "awtsmoosSourceType": "action",
                    ready(el, $local, uiInstance) { 
                         if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                            const handleClick = (event) => {
                                if (!slotData) return;
                                
                                const isContainer = slotData.isContainer || slotData.className === 'Container' || (slotData.customData && slotData.customData.slots);

                                if (isContainer) {
                                    uiInstance.peula("ikar", { 
                                        olamPeula: { openContainer: { item: slotData, index: index, sourceType: 'action' } } 
                                    });
                                    uiInstance.htmlAction({ shaym: "inventoryScreen", methods: { classList: { remove: "hidden" } } });
                                } else {
                                    const explicitTarget = slotData.equipSlot || 'rightHand';
                                    uiInstance.peula("ikar", { 
                                        olamPeula: { equipItem: { sourceType: 'action', index: index, target: explicitTarget } } 
                                    });
                                }
                            };
                            window.attachSlotDragListeners(el, { item: slotData }, 'action', index, uiInstance, handleClick);
                         }
                    },
                    children:[{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        children: slotData ?[
                             { className: className, style: iconStyle, textContent: textIcon },
                             { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });
            }
        }
    }
};

export default ActionBar;
