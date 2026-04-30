
/**
 * B"H
 * @module VisualEditor
 * @description
 * 
 * THE SCRIBE'S TOOLS
 * 
 * Chapter 33: The Correction of the Lines
 * "Write these things in a book..." (Shemot 17:14)
 * The Visual Editor allows the architect to modify the coordinates 
 * of any vessel in real-time. This module is the quill that adjusts 
 * the position and rotation of matter within the Olam.
 */
export default {
    shaym: "VisualEditor",
    className: "visual-editor hidden",
    awtsmoosClick: true,
    
    // B"H: Use internal localState to avoid conflict with UI system 'state' reserved key
    localState: {
        selectedObject: null,
        mode: 'translate', 
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
            // B"H: Update coordinates safely
            editor.localState.selectedObject = data;
            editor.classList.remove("hidden");
            ui.peula(editor, { refresh: true });
        },
        refresh(e, $, ui) {
            const container = $("ve-content");
            if (!container) return;
            container.innerHTML = "";
            
            const editorRoot = $("VisualEditor");
            const obj = editorRoot.localState.selectedObject;

            if (!obj) {
                container.innerHTML = "<div style='padding:20px; text-align:center;'>No Object Selected<br>(Enter 'G' mode and click a vessel)</div>";
                return;
            }

            ui.html({
                parent: container,
                style: { display: "flex", flexDirection: "column", gap: "12px" },
                children: [
                    { tag: "h3", textContent: obj.name || "Anonymous Vessel", style: { margin: 0, color: "#00ffed", textTransform: "uppercase" } },
                    { textContent: `Type: ${obj.type}`, style: { fontSize: "11px", opacity: 0.6 } },
                    
                    {
                        className: "ve-group",
                        children: [
                            { textContent: "Position Coordinates", className: "ve-label" },
                            {
                                style: { display: "flex", gap: "5px" },
                                children: ["x", "y", "z"].map(axis => ({
                                    tag: "input", type: "number", className: "ve-input",
                                    value: (obj.position && obj.position[axis] !== undefined) ? obj.position[axis].toFixed(3) : 0, 
                                    step: "0.05",
                                    oninput: (ev) => {
                                        const val = parseFloat(ev.target.value);
                                        if(!isNaN(val))
                                            ui.peula("ikar", { olamPeula: { updateObjectTransform: { id: obj.id, type: 'position', axis, value: val } } });
                                    }
                                }))
                            }
                        ]
                    },
                    {
                        className: "ve-group",
                        children: [
                            { textContent: "Rotation (Degrees)", className: "ve-label" },
                            {
                                style: { display: "flex", gap: "5px" },
                                children: ["x", "y", "z"].map(axis => ({
                                    tag: "input", type: "number", className: "ve-input",
                                    value: (obj.rotation && obj.rotation[axis] !== undefined) ? (obj.rotation[axis] * 180 / Math.PI).toFixed(1) : 0, 
                                    step: "1.0",
                                    oninput: (ev) => {
                                        const val = parseFloat(ev.target.value);
                                        if(!isNaN(val))
                                            ui.peula("ikar", { olamPeula: { updateObjectTransform: { id: obj.id, type: 'rotation', axis, value: val * Math.PI / 180 } } });
                                    }
                                }))
                            }
                        ]
                    },
                    {
                        style: { display: "flex", gap: "10px", marginTop: "15px", borderTop: "1px solid #333", paddingTop: "10px" },
                        children: [
                            { 
                                tag: "button", className: "ve-btn danger", textContent: "Sealayk (Delete)",
                                onclick: () => {
                                    ui.peula("ikar", { olamPeula: { deleteObject: obj.id } });
                                    editorRoot.localState.selectedObject = null;
                                    ui.peula(editorRoot, { refresh: true });
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
                position: "fixed", right: "15px", top: "80px", width: "320px",
                background: "rgba(10, 15, 30, 0.94)", border: "2px solid #00ffed",
                borderRadius: "12px", padding: "18px", color: "white",
                boxShadow: "0 10px 40px rgba(0,0,0,0.6)", fontFamily: "sans-serif",
                maxHeight: "85vh", overflowY: "auto", zIndex: 6000
            },
            children: [
                {
                    style: { display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #444", paddingBottom: "12px" },
                    children: [
                        { tag: "strong", textContent: "The Forge: Properties", style: { color: "#ffd700", letterSpacing: "1px" } },
                        { tag: "button", textContent: "X", style: { background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", borderRadius: "50%", width: "25px", height: "25px" }, onclick(e,$,ui) { ui.peula($("VisualEditor"), { close: true }); } }
                    ]
                },
                { shaym: "ve-content" }
            ]
        },
        { tag: "style", innerHTML: `
            .visual-editor input::-webkit-outer-spin-button, 
            .visual-editor input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .ve-group { margin-bottom: 18px; }
            .ve-label { font-size: 11px; color: #4cc9f0; margin-bottom: 6px; display: block; font-weight: bold; text-transform: uppercase; }
            .ve-input { background: rgba(0,0,0,0.6); border: 1px solid #444; color: #fff; width: 100%; padding: 8px; border-radius: 4px; font-size: 14px; text-align: center; }
            .ve-input:focus { border-color: #00ffed; outline: none; box-shadow: 0 0 5px #00ffed; }
            .ve-btn { padding: 10px 14px; border: 1px solid #555; border-radius: 6px; background: #333; color: white; cursor: pointer; flex: 1; font-weight: bold; transition: 0.2s; }
            .ve-btn:hover { background: #444; border-color: #00ffed; }
            .ve-btn.danger { background: #aa2222; border-color: #ff4444; }
            .ve-btn.danger:hover { background: #cc3333; box-shadow: 0 0 10px #ff4444; }
        `}
    ]
}
