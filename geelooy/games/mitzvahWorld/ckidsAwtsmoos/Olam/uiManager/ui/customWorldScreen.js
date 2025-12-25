
/**
 * B"H
 */
import LocalDatabase from "../../../utils/LocalDatabase.js";

export default {
    shaym: "custom world",
    className: "customWorldScreen hidden",
    style: {
        position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
        background: "linear-gradient(135deg, #1a0b2e 0%, #000000 100%)",
        color: "white", fontFamily: "Fredoka, sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center",
        zIndex: "5000", overflowY: "auto"
    },
    
    on: {
        awtsmoosRevealed(e, $, ui) {
            ui.peula($("custom world"), { refreshLocalList: true });
        },
        async refreshLocalList(e, $, ui) {
            const listContainer = $("local-worlds-list");
            if(!listContainer) return;
            
            listContainer.innerHTML = "<div style='color:white; padding:10px;'>Loading local worlds...</div>";
            
            try {
                const worlds = await LocalDatabase.getWorlds();
                listContainer.innerHTML = "";
                
                if (worlds.length === 0) {
                    listContainer.innerHTML = "<div style='color:#ccc; padding:20px; text-align:center;'>No local worlds found.<br>Save a world in-game to see it here.</div>";
                    return;
                }

                worlds.forEach(w => {
                    ui.html({
                        parent: listContainer,
                        className: "cw-card",
                        style: {
                            background: "rgba(255,255,255,0.1)", margin: "10px", padding: "15px",
                            borderRadius: "10px", border: "1px solid #FFD700", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            width: "80%", maxWidth: "600px"
                        },
                        onclick: async () => {
                            try {
                                const content = await LocalDatabase.loadWorld(w.id);
                                if(content) {
                                    const blobUrl = URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
                                    const ikar = $("ikar");
                                    const mm = $("main menu");
                                    
                                    if(ikar && mm) {
                                        ikar.dispatchEvent(new CustomEvent("start", {
                                            detail: { worldDayuhURL: blobUrl, gameUiHTML: window.awtsmoosGameUI }
                                        }));
                                        
                                        $("custom world").classList.add("hidden");
                                        mm.classList.add("hidden");
                                        const ld = $("loading");
                                        if(ld) ld.classList.remove("hidden");
                                    }
                                }
                            } catch(err) {
                                alert("Failed to load local world.");
                                console.error(err);
                            }
                        },
                        children: [
                            {
                                style: { textAlign: "left" },
                                children: [
                                    { tag: "h3", textContent: w.name, style: { margin: "0 0 5px 0", color: "#FFD700" } },
                                    { textContent: new Date(w.date).toLocaleString(), style: { fontSize: "12px", color: "#ccc" } },
                                    { textContent: w.description || "No description", style: { fontSize: "14px", fontStyle: "italic", marginTop: "5px" } }
                                ]
                            },
                            {
                                tag: "button",
                                textContent: "Delete",
                                style: { background: "#ff4757", color: "white", border: "none", borderRadius: "5px", padding: "8px 15px", cursor: "pointer", fontWeight: "bold" },
                                onclick: async (ev) => {
                                    ev.stopPropagation();
                                    if(confirm(`Are you sure you want to delete "${w.name}"?`)) {
                                        await LocalDatabase.deleteWorld(w.id);
                                        ui.peula($("custom world"), { refreshLocalList: true });
                                    }
                                }
                            }
                        ]
                    });
                });
            } catch(e) {
                console.error(e);
                listContainer.innerHTML = "<div style='color:red; padding:10px;'>Error loading worlds.</div>";
            }
        }
    },

    children: [
        {
            style: { width: "100%", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.5)" },
            children: [
                { 
                    tag: "button", 
                    className: "awtsmoosBtn", 
                    textContent: "Back",
                    onclick(e, $) {
                        $("custom world").classList.add("hidden");
                        const mm = $("main menu");
                        if(mm) mm.classList.remove("hidden");
                    }
                },
                { tag: "h1", textContent: "Saved Worlds", style: { margin: 0, color: "#FFD700" } },
                { style: { width: "100px" } } // Spacer
            ]
        },
        {
            shaym: "local-worlds-list",
            style: { flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }
        },
        {
            style: { padding: "30px", width: "100%", textAlign: "center", borderTop: "1px solid #444", background: "rgba(0,0,0,0.8)" },
            children: [
                { tag: "h3", textContent: "Import World File (.js)", style: { color: "#4cc9f0", marginBottom: "15px" } },
                {
                    tag: "button",
                    className: "awtsmoosBtn",
                    textContent: "Select File...",
                    onclick(e, $, ui) {
                        const input = ui.html({
                            tag: "input", type: "file", accept: ".js", style: { display: "none" },
                            parent: $("custom world"),
                            onchange: async (ev) => {
                                const file = ev.target.files[0];
                                if(!file) return;
                                
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                    const content = e.target.result;
                                    const blobUrl = URL.createObjectURL(new Blob([content], { type: "application/javascript" }));
                                    const ikar = $("ikar");
                                    const mm = $("main menu");
                                    
                                    if(ikar && mm) {
                                        ikar.dispatchEvent(new CustomEvent("start", {
                                            detail: { worldDayuhURL: blobUrl, gameUiHTML: window.awtsmoosGameUI }
                                        }));
                                        
                                        $("custom world").classList.add("hidden");
                                        mm.classList.add("hidden");
                                        const ld = $("loading");
                                        if(ld) ld.classList.remove("hidden");
                                    }
                                };
                                reader.readAsText(file);
                            }
                        });
                        input.click();
                    }
                }
            ]
        }
    ]
};
