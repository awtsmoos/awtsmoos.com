/**
 * B"H
 * UI components that involve the in game experience
 */
import shlichusUI from "./shlichusUI.js";
import joystick from "./joystick.js";
import instructions from "./instructions.js";
import createProfile from "/scripts/awtsmoos/social/profileDropdown.js";

import loginBtn from "./loginBtn.js";
import startSlotsConfig from "./startSlotsConfig.js";
var ui = [instructions, {
    shaym: "menuTop",
    className: "menuTop",
    children: [{
        shaym: "menu button",
        className: "menuBtn",
        innerHTML: /*html*/
        `
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M4 16H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 8H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 24H28" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <rect class="menuBtnRect" x="0" y="0" width="100%" height="100%" />
                </svg>
                `,
        ready(me, $) {
            var rd = me.getElementsByClassName("btn")[0];
            if (!rd)
                return;
            rd.onclick = me.onclick;
        },
        onclick(e, $) {

            var m = $("menu")

            if (!m)
                return;

            m.classList.toggle("offscreen");
            m.classList.toggle("onscreen");

            var ins = $("instructions")
            if (!ins)
                return;

        }
    }, {
        shaym: "title text holder",
        className: "titleTxt",
        children: [{
            tag: "span",
            textContent: "Mitzvah",
            className: "mtz"
        }, {
            tag: "span",
            textContent: "World"
        }, {
            shaym: "Debug",
            className: "hidden",
            textContent: "Debugging"
        }]
    }, loginBtn /*
            {
                shaym: "profile and login",
                className: "loginInfo awtsmoosBtn",
                children: [
                    {
                        className: "loginHolder",
                        children: [
                            
                            
                        ]
                    }
                ]
            }*/
    ],
    style: {
        top: "0px"
    },
},
{
    shaym: "msg npc",
    style: {
        bottom: "20px",
        right: "15px"
    },
    awtsmoosClick: true,
    className: "dialogue npc",
},
{
    shaym: "msg chossid",
    style: {
        bottom: "20px",
        left: "15px"
    },
    awtsmoosClick: true,
    className: "dialogue chossid",
},
{
    shaym: "approach npc msg",
    className: "asApproachNpc hidden",

    awtsmoosOnChange: {
        textContent(e, me) {

            me.innerText = "Press B to talk to " + e.data.textContent;

        }
    },
},
{
    shaym: "approach portal msg",
    className: "asApproachNpc hidden",
    awtsmoosOnChange: {
        textContent(e, me) {

            me.innerText = "Press B to travel to " + e.data.textContent;

        }
    },
}, {
    shaym: "Saving",
    className: "hidden menuItm",
    innerHTML: "Saving...",
    on: {
        awtsmoosHidden(e, $, ui) {
            console.log("Hidden!")
        },
        awtsmoosRevealed(e, $, ui) {
            console.log(`
                    B"H

                    Starting to save the world!
                `)
            var ikar = $("ikar");
            if (!ikar) {
                alert("Something's wrong with menu")
                console.log(e, ikar);
                return;
            }
            ikar.dispatchEvent(
            new CustomEvent("olamPeula",{
                detail: {
                    downloadWorld: true
                }
            }));
            /* */
        },
    }
}, 




{
    shaym: "action bar",
    className: "awtsmoosAction",
    awtsmoosClick: true,
    startSlotsConfig,
    children: [{
        className: "minimize opened",
        onclick(e, $, ui, el) {
            var slots = $("action bar")
            if (!slots)
                return;
            slots.classList.toggle("minimized");
            el.classList.toggle("opened")
            el.classList.toggle("closed")
        }

    }, {
        className: "slots",
        shaym: "action slots"
    }],
    ready(el, $f, ui) {
        // B"H: This function now ONLY creates the static "bag" icon.
        const slotConfig = el.startSlotsConfig;
        if (!slotConfig || !slotConfig.slots || !slotConfig.slots[0]) return;
        
        const bagSlotInfo = slotConfig.slots[0];
        const slotsContainer = $f("action slots");

        const tooltip = $f("icon tooltip");

        // Tooltip functions for the bag icon
        function showTooltip() {
            if (!tooltip) return;
            tooltip.innerHTML = `<div class="header">${bagSlotInfo.name}</div><div class="description">${bagSlotInfo.description}</div>`;
            tooltip.classList.remove("hidden");
        }
        function moveTooltip(e) {
            if (!tooltip) return;
            tooltip.style.left = e.pageX + "px";
            tooltip.style.top = e.pageY + "px";
        }
        function hideTooltip() {
            if (!tooltip) return;
            tooltip.classList.add("hidden");
        }

        // Create the bag slot element
        ui.html({
            parent: slotsContainer,
            className: "actionSlot occupied",
            children: [{
                className: "innerSlot",
                on: {
                    mouseenter: showTooltip,
                    mousemove: moveTooltip,
                    mouseleave: hideTooltip
                },
                onclick(e) {
                    const inventoryScreen = $f(bagSlotInfo.show);
                    if (inventoryScreen) {
                        inventoryScreen.classList.remove("hidden");
                    }
                },
                children: [{
                    className: "slotBtn",
                    style: { backgroundImage: `url(${bagSlotInfo.icon})` }
                }]
            }]
        });
    },
    on: {
        // B"H: This new event handler manages all DYNAMIC slots (items moved from inventory)
        updateActionSlots(e, $, ui) {
            const actionSlotsData = e.detail;
            const slotsContainer = $("action slots");
            if (!slotsContainer) return;

            // Clear only the dynamic slots, leaving the static "bag" icon (child at index 0) untouched.
            while (slotsContainer.children.length > 1) {
                slotsContainer.removeChild(slotsContainer.lastChild);
            }

            // Create the new dynamic slots from the inventory data
            actionSlotsData.forEach((slotData, index) => {
                const slot = ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        onclick: () => {
                            if (!slotData) return;
                            const action = slotData.isEquipped ? "unequipItem" : "equipItem";
                            const payload = slotData.isEquipped 
                                ? slotData.equippedIn 
                                : { sourceType: 'action', index, target: slotData.equipSlot || 'rightHand' };
                            ui.peula("ikar", { olamPeula: { [action]: payload }});
                        },
                        children: slotData ? [
                            { className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` }},
                            { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });

                // Make the slot a target for drag-and-drop
                slot.ondragover = (event) => event.preventDefault();
                slot.ondrop = (event) => {
                    event.preventDefault();
                    const fromInventoryIndex = event.dataTransfer.getData("text/plain");
                    if (fromInventoryIndex) {
                        ui.peula("ikar", {
                            olamPeula: { moveToActionBar: { fromInventoryIndex: parseInt(fromInventoryIndex), toActionIndex: index } }
                        });
                    }
                };
            });
        }
    }
},





































 {
    shaym: "inventoryScreen",
    awtsmoosClick: true,
    className: "awtsmoosInventoryViewer hidden",
    ready(el, $, ui) {
        // Initial data request
        setTimeout( () => {
            ui.peula("ikar", {
                olamPeula: {
                    requestInventoryUpdate: true
                }
            });
        }
        , 0);
    },
    on: {
        // 1. Update Inventory Grid
        updateSlots(e, $, ui) {
            const slotsData = e.detail;
            const inventoryElement = $("inventoryScreen");
            if (!inventoryElement) return;

            const slotsContainer = inventoryElement.querySelector(".slots");
            if (!slotsContainer) return;

            slotsContainer.innerHTML = '';

            slotsData.forEach((slotData, index) => {
                const showTooltip = (event) => {
                    if (!slotData) return;
                    const tooltip = $("icon tooltip");
                    if (tooltip) {
                        tooltip.innerHTML = `<div class="header">${slotData.name || 'Item'}</div><div class="description">${slotData.description || ''}</div>`;
                        tooltip.classList.remove('hidden');
                        const x = event.pageX || (event.touches && event.touches[0].pageX);
                        const y = event.pageY || (event.touches && event.touches[0].pageY);
                        if(x && y) {
                             tooltip.style.left = (x + 15) + 'px';
                             tooltip.style.top = (y + 15) + 'px';
                        }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    draggable: !!slotData, // B"H: Make item draggable
                    on: {
                        dragstart: (event) => { // Store its index when dragging
                            event.dataTransfer.setData("text/plain", index);
                        }
                    },
                    children: [{
                        // B"H: Add equipped indicator class if needed
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        onclick: (event) => {
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: {
                                        item: slotData,
                                        index: index,
                                        x: rect.right,
                                        y: rect.top,
                                        sourceType: 'inventory' // Specify source
                                    }
                                });
                            }
                        },
                        on: {
                            mouseenter: showTooltip,
                            mousemove: showTooltip,
                            mouseleave: hideTooltip,
                            touchstart: showTooltip,
                        },
                        children: slotData ? [{
                            tag: 'div', className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` }
                        }, {
                            tag: 'div', className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : ''
                        }] : []
                    }]
                });
            });
        },

        // 2. Update Equipment Sidebar (No changes needed here from your version)
        /**
         * B"H
         * The soul's garments (Levushim) must be made manifest in the world.
         * This function is the mirror that reflects what the Chossid has equipped,
         * drawing the item's essence from the potential of the inventory and displaying it
         * in the sacred space of the equipment slots. It is here that a simple tool
         * or garment is revealed to be a vessel for holy action.
         */
        updateEquipment(e, $, ui) {
            const equipData = e.detail;

            const inventoryElement = $("inventoryScreen");
            if (!inventoryElement) return;

            const equipContainer = inventoryElement.querySelector(".equipment-slots");
            if (!equipContainer) return;

            equipContainer.innerHTML = "";

            const slotOrder = ["head", "jacket", "legs", "feet", "rightHand", "leftHand"];

            slotOrder.forEach(slotName => {
                const item = equipData[slotName];
                ui.html({
                    parent: equipContainer,
                    className: "equip-slot " + slotName,
                    style: {
                        width: "50px",
                        height: "50px",
                        border: "1px solid #888",
                        background: "rgba(0,0,0,0.3)",
                        position: "relative",
                        margin: "2px",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    },
                    innerHTML: item ? "" : `<span style='font-size:10px; color:#aaa; text-transform:uppercase'>${slotName.replace("Hand", "")}</span>`,
                    onclick: (ev) => {
                        if (item) {
                            // When clicked, a request is sent to the soul (the worker)
                            // to retract this garment's light from the world (unequip).
                            ui.peula("ikar", {
                                olamPeula: {
                                    unequipItem: slotName
                                }
                            });
                        }
                    },
                    children: item ? [{
                        className: "slotBtn",
                        style: {
                            backgroundImage: `url(${item.icon})`,
                            width: "100%",
                            height: "100%",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center"
                        }
                    }] : []
                });
            });
        },

        // 3. Context Menu
        showContextMenu(e, $, ui) {
            const {item, index, x, y, sourceType} = e.detail;
            $("contextMenu")?.remove();
            
            // Your existing styles and structure are preserved
            const btnStyle = {
                background: "none", border: "none", color: "white", textAlign: "left",
                cursor: "pointer", padding: "8px", borderBottom: "1px solid #444", fontSize: "14px"
            };

            ui.html({
                shaym: "contextMenu", parent: "ikar",
                style: {
                    position: "absolute", left: x + "px", top: y + "px", background: "rgba(20, 20, 40, 0.95)",
                    border: "2px solid #FFD700", borderRadius: "8px", zIndex: 2000, display: "flex",
                    flexDirection: "column", padding: "5px", gap: "5px", minWidth: "120px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.5)"
                },
                children: [
                    // B"H: Dynamic Equip/Unequip button
                    item.isEquipped ? {
                        tag: "button", className: "ctx-btn", style: btnStyle, textContent: "Unequip",
                        onclick: () => {
                            ui.peula("ikar", { olamPeula: { unequipItem: item.equippedIn } });
                            $("contextMenu")?.remove();
                        }
                    } : {
                        tag: "button", className: "ctx-btn", style: btnStyle, textContent: "Equip",
                        onclick: () => {
                            const target = item.equipSlot || 'rightHand';
                            ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } });
                            $("contextMenu")?.remove();
                        }
                    },
                    // B"H: Conditional "Move to Action Bar" button
                    sourceType === 'inventory' ? {
                        tag: "button", className: "ctx-btn", style: btnStyle, textContent: "Move to Action Bar",
                        onclick: () => {
                            const actionSlots = $("action slots").children;
                            let targetIndex = -1;
                            for(let i = 1; i < actionSlots.length; i++) {
                                if(actionSlots[i].classList.contains('empty')) {
                                    targetIndex = i - 1;
                                    break;
                                }
                            }
                            if(targetIndex === -1) targetIndex = 0;

                            ui.peula("ikar", { olamPeula: { moveToActionBar: { fromInventoryIndex: index, toActionIndex: targetIndex } } });
                            $("contextMenu")?.remove();
                        }
                    } : null,
                    // Your existing close button
                    {
                        tag: "button", className: "ctx-btn close", textContent: "Close",
                        onclick: () => $("contextMenu").remove()
                    }
                ].filter(Boolean) // This filters out the null 'Move' button when not needed
            });
        }
    },
    
    // STRUCTURE
    children: [{
        className: "header",
        children: [{
            className: "text",
            textContent: "Inventory"
        }, {
            className: "close",
            innerHTML: "X",
            onclick(e, $f) {
                $f("inventoryScreen")?.classList.add("hidden");
                $f("contextMenu")?.remove();
            }
        }]
    }, {
        className: "inventory-body",
        children: [
            // LEFT SIDEBAR: Equipment Wrapper
            {
                className: "equip-slots-holder",
                children: [
                    {
                        className: "equipment-slots"
                        // Styles handled in CSS now
                    }
                ]
            }, 
            // RIGHT SIDE: Inventory Grid Wrapper
            {
                className: "main-slots-holder",
                children: [
                    {
                        className: "slots"
                        // Styles handled in CSS now
                    }
                ]
            }
        ]
    }]
}, {
    shaym: "icon tooltip",
    className: "awtsmoos tooltip hidden"
}, {
    shaym: "block selector menu",
    className: "blockSelected hidden",
    awtsmoosClick: true,
    on: {
        awtsmoosOptions(e) {
            console.log("got options", e.detail);
            var array = Array.from(e.target.children).map(q => q.innerText)

            window?.socket?.postMessage?.({
                uiEvented: {
                    awtsmoosResponse: {
                        array
                    },
                    id: e.detail?._awtsmoosId
                }
            })
        },
    },
    children: ["Grab", // "Rotate", "Scale", 
    "Delete"].map( (q, i, a) => ({
        shaym: "menu item " + q,
        innerHTML: q,
        className: q,
        on: {

            awtsmoosHighlight(e) {
                var k = e.detail;
                var par = e.target.parentNode;
                Array.from(par.children).forEach(w => w.classList.remove("active"));

                e.target.classList.add("active")
                console.log("Highlighted", e)
            }
        },
        onclick: async (e) => {

            ikar.dispatchEvent(
            new CustomEvent("olamPeula",{
                detail: {
                    activeObjectAction: e.target.innerHTML
                }
            }));
        }
    }))
}
].concat(shlichusUI);

if (navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
    console.log("Doing mobile")
}

export default ui;
