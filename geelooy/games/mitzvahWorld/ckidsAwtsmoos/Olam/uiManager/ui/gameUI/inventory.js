
// B"H
export default {
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
                    ready(el) {
                         // B"H FIX: Strict check for window and function existence to prevent ReferenceError
                         if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                            window.attachSlotDragListeners(el, { item: slotData }, 'inventory', index, ui);
                         }
                    },
                    children: [{
                        className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                        on: { mouseenter: showTooltip, mouseleave: hideTooltip },
                        onclick: (event) => {
                            // Explicit click handler for context menu
                            if (slotData) {
                                const rect = event.currentTarget.getBoundingClientRect();
                                ui.peula($("inventoryScreen"), {
                                    showContextMenu: { item: slotData, index: index, x: rect.right, y: rect.top, sourceType: 'inventory' }
                                });
                            }
                        },
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
                    { 
                        tag: "button", textContent: "Drag Item", 
                        onclick: (ev) => { 
                            // B"H: Start Visual Manual Drag
                            if(typeof window.startManualDrag === 'function') {
                                // Need to prevent event bubbling? Not really, just start it.
                                // Delay slightly to ensure click is processed
                                setTimeout(() => window.startManualDrag(item, sourceType, index, null), 50);
                            }
                            $("contextMenu")?.remove(); 
                        } 
                    },
                    { 
                        tag: "button", textContent: "Split Stack", 
                        onclick: () => { 
                            // B"H: Open Quantity Modal
                            $("quantityModal").classList.remove("hidden");
                            const inp = $("qtyInput");
                            if(inp) {
                                inp.value = "1";
                                inp.max = item.quantity;
                            }
                            
                            // Define callback for modal confirmation
                            window.AwtsmoosDragSystem.pendingSplitCallback = (qty) => {
                                setTimeout(() => window.startManualDrag(item, sourceType, index, qty), 50);
                            };
                            
                            $("contextMenu")?.remove(); 
                        } 
                    },
                    item.className === 'CharacterMaker' ? { tag: "button", textContent: "Design New Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'create' } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.className === 'CustomNpc' ? { tag: "button", textContent: "Edit Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'edit', item: item, index: index, sourceType: sourceType } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.isEquipped ? { tag: "button", textContent: "Unequip", onclick: () => { ui.peula("ikar", { olamPeula: { unequipItem: item.equippedIn } }); $("contextMenu")?.remove(); } } : { tag: "button", textContent: "Equip", onclick: () => { const target = item.equipSlot || 'rightHand'; ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } }); $("contextMenu")?.remove(); } },
                    sourceType === 'inventory' ? { tag: "button", textContent: "Move to Action Bar", onclick: () => { ui.peula("ikar", { olamPeula: { moveToActionBar: { fromInventoryIndex: index, toActionIndex: 0 /* Default handled by server */ } } }); $("contextMenu")?.remove(); } } : { tag: "button", textContent: "Move to Inventory", onclick: () => { ui.peula("ikar", { olamPeula: { moveFromActionBar: { actionIndex: index } } }); $("contextMenu")?.remove(); } },
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
                tag: "button", className: "awtsmoosBtn small", style: { marginLeft: "auto", marginRight: "10px", padding: "5px 10px", fontSize: "14px" }, textContent: "SORT",
                onclick: (e, $, ui) => { 
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
};
