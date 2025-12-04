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
import characterDesigner from "./characterDesigner.js"; 

// B"H: Store Logic & UI
const storeScreen = {
    shaym: "storeScreen",
    className: "store-container hidden",
    awtsmoosClick: true,
    activeTab: 'buy',
    npcId: null,
    
    on: {
        open(e, $, ui) {
            const data = e.detail; // B"H FIX: Direct access to payload
            const store = $("storeScreen");
            store.classList.remove("hidden");
            store.npcId = data.entityId;
            
            const title = store.querySelector(".store-title");
            if(title) title.textContent = data.npcName + "'s Store";
            
            store.activeTab = data.mode || 'buy';
            store.items = data.items;
            store.playerItems = data.playerInventory;
            
            ui.peula(store, { render: true });
        },
        
        update(e, $, ui) {
             const data = e.detail; // B"H FIX: Direct access to payload
             const store = $("storeScreen");
             if(data.items) store.items = data.items;
             if(data.playerInventory) store.playerItems = data.playerInventory;
             ui.peula(store, { render: true });
        },
        
        close(e, $, ui) {
            $("storeScreen").classList.add("hidden");
        },
        
        render(e, $, ui) {
            const store = $("storeScreen");
            const grid = store.querySelector(".store-grid");
            const details = store.querySelector(".store-details");
            const tabs = store.querySelectorAll(".store-tab");
            
            // Update Tabs
            tabs.forEach(t => {
                if(t.dataset.tab === store.activeTab) t.classList.add("active");
                else t.classList.remove("active");
            });
            
            grid.innerHTML = "";
            details.innerHTML = "<div style='opacity:0.5'>Select an item to see details</div>";

            let itemsToRender = [];
            
            if (store.activeTab === 'buy') {
                itemsToRender = store.items.map((itm, idx) => ({...itm, originalIndex: idx, type: 'buy'}));
            } else if (store.activeTab === 'sell') {
                // Filter sellable items from player inventory
                store.playerItems.forEach((itm, idx) => {
                    if(itm && itm.sellValue && itm.className !== 'Coin') {
                        itemsToRender.push({...itm, originalIndex: idx, type: 'sell', price: itm.sellValue});
                    }
                });
            }

            itemsToRender.forEach(item => {
                ui.html({
                    parent: grid,
                    className: "store-item",
                    onclick: () => ui.peula(store, { showDetails: item }),
                    children: [
                        { className: "store-item-icon", style: { backgroundImage: item.icon ? `url(${item.icon})` : 'none' } }, // B"H: Need icons!
                        { className: "store-item-qty", textContent: item.quantity || 1 }
                    ]
                });
            });
        },
        
        showDetails(e, $, ui) {
            const item = e.detail;
            const details = $("storeScreen").querySelector(".store-details");
            details.innerHTML = "";
            
            ui.html({
                parent: details,
                children: [
                    { tag: "h3", textContent: item.name },
                    { textContent: item.description || "No description." },
                    { textContent: item.type === 'buy' ? `Cost: ${item.price} Perutahs` : `Value: ${item.price} Perutahs` },
                    {
                        tag: "button",
                        className: "action-btn",
                        textContent: item.type === 'buy' ? "BUY" : "SELL",
                        onclick: () => {
                            ui.peula("ikar", {
                                olamPeula: {
                                    htmlPeula: {
                                        shopAction: {
                                            action: item.type,
                                            payload: { index: item.originalIndex },
                                            entityId: $("storeScreen").npcId
                                        }
                                    }
                                }
                            });
                        }
                    }
                ]
            });
        }
    },
    
    children: [
        // Header
        {
            className: "store-header",
            children: [
                { className: "store-title", textContent: "Store" },
                { 
                    tag: "button", className: "awtsmoosBtn", textContent: "Close",
                    onclick(e, $) { $("storeScreen").classList.add("hidden"); }
                }
            ]
        },
        // Tabs
        {
            className: "store-tabs",
            children: [
                { 
                    className: "store-tab", textContent: "BUY", dataset: { tab: 'buy' },
                    onclick(e, $, ui) { $("storeScreen").activeTab = 'buy'; ui.peula($("storeScreen"), { render: true }); }
                },
                { 
                    className: "store-tab", textContent: "SELL", dataset: { tab: 'sell' },
                    onclick(e, $, ui) { $("storeScreen").activeTab = 'sell'; ui.peula($("storeScreen"), { render: true }); }
                },
                {
                    className: "store-tab", textContent: "EXCHANGE", dataset: { tab: 'exchange' },
                    onclick(e, $, ui) {
                        // Trigger exchange immediately
                         ui.peula("ikar", {
                            olamPeula: {
                                htmlPeula: {
                                    shopAction: {
                                        action: 'exchange',
                                        entityId: $("storeScreen").npcId
                                    }
                                }
                            }
                        });
                    }
                }
            ]
        },
        // Content
        {
            className: "store-content",
            children: [
                { className: "store-grid" },
                { className: "store-details" }
            ]
        }
    ]
};

// B"H: Effects Overlay
const effectsOverlay = {
    shaym: "effectsOverlay",
    className: "effects-overlay",
    style: { pointerEvents: "none", position: "absolute", top:0, left:0, width:"100%", height:"100%", zIndex: 2000 },
    on: {
        awtsmoosRevealed(e, $, ui) {
            const data = e.detail;
            
            if (data.text) {
                const el = document.createElement("div");
                el.className = "floating-text";
                el.textContent = data.text;
                el.style.color = data.color || "white";
                el.style.left = (window.innerWidth/2) + "px";
                el.style.top = (window.innerHeight/2) + "px";
                e.target.appendChild(el);
                setTimeout(() => el.remove(), 2000);
            }
            
            if (data.effect === 'transaction') {
                // Intense Hebrew Letter Explosion
                for(let i=0; i<20; i++) {
                    const letter = document.createElement("div");
                    letter.className = "hebrew-particle";
                    letter.textContent = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י"][Math.floor(Math.random()*10)];
                    letter.style.left = (window.innerWidth/2) + "px";
                    letter.style.top = (window.innerHeight/2) + "px";
                    letter.style.setProperty('--tx', (Math.random()*400 - 200) + "px");
                    letter.style.setProperty('--ty', (Math.random()*400 - 200) + "px");
                    letter.style.color = `hsl(${Math.random()*360}, 100%, 50%)`;
                    e.target.appendChild(letter);
                    setTimeout(() => letter.remove(), 1500);
                }
            }
        }
    }
};

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
    }, loginBtn 
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
            tooltip.style.left = (e.pageX - tooltip.clientWidth) + "px";
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

            // Clear old dynamic slots, keeping the static "bag" icon
            while (slotsContainer.children.length > 1) {
                slotsContainer.removeChild(slotsContainer.lastChild);
            }

            actionSlotsData.forEach((slotData, index) => {
                const showTooltip = (event) => {
                    if (!slotData) return;
                    const tooltip = $("icon tooltip");
                    if (tooltip) {
                        tooltip.innerHTML = `<div class="header">${slotData.name}</div><div class="description">${slotData.description}</div>`;
                        tooltip.classList.remove("hidden");
                        const x = event.pageX || (event.touches && event.touches[0].pageX);
                        const y = event.pageY || (event.touches && event.touches[0].pageY);
                        if (x && y) {
                            tooltip.style.left = (x + 15) + 'px';
                            tooltip.style.top = (y + 15) + 'px';
                        }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

                const slot = ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    ready(el) { el.awtsmoosItemData = slotData; }, // B"H: Cache item data on the DOM element
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        on: { 
                            mouseenter: showTooltip,
                            mousemove: showTooltip,
                            mouseleave: hideTooltip,
                            touchstart: showTooltip
                        },
                        onclick: (event) => { 
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: {
                                        item: slotData,
                                        index: index, // The index within the actionSlots array
                                        x: rect.right,
                                        y: rect.top,
                                        sourceType: 'action' 
                                    }
                                });
                            }
                        },
                        children: slotData ? [
                            { className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` }},
                            { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });

                // Drop target logic (remains the same)
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
                    draggable: !!slotData,
                    ready(el) { el.awtsmoosItemData = slotData; }, // B"H: Cache item data on the DOM element
                    on: {
                        dragstart: (event) => {
                            event.dataTransfer.setData("text/plain", index);
                        }
                    },
                    children: [{
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
                                        sourceType: 'inventory' 
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

        // B"H: Update Wallet Display (Separated from updateSlots)
        updateWallet(e, $, ui) {
            const walletVal = e.detail || 0; 
            const walletEl = $("wallet-amount-text");
            if(walletEl) walletEl.textContent = walletVal + " Perutahs";
        },

        // 2. Update Equipment Sidebar
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
            
            const btnStyle = {
                background: "none", border: "none", color: "white", textAlign: "left",
                cursor: "pointer", padding: "8px", borderBottom: "1px solid #444", fontSize: "14px"
            };

            let newX = x;
            let newY = y;
            const menuWidth = 150; 
            const menuHeight = 120; 

            if (x + menuWidth > window.innerWidth) {
                newX = x - menuWidth - 40; 
            }
            if (y + menuHeight > window.innerHeight) {
                newY = y - menuHeight; 
            }

            ui.html({
                shaym: "contextMenu",
                parent: "ikar",
                className: "awtsmoosContextMenu",
                style: {
                    position: "absolute",
                    left: newX + "px", 
                    top: newY + "px",  
                },
                children: [
                    item.className === 'CharacterMaker' ? {
                         tag: "button", textContent: "Design New Soul",
                         onclick: () => {
                             ui.peula($("character designer"), { open: { mode: 'create' } });
                             $("inventoryScreen").classList.add("hidden"); 
                             $("contextMenu")?.remove();
                         }
                    } : null,

                    item.className === 'CustomNpc' ? {
                         tag: "button", textContent: "Edit Soul",
                         onclick: () => {
                             ui.peula($("character designer"), { 
                                 open: { 
                                     mode: 'edit',
                                     item: item,
                                     index: index,
                                     sourceType: sourceType
                                 } 
                             });
                             $("inventoryScreen").classList.add("hidden");
                             $("contextMenu")?.remove();
                         }
                    } : null,

                    item.isEquipped ? {
                        tag: "button", textContent: "Unequip",
                        onclick: () => {
                            ui.peula("ikar", { olamPeula: { unequipItem: item.equippedIn } });
                            $("contextMenu")?.remove();
                        }
                    } : {
                        tag: "button", textContent: "Equip",
                        onclick: () => {
                            const target = item.equipSlot || 'rightHand';
                            ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } });
                            $("contextMenu")?.remove();
                        }
                    },
                    
                    sourceType === 'inventory' ? {
                        tag: "button", textContent: "Move to Action Bar",
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
                    } : { 
                        tag: "button", textContent: "Move to Inventory",
                        onclick: () => {
                             ui.peula("ikar", { olamPeula: { moveFromActionBar: { actionIndex: index } } });
                             $("contextMenu")?.remove();
                        }
                    },

                    {
                        tag: "button", textContent: "Close",
                        onclick: () => $("contextMenu")?.remove()
                    }
                ].filter(Boolean).map(btn => ({...btn, className: 'ctx-btn', style: {...btnStyle, borderBottom: "1px solid #444"}}))
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
            {
                className: "equip-slots-holder",
                children: [
                    {
                        className: "equipment-slots"
                    }
                ]
            }, 
            {
                className: "main-slots-holder",
                children: [
                    {
                        className: "slots"
                    },
                    // B"H: Wallet Section
                    {
                        className: "wallet-display",
                        children: [
                            { className: "wallet-title", textContent: "Wallet" },
                            { 
                                className: "wallet-amount",
                                children: [
                                    { className: "wallet-coin-icon" },
                                    { shaym: "wallet-amount-text", textContent: "0 Perutahs" }
                                ]
                            },
                            {
                                className: "conversion-table",
                                innerHTML: `
                                    1 Isar = 8 Perutahs<br>
                                    1 Pundyon = 16 Perutahs<br>
                                    1 Me'ah = 32 Perutahs<br>
                                    1 Dinar = 192 Perutahs (Silver)<br>
                                    1 Sela = 768 Perutahs<br>
                                    1 Darkon = 1536 Perutahs (Gold)
                                `
                            }
                        ]
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
    children: ["Grab", "Delete"].map( (q, i, a) => ({
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
},
characterDesigner,
storeScreen,
effectsOverlay
].concat(shlichusUI);

if (navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
    console.log("Doing mobile")
}

export default ui;