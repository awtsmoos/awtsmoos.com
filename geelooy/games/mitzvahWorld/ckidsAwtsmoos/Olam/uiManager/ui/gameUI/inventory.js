





































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
            // B"H: Handle bundled data from updateUI
            const data = e.detail || e;
            const slotsData = data.slots || (Array.isArray(data) ? data : []); 
            const containerMode = !!data.containerMode;
            const containerName = data.containerName;

            const inventoryElement = $("inventoryScreen");
            if (!inventoryElement) return;
            
            const titleEl = inventoryElement.querySelector(".header .text");
            const header = inventoryElement.querySelector(".header");
            const body = inventoryElement.querySelector(".main-slots-holder");
            const backBtn = inventoryElement.querySelector(".back-inv-btn");

            if(titleEl) {
                if(containerMode) {
                    titleEl.textContent = containerName || "Container";
                    if(header) header.style.backgroundColor = "rgba(50, 20, 0, 0.8)"; 
                    if(body) body.style.backgroundColor = "rgba(30, 15, 5, 0.6)";
                } else {
                    titleEl.textContent = "Inventory";
                    if(header) header.style.backgroundColor = ""; 
                    if(body) body.style.backgroundColor = "";
                }
            }
            
            // B"H: Force Display Logic for Back Button
            if(backBtn) {
                if(containerMode) {
                     backBtn.classList.remove("hidden");
                     backBtn.style.display = "block";
                } else {
                     backBtn.classList.add("hidden");
                     backBtn.style.display = "none";
                }
            }

            // --- SLOT RENDERING ---
            const slotsContainer = inventoryElement.querySelector(".slots");
            if (!slotsContainer) return;
            slotsContainer.innerHTML = '';

            if(Array.isArray(slotsData)) {
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

                    let iconStyle = {};
                    let className = 'slotBtn';
                    let textIcon = null;

                    if (slotData) {
                        const isUrl = slotData.icon && (slotData.icon.includes('/') || slotData.icon.includes('data:'));
                        
                        if (isUrl) {
                            if (slotData.isTintable && slotData.customData && slotData.customData.color) {
                                const color = slotData.customData.color;
                                iconStyle = {
                                    backgroundColor: color,
                                    maskImage: `url(${slotData.icon})`,
                                    WebkitMaskImage: `url(${slotData.icon})`,
                                    maskSize: "contain",
                                    WebkitMaskSize: "contain",
                                    maskRepeat: "no-repeat",
                                    WebkitMaskRepeat: "no-repeat",
                                    maskPosition: "center",
                                    WebkitMaskPosition: "center",
                                    width: "100%", height: "100%"
                                };
                                className = 'slotBtn tinted-icon';
                            } else {
                                iconStyle = { 
                                    backgroundImage: `url(${slotData.icon})` 
                                };
                            }
                        } else if (slotData.icon) {
                            textIcon = slotData.icon;
                            iconStyle = {
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '40px',
                                width: '100%',
                                height: '100%'
                            };
                        }
                    }

                    const handleClick = (event) => {
                         if (!slotData) return;
                         
                         const currentSourceType = containerMode ? 'container' : 'inventory';
                         const isContainer = slotData.isContainer || slotData.className === 'Container' || (slotData.customData && slotData.customData.slots);

                         if (isContainer) {
                             if (!containerMode) {
                                 ui.peula("ikar", { 
                                    olamPeula: { 
                                        openContainer: { 
                                            item: slotData, 
                                            index: index, 
                                            sourceType: currentSourceType 
                                        } 
                                    } 
                                });
                                return;
                             }
                         }
                         
                         const rect = event.target ? event.target.getBoundingClientRect() : { right: event.clientX, top: event.clientY };
                         ui.peula($("inventoryScreen"), {
                            showContextMenu: { 
                                item: slotData, 
                                index: index, 
                                x: rect.right || event.clientX, 
                                y: rect.top || event.clientY, 
                                sourceType: currentSourceType 
                            }
                        });
                    };

                    ui.html({
                        parent: slotsContainer,
                        className: "actionSlot " + (slotData ? 'occupied' : 'empty'),
                        ready(el) {
                             if(typeof window !== 'undefined' && typeof window.attachSlotDragListeners === 'function') {
                                const sourceType = containerMode ? 'container' : 'inventory';
                                window.attachSlotDragListeners(el, { item: slotData }, sourceType, index, ui, handleClick);
                             }
                        },
                        children: [{
                            className: "innerSlot" + (slotData && slotData.isEquipped ? " equipped-indicator" : ""),
                            on: { mouseenter: showTooltip, mouseleave: hideTooltip },
                            children: slotData ? [
                                { tag: 'div', className: className, style: iconStyle, textContent: textIcon }, 
                                { tag: 'div', className: 'slotQuantity', textContent: slotData.quantity > 1 ? slotData.quantity : '' }
                            ] : []
                        }]
                    });
                });
            }
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
                let iconStyle = {};
                let className = 'slotBtn';
                let children = [];
                let textIcon = null;

                if (item) {
                     const isUrl = item.icon && (item.icon.includes('/') || item.icon.includes('data:'));
                     if (isUrl) {
                         if (item.isTintable && item.customData && item.customData.color) {
                            const color = item.customData.color;
                            iconStyle = {
                                backgroundColor: color,
                                maskImage: `url(${item.icon})`,
                                WebkitMaskImage: `url(${item.icon})`,
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                                width: "100%", height: "100%"
                            };
                        } else {
                            iconStyle = { 
                                backgroundImage: `url(${item.icon})`,
                                width: "100%", height: "100%", 
                                backgroundSize: "contain", 
                                backgroundRepeat: "no-repeat", 
                                backgroundPosition: "center" 
                            };
                        }
                    } else if (item.icon) {
                        textIcon = item.icon;
                        iconStyle = {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontSize: '40px',
                            width: '100%',
                            height: '100%'
                        };
                    }
                    children.push({ className: className, style: iconStyle, textContent: textIcon });
                }

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
                    children: children
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

            const isContainer = item.isContainer || item.className === 'Container' || (item.customData && item.customData.slots);

            ui.html({
                shaym: "contextMenu", parent: "ikar", className: "awtsmoosContextMenu",
                style: { position: "absolute", left: newX + "px", top: newY + "px" },
                children: [
                    isContainer && sourceType !== 'container' ? { 
                        tag: "button", 
                        textContent: "Open", 
                        onclick: () => { 
                            ui.peula("ikar", { olamPeula: { openContainer: { item, index, sourceType } } }); 
                            $("contextMenu")?.remove(); 
                        } 
                    } : null,
                    { 
                        tag: "button", textContent: "Drag Item", 
                        onclick: (ev) => { 
                            if(typeof window.startManualDrag === 'function') {
                                setTimeout(() => window.startManualDrag(item, sourceType, index, null), 50);
                            }
                            $("contextMenu")?.remove(); 
                        } 
                    },
                    { 
                        tag: "button", textContent: "Split Stack", 
                        onclick: () => { 
                            $("quantityModal").classList.remove("hidden");
                            const inp = $("qtyInput");
                            if(inp) {
                                inp.value = "1";
                                inp.max = item.quantity;
                            }
                            window.AwtsmoosDragSystem.pendingSplitCallback = (qty) => {
                                setTimeout(() => window.startManualDrag(item, sourceType, index, qty), 50);
                            };
                            $("contextMenu")?.remove(); 
                        } 
                    },
                    item.className === 'CharacterMaker' ? { tag: "button", textContent: "Design New Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'create' } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.className === 'CustomNpc' ? { tag: "button", textContent: "Edit Soul", onclick: () => { ui.peula($("character designer"), { open: { mode: 'edit', item: item, index: index, sourceType: sourceType } }); $("inventoryScreen").classList.add("hidden"); $("contextMenu")?.remove(); } } : null,
                    item.isEquipped ? { tag: "button", textContent: "Unequip", onclick: () => { ui.peula("ikar", { olamPeula: { unequipItem: item.equippedIn } }); $("contextMenu")?.remove(); } } : { tag: "button", textContent: "Equip", onclick: () => { const target = item.equipSlot || 'rightHand'; ui.peula("ikar", { olamPeula: { equipItem: { sourceType, index, target } } }); $("contextMenu")?.remove(); } },
                    sourceType === 'inventory' ? { tag: "button", textContent: "Move to Action Bar", onclick: () => { ui.peula("ikar", { olamPeula: { moveToActionBar: { fromInventoryIndex: index, toActionIndex: 0 /* Default handled by server */ } } }); $("contextMenu")?.remove(); } } : (sourceType === 'action' ? { tag: "button", textContent: "Move to Inventory", onclick: () => { ui.peula("ikar", { olamPeula: { moveFromActionBar: { actionIndex: index } } }); $("contextMenu")?.remove(); } } : null),
                    { tag: "button", textContent: "Close", onclick: () => $("contextMenu")?.remove() }
                ].filter(Boolean).map(btn => ({...btn, className: 'ctx-btn', style: {...btnStyle, borderBottom: "1px solid #444"}}))
            });
        }
    },
    children: [{
        className: "header",
        children: [
            // B"H: Correctly placed BACK button
            { 
                tag: "button", 
                className: "awtsmoosBtn small back-inv-btn hidden", 
                style: { marginRight: "10px", padding: "5px 10px", fontSize: "14px", fontWeight: "bold", display: "none" },
                textContent: "⬅ Back",
                onclick: (e, $, ui) => {
                     ui.peula("ikar", { olamPeula: { closeContainer: true } });
                }
            },
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