
// B"H
import style from "./skins/2/characterDesignerStyle.js";

export default {
    shaym: "character designer",
    className: "characterDesigner hidden",
    ready(el) {
        // Define helpers on the element so they are accessible
        el.createMessageNode = (id) => ({
            id: id,
            message: "New Message",
            responses: []
        });

        el.createResponse = () => ({
            text: "Response",
            type: "message", 
            target: 0,
            storeItems: []
        });

        // Initialize State on the element
        el.characterState = {
            name: "My NPC",
            color: "#00ffff",
            dialogueTree: [el.createMessageNode(0)]
        };
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
                        $("character designer").classList.add("hidden");
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
                                    className: "cd-input",
                                    ready(input, $) {
                                        const state = $("character designer").characterState;
                                        input.value = state.name;
                                    },
                                    oninput(e, $) { 
                                        const state = $("character designer").characterState;
                                        state.name = e.target.value; 
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
                                        const state = $("character designer").characterState;
                                        input.value = state.color;
                                    },
                                    oninput(e, $) { 
                                        const state = $("character designer").characterState;
                                        state.color = e.target.value; 
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
                                const state = designer.characterState;
                                const newId = state.dialogueTree.length;
                                state.dialogueTree.push(designer.createMessageNode(newId));
                                ui.peula($("cd-tree-container"), { renderTree: true });
                            }
                        },
                        {
                            tag: "button",
                            className: "cd-create-btn",
                            textContent: "CREATE SOUL",
                            onclick(e, $, ui) {
                                const state = $("character designer").characterState;
                                // 1. Construct final item data
                                const itemData = {
                                    id: "custom_npc_" + Date.now(),
                                    className: "CustomNpc",
                                    name: state.name,
                                    description: "A custom soul created by you.",
                                    customData: JSON.parse(JSON.stringify(state)), // Deep copy
                                    icon: "https://awtsmoos.com/api/social/aliases/awtsmoos/fileSystem/readFile?path=desktop.folder%2Fgame+data.folder%2Flogos.folder%2Fteffilin+micro+icon.png" 
                                };

                                // 2. Add to inventory via worker task 'addItem'
                                ui.peula("ikar", {
                                    olamPeula: {
                                        addItem: itemData 
                                    }
                                });
                                
                                alert("Character Created! Check your Inventory.");
                                $("character designer").classList.add("hidden");
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
                                ui.peula(el, { renderTree: true });
                            },
                            on: {
                                renderTree(e, $, ui) {
                                    const container = e.target;
                                    const designer = $("character designer");
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
