
// B"H
import style from "./skins/2/characterDesignerStyle.js";

export default {
    shaym: "character designer",
    className: "characterDesigner hidden",
    
    // B"H: State and Helpers defined as properties
    characterState: {
        name: "My NPC",
        color: "#00ffff",
        dialogueTree: [
            {
                id: 0,
                message: "B\"H\nShalom!",
                responses: []
            }
        ]
    },
    
    createMessageNode: function(id) {
        return {
            id: id,
            message: "New Message",
            responses: []
        };
    },
    createResponse: function() {
        return {
            text: "Response",
            type: "message", 
            target: 0,
            storeItems: []
        };
    },
    
    ready(el) {
       // Post-render logic if needed
    },

    on: {
        // B"H: Event to open the designer with context (Create or Edit)
        open(e, $, ui) {
            console.log("B\"H - Opening Character Designer", e.detail);
            const designer = e.target;
            const { mode, item, index, sourceType } = e.detail;
            
            // Force visibility
            designer.classList.remove("hidden");
            designer.style.display = "flex"; 
            
            // Reset or Load State
            if (mode === 'edit' && item && item.customData) {
                designer.characterState = JSON.parse(JSON.stringify(item.customData));
                designer.editContext = { index, sourceType }; // Store where we are editing from
                
                // Update Header Title
                const titleEl = designer.querySelector(".cd-title");
                if(titleEl) titleEl.textContent = "Editing: " + item.name;
            } else {
                // Default New Character State
                designer.characterState = {
                    name: "New Soul",
                    color: "#00ffff",
                    dialogueTree: [{ id: 0, message: "B\"H\nShalom!", responses: [] }]
                };
                designer.editContext = null; // Clear edit context
                
                const titleEl = designer.querySelector(".cd-title");
                if(titleEl) titleEl.textContent = "Design New Soul";
            }

            // Refresh UI Inputs to match state
            const nameInput = designer.querySelector(".cd-sidebar input.cd-input[type='text']"); 
            if(nameInput) nameInput.value = designer.characterState.name;
            
            const colorInput = designer.querySelector(".cd-sidebar input[type='color']");
            if(colorInput) colorInput.value = designer.characterState.color;

            // Render Tree
            const treeContainer = $("cd-tree-container");
            if (treeContainer) {
                ui.peula(treeContainer, { renderTree: true });
            } else {
                console.warn("B\"H - Tree container not found!");
            }
        }
    },

    children: [
        { tag: "style", innerHTML: style },
        
        // --- Header ---
        {
            className: "cd-header",
            children: [
                { className: "cd-title", textContent: "Neshama Designer" },
                {
                    tag: "button",
                    className: "cd-close",
                    textContent: "X",
                    onclick(e, $) {
                        const el = $("character designer");
                        if (el) {
                            el.classList.add("hidden");
                            el.style.display = "none";
                        }
                    }
                }
            ]
        },

        // --- Body ---
        {
            className: "cd-body",
            children: [
                // --- Sidebar (Settings) ---
                {
                    className: "cd-sidebar",
                    children: [
                        {
                            className: "cd-input-group",
                            children: [
                                { className: "cd-label", textContent: "Name" },
                                {
                                    tag: "input",
                                    type: "text", // Explicit type
                                    className: "cd-input",
                                    ready(input, $) {
                                        const el = $("character designer");
                                        if (el && el.characterState) {
                                            input.value = el.characterState.name;
                                        }
                                    },
                                    oninput(e, $) { 
                                        const el = $("character designer");
                                        if (el && el.characterState) {
                                            el.characterState.name = e.target.value; 
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            className: "cd-input-group",
                            children: [
                                { className: "cd-label", textContent: "Aura Color" },
                                {
                                    tag: "input",
                                    type: "color",
                                    className: "cd-input",
                                    ready(input, $) {
                                        const el = $("character designer");
                                        if (el && el.characterState) {
                                            input.value = el.characterState.color;
                                        }
                                    },
                                    oninput(e, $) { 
                                        const el = $("character designer");
                                        if (el && el.characterState) {
                                            el.characterState.color = e.target.value; 
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            tag: "button",
                            className: "cd-btn secondary",
                            textContent: "+ Add Message Node",
                            onclick(e, $, ui) {
                                const designer = $("character designer");
                                if (!designer || !designer.characterState) return;
                                
                                const state = designer.characterState;
                                const newId = state.dialogueTree.length;
                                state.dialogueTree.push(designer.createMessageNode(newId));
                                
                                const treeContainer = $("cd-tree-container");
                                if (treeContainer) {
                                    ui.peula(treeContainer, { renderTree: true });
                                }
                            }
                        },
                        {
                            tag: "button",
                            className: "cd-create-btn",
                            textContent: "SAVE SOUL",
                            onclick(e, $, ui) {
                                const designer = $("character designer");
                                if (!designer || !designer.characterState) return;
                                
                                const state = designer.characterState;
                                
                                // 1. Check Context (Create vs Update)
                                if (designer.editContext) {
                                    // Update existing item
                                    const { index, sourceType } = designer.editContext;
                                    
                                    // We only send the fields we want to update
                                    const updateData = {
                                        name: state.name,
                                        customData: JSON.parse(JSON.stringify(state))
                                    };
                                    
                                    ui.peula("ikar", {
                                        olamPeula: {
                                            updateInventoryItem: {
                                                sourceType,
                                                index,
                                                itemData: updateData
                                            }
                                        }
                                    });
                                    alert("Character Updated!");
                                    
                                } else {
                                    // Create new item
                                    const itemData = {
                                        id: "custom_npc_" + Date.now(),
                                        className: "CustomNpc",
                                        name: state.name,
                                        description: "A custom soul created by you.",
                                        customData: JSON.parse(JSON.stringify(state)), // Deep copy
                                        icon: "https://awtsmoos.com/api/social/aliases/awtsmoos/fileSystem/readFile?path=desktop.folder%2Fgame+data.folder%2Flogos.folder%2Fteffilin+micro+icon.png" 
                                    };

                                    ui.peula("ikar", {
                                        olamPeula: {
                                            addItem: itemData 
                                        }
                                    });
                                    alert("New Character Created!");
                                }
                                
                                designer.classList.add("hidden");
                                designer.style.display = "none";
                            }
                        }
                    ]
                },

                // --- Main Area (Dialogue Tree Editor) ---
                {
                    className: "cd-main",
                    children: [
                        {
                            shaym: "cd-tree-container",
                            className: "cd-tree-container",
                            ready(el, $, ui) {
                                // Initial render if state exists (might be redundant due to 'open' event, but safe)
                                const designer = $("character designer");
                                if(designer && designer.characterState)
                                    ui.peula(el, { renderTree: true });
                            },
                            on: {
                                renderTree(e, $, ui) {
                                    const container = e.target;
                                    const designer = $("character designer");
                                    if (!designer || !designer.characterState) return;
                                    
                                    const state = designer.characterState;
                                    
                                    container.innerHTML = ""; // Clear

                                    state.dialogueTree.forEach((node, index) => {
                                        ui.html({
                                            parent: container,
                                            className: "cd-node",
                                            children: [
                                                {
                                                    className: "cd-node-header",
                                                    textContent: `Node ID: ${index}`
                                                },
                                                {
                                                    tag: "textarea",
                                                    className: "cd-input",
                                                    style: { width: "100%", height: "60px" },
                                                    value: node.message,
                                                    oninput(ev) { node.message = ev.target.value; }
                                                },
                                                {
                                                    className: "cd-response-list",
                                                    ready(listEl) {
                                                        // Render Responses
                                                        const renderResponses = () => {
                                                            listEl.innerHTML = "";
                                                            node.responses.forEach((resp, rIndex) => {
                                                                ui.html({
                                                                    parent: listEl,
                                                                    className: "cd-response",
                                                                    children: [
                                                                        {
                                                                            tag: "input",
                                                                            className: "cd-input",
                                                                            value: resp.text,
                                                                            placeholder: "Response Text",
                                                                            oninput(ev) { resp.text = ev.target.value; }
                                                                        },
                                                                        {
                                                                            className: "cd-row",
                                                                            children: [
                                                                                {
                                                                                    tag: "select",
                                                                                    className: "cd-select",
                                                                                    value: resp.type,
                                                                                    onchange(ev) { 
                                                                                        resp.type = ev.target.value;
                                                                                        renderResponses(); // Re-render to show/hide fields
                                                                                    },
                                                                                    children: [
                                                                                        { tag: "option", value: "message", textContent: "Go to Node" },
                                                                                        { tag: "option", value: "store", textContent: "Open Store" },
                                                                                        { tag: "option", value: "close", textContent: "Close Dialogue" }
                                                                                    ]
                                                                                },
                                                                                // Dynamic fields based on type
                                                                                resp.type === "message" ? {
                                                                                    tag: "input",
                                                                                    type: "number",
                                                                                    className: "cd-input",
                                                                                    style: { width: "60px" },
                                                                                    value: resp.target || 0,
                                                                                    oninput(ev) { 
                                                                                        const val = parseInt(ev.target.value) || 0;
                                                                                        resp.nextMessageIndex = val; 
                                                                                        resp.target = val;
                                                                                    }
                                                                                } : null,
                                                                                
                                                                                resp.type === "store" ? {
                                                                                    tag: "button",
                                                                                    className: "cd-btn secondary",
                                                                                    style: { fontSize: "10px", padding: "5px" },
                                                                                    textContent: "Set Items (Default)",
                                                                                    onclick() { 
                                                                                        alert("Store configured with default items (Brick, Wheat)."); 
                                                                                        resp.action = "openStore"; 
                                                                                    }
                                                                                } : null,

                                                                                {
                                                                                    tag: "button",
                                                                                    textContent: "X",
                                                                                    style: { background: "red", border: "none", color: "white", cursor: "pointer" },
                                                                                    onclick() {
                                                                                        node.responses.splice(rIndex, 1);
                                                                                        renderResponses();
                                                                                    }
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                });
                                                            });
                                                            
                                                            // Add Response Button
                                                            ui.html({
                                                                parent: listEl,
                                                                tag: "button",
                                                                className: "cd-btn secondary",
                                                                style: { marginTop: "10px" },
                                                                textContent: "+ Add Response",
                                                                onclick() {
                                                                    node.responses.push(designer.createResponse());
                                                                    renderResponses();
                                                                }
                                                            });
                                                        };
                                                        renderResponses();
                                                    }
                                                }
                                            ]
                                        });
                                    });
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ]
};
