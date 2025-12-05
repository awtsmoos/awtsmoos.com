
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
import storeScreen from "./screens/storeScreen.js";
import effectsOverlay from "./components/effectsOverlay.js";
import questLog from "./screens/questLog.js";

// B"H: Audio Helper for UI sounds
function playUiSound(type) {
    const audio = new Audio();
    if (type === 'click') audio.src = "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fui%2Fclick.mp3?alt=media"; 
    else if (type === 'hover') audio.src = "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fui%2Fhover.mp3?alt=media";
    else if (type === 'success') audio.src = "https://firebasestorage.googleapis.com/v0/b/ckids-games-assets.appspot.com/o/sound%2Feffects%2Fding.ogg?alt=media";
    audio.volume = 0.3;
    audio.play().catch(e=>{});
}

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
            if (!rd) return;
            rd.onclick = me.onclick;
        },
        onclick(e, $) {
            playUiSound('click');
            var m = $("menu");
            if (!m) return;
            m.classList.toggle("offscreen");
            m.classList.toggle("onscreen");
        }
    }, {
        shaym: "title text holder",
        className: "titleTxt",
        children: [{ tag: "span", textContent: "Mitzvah", className: "mtz" }, { tag: "span", textContent: "World" }, { shaym: "Debug", className: "hidden", textContent: "Debugging" }]
    }, loginBtn 
    ],
    style: { top: "0px" },
},
{ shaym: "msg npc", style: { bottom: "20px", right: "15px" }, awtsmoosClick: true, className: "dialogue npc" },
{ shaym: "msg chossid", style: { bottom: "20px", left: "15px" }, awtsmoosClick: true, className: "dialogue chossid" },
{ shaym: "approach npc msg", className: "asApproachNpc hidden", awtsmoosOnChange: { textContent(e, me) { me.innerText = "Press B to talk to " + e.data.textContent; } } },
{ shaym: "approach portal msg", className: "asApproachNpc hidden", awtsmoosOnChange: { textContent(e, me) { me.innerText = "Press B to travel to " + e.data.textContent; } } },
{
    shaym: "Saving",
    className: "hidden menuItm",
    innerHTML: "Saving...",
    on: {
        awtsmoosRevealed(e, $, ui) {
            var ikar = $("ikar");
            if (!ikar) return;
            ikar.dispatchEvent(new CustomEvent("olamPeula",{ detail: { downloadWorld: true } }));
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
            playUiSound('click');
            var slots = $("action bar");
            if (!slots) return;
            slots.classList.toggle("minimized");
            el.classList.toggle("opened");
            el.classList.toggle("closed");
        }
    }, { className: "slots", shaym: "action slots" }],
    ready(el, $f, ui) {
        const slotConfig = el.startSlotsConfig;
        if (!slotConfig || !slotConfig.slots || !slotConfig.slots[0]) return;
        const bagSlotInfo = slotConfig.slots[0];
        const slotsContainer = $f("action slots");
        const tooltip = $f("icon tooltip");

        function showTooltip() {
            if (!tooltip) return;
            playUiSound('hover');
            tooltip.innerHTML = `<div class="header">${bagSlotInfo.name}</div><div class="description">${bagSlotInfo.description}</div>`;
            tooltip.classList.remove("hidden");
        }
        function moveTooltip(e) {
            if (!tooltip) return;
            tooltip.style.left = (e.pageX - tooltip.clientWidth) + "px";
            tooltip.style.top = e.pageY + "px";
        }
        function hideTooltip() { if (tooltip) tooltip.classList.add("hidden"); }

        ui.html({
            parent: slotsContainer,
            className: "actionSlot occupied",
            children: [{
                className: "innerSlot",
                on: { mouseenter: showTooltip, mousemove: moveTooltip, mouseleave: hideTooltip },
                onclick(e) {
                    playUiSound('click');
                    const inventoryScreen = $f(bagSlotInfo.show);
                    if (inventoryScreen) inventoryScreen.classList.remove("hidden");
                },
                children: [{ className: "slotBtn", style: { backgroundImage: `url(${bagSlotInfo.icon})` } }]
            }]
        });
    },
    on: {
        updateActionSlots(e, $, ui) {
            const actionSlotsData = e.detail;
            const slotsContainer = $("action slots");
            if (!slotsContainer) return;

            while (slotsContainer.children.length > 1) slotsContainer.removeChild(slotsContainer.lastChild);

            actionSlotsData.forEach((slotData, index) => {
                const showTooltip = (event) => {
                    if (!slotData) return;
                    playUiSound('hover');
                    const tooltip = $("icon tooltip");
                    if (tooltip) {
                        tooltip.innerHTML = `<div class="header">${slotData.name}</div><div class="description">${slotData.description}</div>`;
                        tooltip.classList.remove("hidden");
                        const x = event.pageX || (event.touches && event.touches[0].pageX);
                        const y = event.pageY || (event.touches && event.touches[0].pageY);
                        if (x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

                const slot = ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    ready(el) { el.awtsmoosItemData = slotData; },
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        on: { mouseenter: showTooltip, mousemove: showTooltip, mouseleave: hideTooltip, touchstart: showTooltip },
                        onclick: (event) => { 
                            playUiSound('click');
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: { item: slotData, index: index, x: rect.right, y: rect.top, sourceType: 'action' }
                                });
                            }
                        },
                        children: slotData ? [
                            { className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` }},
                            { className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                        ] : []
                    }]
                });

                slot.ondragover = (event) => event.preventDefault();
                slot.ondrop = (event) => {
                    event.preventDefault();
                    const fromInventoryIndex = event.dataTransfer.getData("text/plain");
                    if (fromInventoryIndex) {
                        ui.peula("ikar", { olamPeula: { moveToActionBar: { fromInventoryIndex: parseInt(fromInventoryIndex), toActionIndex: index } } });
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
        setTimeout( () => { ui.peula("ikar", { olamPeula: { requestInventoryUpdate: true } }); }, 0);
    },
    on: {
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
                    playUiSound('hover');
                    const tooltip = $("icon tooltip");
                    if (tooltip) {
                        tooltip.innerHTML = `<div class="header">${slotData.name || 'Item'}</div><div class="description">${slotData.description || ''}</div>`;
                        tooltip.classList.remove('hidden');
                        const x = event.pageX || (event.touches && event.touches[0].pageX);
                        const y = event.pageY || (event.touches && event.touches[0].pageY);
                        if(x && y) { tooltip.style.left = (x + 15) + 'px'; tooltip.style.top = (y + 15) + 'px'; }
                    }
                };
                const hideTooltip = () => $("icon tooltip")?.classList.add('hidden');

                ui.html({
                    parent: slotsContainer,
                    className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                    draggable: !!slotData,
                    ready(el) { el.awtsmoosItemData = slotData; },
                    on: { dragstart: (event) => { event.dataTransfer.setData("text/plain", index); } },
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        onclick: (event) => {
                            playUiSound('click');
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: { item: slotData, index: index, x: rect.right, y: rect.top, sourceType: 'inventory' }
                                });
                            }
                        },
                        on: { mouseenter: showTooltip, mousemove: showTooltip, mouseleave: hideTooltip, touchstart: showTooltip },
                        children: slotData ? [{ tag: 'div', className: 'slotBtn', style: { backgroundImage: `url(${slotData.icon})` } }, { tag: 'div', className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }] : []
                    }]
                });
            });
        },
        updateWallet(e, $, ui) {
            const walletVal = e.detail || 0; 
            const walletEl = $("wallet-amount-text");
            if(walletEl) walletEl.textContent = walletVal + " Perutahs";
        },
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
                    style: { width: "50px", height: "50px", border: "1px solid #888", background: "rgba(0,0,0,0.3)", position: "relative", margin: "2px", borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" },
                    innerHTML: item ? "" : `<span style='font-size:10px; color:#aaa; text-transform:uppercase'>${slotName.replace("Hand", "")}</span>`,
                    onclick: (ev) => {
                        if (item) {
                            playUiSound('click');
                            ui.peula("ikar", { olamPeula: { unequipItem: slotName } });
                        }
                    },
                    children: item ? [{ className: "slotBtn", style: { backgroundImage: `url(${item.icon})`, width: "100%", height: "100%", backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" } }] : []
                });
            });
        },
        showContextMenu(e, $, ui) {
            const {item, index, x, y, sourceType} = e.detail;
            $("contextMenu")?.remove();
            const btnStyle = { background: "none", border: "none", color: "white", textAlign: "left", cursor: "pointer", padding: "8px", borderBottom: "1px solid #444", fontSize: "14px" };
            let newX = x, newY = y;
            if (x + 150 > window.innerWidth) newX = x - 190;
            if (y + 120 > window.innerHeight) newY = y - 120;

            ui.html({
                shaym: "contextMenu", parent: "ikar", className: "awtsmoosContextMenu",
                style: { position: "absolute", left: newX + "px", top: newY + "px" },
                children: [
                    item.className === 'CharacterMaker' ? { tag: "button", textContent: "Design New Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'create' } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.className === 'CustomNpc' ? { tag: "button", textContent: "Edit Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'edit', item: item, index: index, sourceType: sourceType } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.isEquipped ? { tag: "button", textContent: "Unequip", onclick: () => { ui.peula("ikar", { olamPeula: { unequipItem: item.equippedIn } }); $("contextMenu")?.remove(); } } : { tag: "button", textContent: "Equip", onclick: () => { const target = item.equipSlot || 'rightHand'; ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } }); $("contextMenu")?.remove(); } },
                    sourceType === 'inventory' ? { tag: "button", textContent: "Move to Action Bar", onclick: () => { const actionSlots = $("action slots").children; let targetIndex = -1; for(let i = 1; i < actionSlots.length; i++) { if(actionSlots[i].classList.contains('empty')) { targetIndex = i - 1; break; } } if(targetIndex === -1) targetIndex = 0; ui.peula("ikar", { olamPeula: { moveToActionBar: { fromInventoryIndex: index, toActionIndex: targetIndex } } }); $("contextMenu")?.remove(); } } : { tag: "button", textContent: "Move to Inventory", onclick: () => { ui.peula("ikar", { olamPeula: { moveFromActionBar: { actionIndex: index } } }); $("contextMenu")?.remove(); } },
                    { tag: "button", textContent: "Close", onclick: () => $("contextMenu")?.remove() }
                ].filter(Boolean).map(btn => ({...btn, className: 'ctx-btn', style: {...btnStyle, borderBottom: "1px solid #444"}}))
            });
        }
    },
    children: [{
        className: "header",
        children: [
            { className: "text", textContent: "Inventory" }, 
            { 
                // SORT BUTTON
                tag: "button", className: "awtsmoosBtn small", style: { marginLeft: "auto", marginRight: "10px", padding: "5px 10px", fontSize: "14px" }, textContent: "SORT",
                onclick: (e, $, ui) => { 
                    playUiSound('click');
                    // Trigger sort in worker/logic
                    ui.peula("ikar", { olamPeula: { sortInventory: true } });
                } 
            },
            { className: "close", innerHTML: "X", onclick(e, $f) { $f("inventoryScreen")?.classList.add("hidden"); $f("contextMenu")?.remove(); } }
        ]
    }, {
        className: "inventory-body",
        children: [
            { className: "equip-slots-holder", children: [{ className: "equipment-slots" }] }, 
            {
                className: "main-slots-holder",
                children: [
                    { className: "slots" },
                    {
                        className: "wallet-display",
                        children: [
                            { className: "wallet-title", textContent: "Wallet" },
                            { className: "wallet-amount", children: [{ className: "wallet-coin-icon" }, { shaym: "wallet-amount-text", textContent: "0 Perutahs" }] },
                            { className: "conversion-table", innerHTML: `1 Isar = 8 Perutahs<br>1 Pundyon = 16 Perutahs<br>1 Me'ah = 32 Perutahs<br>1 Dinar = 192 Perutahs (Silver)<br>1 Sela = 768 Perutahs<br>1 Darkon = 1536 Perutahs (Gold)` }
                        ]
                    }
                ]
            }
        ]
    }]
}, { shaym: "icon tooltip", className: "awtsmoos tooltip hidden" }, {
    shaym: "block selector menu", className: "blockSelected hidden", awtsmoosClick: true,
    on: { awtsmoosOptions(e) { window?.socket?.postMessage?.({ uiEvented: { awtsmoosResponse: { array: Array.from(e.target.children).map(q => q.innerText) }, id: e.detail?._awtsmoosId } }) } },
    children: ["Grab", "Delete"].map( (q, i, a) => ({ shaym: "menu item " + q, innerHTML: q, className: q, on: { awtsmoosHighlight(e) { var par = e.target.parentNode; Array.from(par.children).forEach(w => w.classList.remove("active")); e.target.classList.add("active") } }, onclick: async (e) => { ikar.dispatchEvent(new CustomEvent("olamPeula",{ detail: { activeObjectAction: e.target.innerHTML } })); } }))
}, characterDesigner, storeScreen, effectsOverlay, questLog].concat(shlichusUI);

// Quest Log update listener for sound
questLog.on.questUpdated = (e) => {
    playUiSound('success');
};

if (navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
}

export default ui;
