
// B"H
import style from "./skins/2/characterDesignerStyle.js";

export default {
    shaym: "character designer",
    className: "characterDesigner hidden",
    awtsmoosClick: true, 
    
    characterState: {
        name: "My NPC",
        color: "#00ffff",
        dialogueTree: [{ id: 0, message: "B\"H\nShalom!", responses: [] }],
        shopInventory: [],
        contractPercentage: 100,
        ownerId: null,
        clothes: {
             jacket: true,
             yarmulke: true
        }
    },
    
    createMessageNode: function(id) {
        return { id: id, message: "New Message", responses: [{ text: "Goodbye", type: "close" }] };
    },
    createResponse: function() {
        return { text: "Response", type: "message", target: 0 };
    },
    
    on: {
        open(e, $, ui) {
            const designer = e.target;
            const { mode, item, index, sourceType, liveEntityId } = e.detail;
            
            // B"H: silent


            designer.classList.remove("hidden");
            designer.style.display = "flex"; 
            
            designer.awtsmoosEditContext = { index, sourceType, liveEntityId, item };

            // Load State
            if (mode === 'edit' && item && item.customData) {
                designer.characterState = JSON.parse(JSON.stringify(item.customData));
                
                if (!designer.characterState.dialogueTree || !Array.isArray(designer.characterState.dialogueTree)) {
                    designer.characterState.dialogueTree = [{ id: 0, message: "B\"H\nShalom!", responses: [] }];
                }

                $("cd-title").textContent = "Editing: " + (item.name || "Soul");
            } else {
                designer.characterState = {
                    name: "New Soul",
                    color: "#00ffff",
                    dialogueTree: [{ 
                        id: 0, 
                        message: "B\"H\nShalom! I was just created.", 
                        responses: [
                            { text: "Nice to meet you!", type: "close" }
                        ] 
                    }],
                    shopInventory: [],
                    contractPercentage: 100,
                    ownerId: "player",
                    clothes: { jacket: true, yarmulke: true }
                };
                $("cd-title").textContent = "Design New Soul";
            }

            const nameInput = designer.querySelector(".cd-sidebar input.cd-name-input"); 
            if(nameInput) nameInput.value = designer.characterState.name || "";
            
            const colorInput = designer.querySelector(".cd-sidebar input.cd-color-input");
            if(colorInput) colorInput.value = designer.characterState.color || "#00ffff";

            ui.peula($("cd-content-area"), { renderView: "dialogue" });
        }
    },

    children: [
        { tag: "style", innerHTML: style },
        
        {
            className: "cd-header",
            awtsmoosClick: true,
            children: [
                { shaym: "cd-title", className: "cd-title", textContent: "Neshama Designer" },
                {
                    tag: "button",
                    className: "cd-close",
                    textContent: "X",
                    onclick(e, $) { $("character designer").classList.add("hidden"); }
                }
            ]
        },

        {
            className: "cd-body",
            awtsmoosClick: true,
            children: [
                {
                    className: "cd-sidebar",
                    children: [
                        {
                            className: "cd-input-group",
                            children: [
                                { className: "cd-label", textContent: "Name" },
                                {
                                    tag: "input", type: "text", className: "cd-input cd-name-input",
                                    oninput(e, $) { $("character designer").characterState.name = e.target.value; }
                                }
                            ]
                        },
                        {
                            className: "cd-input-group",
                            children: [
                                { className: "cd-label", textContent: "Aura Color" },
                                {
                                    tag: "input", type: "color", className: "cd-input cd-color-input",
                                    oninput(e, $) { $("character designer").characterState.color = e.target.value; }
                                }
                            ]
                        },
                        {
                            tag: "button", className: "cd-btn", textContent: "Dialogue Editor",
                            onclick(e, $, ui) { ui.peula($("cd-content-area"), { renderView: "dialogue" }); }
                        },
                        {
                            tag: "button", className: "cd-btn", textContent: "Store Management",
                            onclick(e, $, ui) { ui.peula($("cd-content-area"), { renderView: "store" }); }
                        },
                        {
                            tag: "button", className: "cd-btn", textContent: "Appearance",
                            onclick(e, $, ui) { ui.peula($("cd-content-area"), { renderView: "clothes" }); }
                        },
                        {
                            tag: "button", className: "cd-create-btn", textContent: "SAVE SOUL",
                            onclick(e, $, ui) {
                                const designer = $("character designer");
                                const state = designer.characterState;
                                const ctx = designer.awtsmoosEditContext || {};
                                
                                if (ctx.sourceType === 'world' && ctx.liveEntityId) {
                                    ui.peula("ikar", { 
                                        olamPeula: { 
                                            updateLiveEntity: { 
                                                id: ctx.liveEntityId, 
                                                data: { 
                                                    name: state.name, 
                                                    customData: state 
                                                } 
                                            } 
                                        } 
                                    });
                                    alert("Changes saved to world entity!");
                                } else if (ctx.sourceType === 'inventory' || ctx.sourceType === 'action') {
                                    const updateData = { name: state.name, customData: state };
                                    ui.peula("ikar", { 
                                        olamPeula: { 
                                            updateInventoryItem: { 
                                                sourceType: ctx.sourceType, 
                                                index: ctx.index, 
                                                itemData: updateData 
                                            } 
                                        } 
                                    });
                                    alert("Changes saved to inventory item!");
                                } else {
                                    const itemData = {
                                        id: "custom_npc_" + Date.now(), className: "CustomNpc",
                                        name: state.name, description: "A custom soul.", customData: state,
                                        icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjIwMCIgZmlsbD0iIzRmNDRmNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIi8+PHBhdGggZD0iTTE1NiAxNTZhMTAwIDEwMCAwIDAgMSAyMDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=" 
                                    };
                                    ui.peula("ikar", { olamPeula: { addItem: itemData } });
                                    alert("New soul created in inventory!");
                                }
                                designer.classList.add("hidden");
                            }
                        }
                    ]
                },

                // --- Main Content Area (Dynamic) ---
                {
                    shaym: "cd-content-area",
                    className: "cd-main",
                    awtsmoosClick: true,
                    on: {
                        renderView(e, $, ui) {
                            const container = e.target;
                            const view = e.detail;
                            container.innerHTML = "";
                            const designer = $("character designer");
                            
                            if (view === "dialogue") {
                                ui.html({
                                    parent: container,
                                    className: "cd-tree-container",
                                    ready(el) { ui.peula(el, { renderTree: true }); }, 
                                    on: {
                                        renderTree: (ev, $$, uii) => {
                                            const state = designer.characterState;
                                            if (!state.dialogueTree) state.dialogueTree = [];

                                            ev.target.innerHTML = "";
                                            uii.html({ parent: ev.target, tag: "button", className: "cd-btn secondary", textContent: "+ Add Node", onclick() { state.dialogueTree.push(designer.createMessageNode(state.dialogueTree.length)); uii.peula(ev.target, {renderTree:true}); } });
                                            
                                            state.dialogueTree.forEach((node, idx) => {
                                                uii.html({
                                                    parent: ev.target, className: "cd-node",
                                                    children: [
                                                        { textContent: `ID: ${idx}`, className: "cd-label" },
                                                        { tag: "textarea", className: "cd-input", value: node.message, oninput(x) { node.message = x.target.value; } },
                                                        {
                                                            className: "cd-response-list",
                                                            ready(lst) {
                                                                const refresh = () => {
                                                                    lst.innerHTML = "";
                                                                    if(node.responses && Array.isArray(node.responses)) {
                                                                        node.responses.forEach((r, ri) => {
                                                                            uii.html({
                                                                                parent: lst, className: "cd-response",
                                                                                children: [
                                                                                    { tag: "input", className: "cd-input", value: r.text, placeholder:"Response text", oninput(x){ r.text=x.target.value } },
                                                                                    { tag: "select", className: "cd-select", value: r.type, onchange(x){ r.type=x.target.value; refresh(); }, children: [{tag:"option", value:"message", textContent:"Goto"}, {tag:"option", value:"close", textContent:"Close"}, {tag:"option", value:"store", textContent:"Open Shop"}] },
                                                                                    r.type==="message" ? { tag:"input", type:"number", placeholder:"Target ID", className:"cd-input", value: r.target||0, oninput(x){ r.target = parseInt(x.target.value); } } : null,
                                                                                    { tag: "button", className: "cd-btn secondary", textContent: "Del", onclick(){ node.responses.splice(ri, 1); refresh(); } }
                                                                                ]
                                                                            })
                                                                        });
                                                                    }
                                                                    uii.html({ parent: lst, tag:"button", textContent:"+ Response", className:"cd-btn secondary", onclick(){ if(!node.responses) node.responses=[]; node.responses.push(designer.createResponse()); refresh(); } })
                                                                };
                                                                refresh();
                                                            }
                                                        }
                                                    ]
                                                })
                                            });
                                        }
                                    }
                                });
                            } else if (view === "store") {
                                ui.html({
                                    parent: container,
                                    className: "cd-store-container",
                                    children: [
                                        { className: "cd-title", textContent: "Store Inventory" },
                                        { className: "cd-label", textContent: "My Cut (%)" },
                                        {
                                            tag: "input", type: "number", className: "cd-input",
                                            value: designer.characterState.contractPercentage,
                                            oninput(ev) { designer.characterState.contractPercentage = parseInt(ev.target.value); }
                                        },
                                        {
                                            className: "cd-input-group",
                                            children: [
                                                { className: "cd-label", textContent: "Add Item from Player Inventory:" },
                                                {
                                                    tag: "select", className: "cd-select",
                                                    shaym: "player-inv-select",
                                                    ready(sel) {
                                                        sel.innerHTML = "<option>Select Item...</option>";
                                                        const slots = document.querySelectorAll(".awtsmoosInventoryViewer .slots .actionSlot");
                                                        slots.forEach(slot => {
                                                            const item = slot.awtsmoosSlotData ? slot.awtsmoosSlotData.item : null;
                                                            if (item) {
                                                                const opt = document.createElement("option");
                                                                opt.textContent = `${item.name} (x${item.quantity})`;
                                                                opt.value = item.name; 
                                                                opt.awtsmoosRef = item; 
                                                                sel.appendChild(opt);
                                                            }
                                                        });
                                                    }
                                                },
                                                {
                                                    tag: "button", className: "cd-btn", textContent: "Add to Shop",
                                                    onclick(ev, $$) {
                                                        const sel = $$("player-inv-select");
                                                        if(sel.selectedIndex > 0) {
                                                            const name = sel.value;
                                                            if(!designer.characterState.shopInventory) designer.characterState.shopInventory = [];
                                                            designer.characterState.shopInventory.push({
                                                                name: name,
                                                                price: 10, 
                                                                quantity: 1
                                                            });
                                                            ui.peula($("cd-content-area"), { renderView: "store" }); 
                                                        }
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            className: "cd-grid",
                                            style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" },
                                            ready(grid) {
                                                if(!designer.characterState.shopInventory) designer.characterState.shopInventory = [];
                                                designer.characterState.shopInventory.forEach((item, idx) => {
                                                    ui.html({
                                                        parent: grid,
                                                        className: "cd-card fw-card", 
                                                        children: [
                                                            { className: "fw-card-title", textContent: item.name },
                                                            { className: "cd-label", textContent: "Price:" },
                                                            {
                                                                tag: "input", type: "number", className: "cd-input", value: item.price,
                                                                style: { width: "80px" },
                                                                oninput(x) { item.price = parseInt(x.target.value); }
                                                            },
                                                            { className: "cd-label", textContent: "Qty:" },
                                                            {
                                                                tag: "input", type: "number", className: "cd-input", value: item.quantity,
                                                                style: { width: "80px" },
                                                                oninput(x) { item.quantity = parseInt(x.target.value); }
                                                            },
                                                            {
                                                                tag: "button", className: "cd-btn secondary", textContent: "Remove",
                                                                onclick() {
                                                                    designer.characterState.shopInventory.splice(idx, 1);
                                                                    ui.peula($("cd-content-area"), { renderView: "store" });
                                                                }
                                                            }
                                                        ]
                                                    });
                                                });
                                            }
                                        }
                                    ]
                                });
                            } else if (view === "clothes") {
                                // B"H: Clothes Selection View
                                if (!designer.characterState.clothes) designer.characterState.clothes = { jacket: true, yarmulke: true };
                                const clothes = designer.characterState.clothes;
                                
                                // Get available clothing items from inventory to select from
                                // For now, we use a simple list of standard garments
                                // In future, iterate inventory for 'Apparel' class items

                                ui.html({
                                    parent: container,
                                    className: "cd-clothes-container",
                                    children: [
                                        { className: "cd-title", textContent: "Wardrobe (Levushim)" },
                                        { tag: "p", textContent: "Toggle garments for this soul:" },
                                        {
                                            className: "cd-grid",
                                            style: { display: "grid", gap: "10px", marginTop: "20px" },
                                            children: [
                                                {
                                                    className: "cd-row",
                                                    children: [
                                                        { tag: "input", type: "checkbox", checked: clothes.jacket !== false, 
                                                          onchange(e) { clothes.jacket = e.target.checked; } 
                                                        },
                                                        { tag: "label", textContent: "Chassid Jacket", style: { fontSize: "18px" } }
                                                    ]
                                                },
                                                {
                                                    className: "cd-row",
                                                    children: [
                                                        { tag: "input", type: "checkbox", checked: clothes.yarmulke !== false, 
                                                          onchange(e) { clothes.yarmulke = e.target.checked; } 
                                                        },
                                                        { tag: "label", textContent: "Kippah / Yarmulke", style: { fontSize: "18px" } }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                });
                            }
                        }
                    }
                }
            ]
        }
    ]
};
