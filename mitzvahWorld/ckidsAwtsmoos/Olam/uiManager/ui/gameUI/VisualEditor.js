
// B"H
/**
 * VisualEditor.js
 * A UI for inspecting and modifying world objects.
 */
export default {
    shaym: "VisualEditor",
    className: "visual-editor hidden",
    awtsmoosClick: true,
    
    state: {
        selectedObject: null,
        mode: 'translate', // translate, rotate, scale
    },

    on: {
        open(e, $, ui) {
            $("VisualEditor").classList.remove("hidden");
            ui.peula($("VisualEditor"), { refresh: true });
        },
        close(e, $, ui) {
             $("VisualEditor").classList.add("hidden");
             ui.peula("ikar", { olamPeula: { clearEditorSelection: true } });
        },
        objectSelected(e, $, ui) {
            const data = e.detail;
            const editor = $("VisualEditor");
            editor.state.selectedObject = data;
            editor.classList.remove("hidden");
            ui.peula(editor, { refresh: true });
        },
        refresh(e, $, ui) {
            const container = $("ve-content");
            container.innerHTML = "";
            const obj = $("VisualEditor").state.selectedObject;

            if (!obj) {
                container.innerHTML = "<div style='padding:20px; text-align:center;'>No Object Selected<br>(Click an object in 'G' mode)</div>";
                return;
            }

            ui.html({
                parent: container,
                style: { display: "flex", flexDirection: "column", gap: "10px" },
                children: [
                    { tag: "h3", textContent: obj.name || "Unnamed Object", style: { margin: 0, color: "#00ffed" } },
                    { textContent: `Type: ${obj.type}` },
                    
                    // Transform Controls
                    {
                        className: "ve-group",
                        children: [
                            { textContent: "Position (X, Y, Z)", className: "ve-label" },
                            {
                                style: { display: "flex", gap: "5px" },
                                children: ["x", "y", "z"].map(axis => ({
                                    tag: "input", type: "number", className: "ve-input",
                                    value: obj.position[axis].toFixed(2), step: "0.1",
                                    oninput: (ev) => {
                                        ui.peula("ikar", { olamPeula: { updateObjectTransform: { id: obj.id, type: 'position', axis, value: parseFloat(ev.target.value) } } });
                                    }
                                }))
                            }
                        ]
                    },
                    {
                        className: "ve-group",
                        children: [
                            { textContent: "Rotation (X, Y, Z)", className: "ve-label" },
                            {
                                style: { display: "flex", gap: "5px" },
                                children: ["x", "y", "z"].map(axis => ({
                                    tag: "input", type: "number", className: "ve-input",
                                    value: (obj.rotation[axis] * 180 / Math.PI).toFixed(1), step: "5",
                                    oninput: (ev) => {
                                        ui.peula("ikar", { olamPeula: { updateObjectTransform: { id: obj.id, type: 'rotation', axis, value: parseFloat(ev.target.value) * Math.PI / 180 } } });
                                    }
                                }))
                            }
                        ]
                    },
                     {
                        className: "ve-group",
                        children: [
                            { textContent: "Scale (X, Y, Z)", className: "ve-label" },
                            {
                                style: { display: "flex", gap: "5px" },
                                children: ["x", "y", "z"].map(axis => ({
                                    tag: "input", type: "number", className: "ve-input",
                                    value: obj.scale[axis].toFixed(2), step: "0.1",
                                    oninput: (ev) => {
                                        ui.peula("ikar", { olamPeula: { updateObjectTransform: { id: obj.id, type: 'scale', axis, value: parseFloat(ev.target.value) } } });
                                    }
                                }))
                            }
                        ]
                    },
                    
                    // Actions
                    {
                        style: { display: "flex", gap: "10px", marginTop: "10px" },
                        children: [
                            { 
                                tag: "button", className: "ve-btn danger", textContent: "Delete",
                                onclick: () => {
                                    ui.peula("ikar", { olamPeula: { deleteObject: obj.id } });
                                    $("VisualEditor").state.selectedObject = null;
                                    ui.peula($("VisualEditor"), { refresh: true });
                                }
                            },
                            { 
                                tag: "button", className: "ve-btn", textContent: "Duplicate",
                                onclick: () => {
                                    ui.peula("ikar", { olamPeula: { duplicateObject: obj.id } });
                                }
                            }
                        ]
                    }
                ]
            });
        }
    },
    
    children: [
        {
            className: "ve-panel",
            style: {
                position: "fixed", right: "20px", top: "100px", width: "300px",
                background: "rgba(10, 15, 30, 0.9)", border: "2px solid #00ffed",
                borderRadius: "10px", padding: "15px", color: "white",
                boxShadow: "0 0 20px rgba(0, 255, 237, 0.2)", fontFamily: "sans-serif",
                maxHeight: "80vh", overflowY: "auto"
            },
            children: [
                {
                    style: { display: "flex", justifyContent: "space-between", marginBottom: "15px", borderBottom: "1px solid #444", paddingBottom: "10px" },
                    children: [
                        { tag: "strong", textContent: "Object Properties" },
                        { tag: "button", textContent: "X", style: { background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }, onclick(e,$,ui) { ui.peula($("VisualEditor"), { close: true }); } }
                    ]
                },
                { shaym: "ve-content" }
            ]
        },
        { tag: "style", innerHTML: `
            .ve-group { margin-bottom: 15px; }
            .ve-label { font-size: 12px; color: #aaa; margin-bottom: 5px; display: block; }
            .ve-input { background: rgba(0,0,0,0.5); border: 1px solid #444; color: white; width: 100%; padding: 5px; border-radius: 4px; }
            .ve-btn { padding: 8px 12px; border: none; border-radius: 4px; background: #444; color: white; cursor: pointer; flex: 1; }
            .ve-btn:hover { background: #555; }
            .ve-btn.danger { background: #aa3333; }
            .ve-btn.danger:hover { background: #cc4444; }
        `}
    ]
}
