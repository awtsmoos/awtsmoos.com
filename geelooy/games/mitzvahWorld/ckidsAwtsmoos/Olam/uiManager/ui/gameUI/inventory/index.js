
// B"H
import updateSlots from "./slots.js";
import updateEquipment from "./equipment.js";

export default {
    shaym: "inventoryScreen",
    awtsmoosClick: true,
    className: "awtsmoosInventoryViewer hidden",
    ready(el, $, ui) {
        setTimeout( () => { ui.peula("ikar", { olamPeula: { requestInventoryUpdate: true } }); }, 0);
    },
    on: {
        updateSlots: updateSlots,
        updateEquipment: updateEquipment,
        updateWallet(e, $, ui) {
            const walletVal = e.detail || 0; 
            const walletEl = $("wallet-amount-text");
            if(walletEl) walletEl.textContent = walletVal + " Perutahs";
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
