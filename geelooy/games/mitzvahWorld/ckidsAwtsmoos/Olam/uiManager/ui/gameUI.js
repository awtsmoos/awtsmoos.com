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
}, {
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

        var slotNumbers = 5;
        var slotsMade = 0;
        for (var i = 0; i < slotNumbers; i++) {
            el.dispatchEvent(new CustomEvent("addSlot",{
                detail: {
                    $f,
                    ui,
                    el
                }
            }));
            slotsMade++;
        }
        var slotConfig = el?.startSlotsConfig;

        console.log(slotConfig, "slotConfig")
        slotConfig?.slots?.forEach?.(s => {
            el.dispatchEvent(new CustomEvent("populateSlot",{
                detail: {
                    sys: {
                        $f,
                        ui,
                        el
                    },
                    slotInfo: s
                }
            }));
        }
        )
    },
    on: {
        populateSlot(e) {
            var {$f, ui, el} = e?.detail?.sys || {};
            var slotInfo = e?.detail?.slotInfo || null;
            if (!slotInfo) {
                return console.log("Sloto error", e);
            }

            var empty = document.querySelector(".actionSlot.empty .innerSlot");
            if (!empty) {
                return console.log("No available slots")
            }

            var elementToShow = slotInfo.show;

            var tooltip = $f("icon tooltip");

            function initTooltip() {
                if (!tooltip) {
                    tooltip = $f("icon tooltip");
                }
                if (!tooltip) {
                    return
                }
                tooltip.innerHTML = `<div class="header">${slotInfo.name}</div><div class="description">${slotInfo?.description}</div>`

            }
            function moveTooltipToMe({x, y}) {
                if (!tooltip) {
                    tooltip = $f("icon tooltip");
                }
                if (!tooltip) {
                    return console.log("no tip");
                }
                if (tooltip.classList.contains("hidden")) {
                    tooltip.classList.remove("hidden")
                }
                tooltip.style.left = x + "px";
                tooltip.style.top = y + "px";

            }

            function hideTooltip() {
                if (!tooltip) {
                    tooltip = $f("icon tooltip");
                }
                if (!tooltip)
                    return;
                tooltip.innerHTML = ""
                tooltip.classList.add("hidden")
            }
            var slotBtn = ui.html({
                parent: empty,
                className: "slotBtn",
                style: {
                    backgroundImage: `url(${slotInfo.icon})`
                },
                onclick(e) {
                    var myEl = $f(elementToShow);
                    if (myEl) {
                        myEl.classList.remove("hidden")
                    }
                }

            });

            empty.onmouseenter = (e) => {
                initTooltip()
            }
            empty.onmousemove = (e) => {

                moveTooltipToMe({
                    x: e.pageX,
                    y: e.pageY
                })
            }
            empty.ontouchenter = (e) => {
                initTooltip()
            }
            empty.ontouchmove = (e) => {
                moveTooltipToMe({
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY
                })
            }
            empty.onblur = () => {
                hideTooltip()
            }

            empty.onmouseleave = (e) => {
                hideTooltip()
            }

            empty.parentNode.classList.remove("empty");

            empty.parentNode.classList.add("occupied");

            if (!elementToShow) {
                empty.parentNode.classList.add("disabled")
            }

        },
        addSlot(e) {
            var {$f, ui, el
            } = e.detail;
            //  console.log(e)
            ui.$h({
                parent: "action slots",
                className: "actionSlot empty",
                children: [{
                    className: "innerSlot"
                }]
            })
        }
    }
}, {
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

            // FIX: Get the element using $() first
            const inventoryElement = $("inventoryScreen");
            if (!inventoryElement)
                return;

            // Then use querySelector on the element
            const slotsContainer = inventoryElement.querySelector(".slots");
            if (!slotsContainer)
                return;

            slotsContainer.innerHTML = '';
            // Clear existing slots

            slotsData.forEach( (slotData, index) => {
                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    children: [{
                        className: "innerSlot",
                        onclick: (event) => {
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: {
                                        item: slotData,
                                        index: index,
                                        x: rect.right,
                                        y: rect.top
                                    }
                                });
                            }
                            ui.peula("ikar", {
                                olamPeula: {
                                    selectInventorySlot: {
                                        index
                                    }
                                }
                            });
                            document.querySelectorAll('.innerSlot.selected').forEach(el => el.classList.remove('selected'));
                            event.currentTarget.classList.add('selected');
                        }
                        ,
                        // ... (Tooltip logic remains the same) ...
                        on: {
                            mouseenter: (event) => {
                                if (!slotData)
                                    return;
                                const tooltip = $("icon tooltip");
                                if (tooltip) {
                                    tooltip.innerHTML = `<div class="header">${slotData.name || 'Item'}</div><div class="description">${slotData.description || ''}</div>`;
                                    tooltip.classList.remove('hidden');
                                }
                            }
                            ,
                            mousemove: (event) => {
                                const tooltip = $("icon tooltip");
                                if (tooltip && !tooltip.classList.contains("hidden")) {
                                    tooltip.style.left = (event.pageX + 15) + 'px';
                                    tooltip.style.top = (event.pageY + 15) + 'px';
                                }
                            }
                            ,
                            mouseleave: () => $("icon tooltip")?.classList.add('hidden')
                        },
                        children: slotData ? [{
                            tag: 'div',
                            className: 'slotBtn',
                            style: {
                                backgroundImage: `url(${slotData.icon})`
                            }
                        }, {
                            tag: 'div',
                            className: 'slotQuantity',
                            textContent: slotData.quantity > 1 ? slotData.quantity : ''
                        }] : []
                    }]
                });
            }
            );
        },

        // 2. Update Equipment Sidebar (THE FIX IS HERE)
        updateEquipment(e, $, ui) {
            const equipData = e.detail;

            // FIX: Get the element using $() first
            const inventoryElement = $("inventoryScreen");
            if (!inventoryElement)
                return;

            // Now use querySelector on the HTML element
            const equipContainer = inventoryElement.querySelector(".equipment-slots");
            if (!equipContainer)
                return;

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
                    // If item exists show it, otherwise show slot name
                    innerHTML: item ? "" : `<span style='font-size:10px; color:#aaa; text-transform:uppercase'>${slotName.replace("Hand", "")}</span>`,

                    onclick: (ev) => {
                        if (item) {
                            // Send unequip command to worker
                            ui.peula("ikar", {
                                olamPeula: {
                                    unequipItem: slotName
                                }
                            });
                        }
                    }
                    ,
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
            }
            );
        },

        // 3. Context Menu
        showContextMenu(e, $, ui) {
            const {item, index, x, y} = e.detail;
            const existing = $("contextMenu");
            if (existing)
                existing.remove();

            ui.html({
                shaym: "contextMenu",
                parent: "ikar",
                style: {
                    position: "absolute",
                    left: x + "px",
                    top: y + "px",
                    background: "rgba(20, 20, 40, 0.95)",
                    border: "2px solid #FFD700",
                    borderRadius: "8px",
                    zIndex: 2000,
                    display: "flex",
                    flexDirection: "column",
                    padding: "5px",
                    gap: "5px",
                    minWidth: "100px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.5)"
                },
                children: [{
                    tag: "button",
                    className: "ctx-btn",
                    style: {
                        background: "none",
                        border: "none",
                        color: "white",
                        textAlign: "left",
                        cursor: "pointer",
                        padding: "8px",
                        borderBottom: "1px solid #444",
                        fontSize: "14px"
                    },
                    textContent: "Equip",
                    onclick: () => {
                        const target = item.equipSlot || "rightHand";
                        ui.peula("ikar", {
                            olamPeula: {
                                equipItem: {
                                    index,
                                    target
                                }
                            }
                        });
                        $("contextMenu").remove();
                    }
                }, {
                    tag: "button",
                    className: "ctx-btn close",
                    
                    textContent: "Close",
                    onclick: () => $("contextMenu").remove()
                }]
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
