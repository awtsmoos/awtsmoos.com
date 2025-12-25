
// B"H
/**
 * Mitzvah Journal (Quest Log) - Refined with Search, Priority, and Filtering.
 * For every effort in the lower world creates a vessel for the Light.
 */
export default {
    shaym: "questLog",
    className: "quest-log hidden",
    awtsmoosClick: true,
    style: {
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "90%", maxWidth: "800px", height: "80%", maxHeight: "650px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "4px solid #FFD700", borderRadius: "20px", zIndex: 3000,
        display: "flex", flexDirection: "column", color: "white", 
        fontFamily: "Fredoka, sans-serif", boxShadow: "0 0 50px rgba(0,0,0,0.8)"
    },
    
    currentFilter: "ALL",
    searchText: "",

    on: {
        open(e, $, ui) {
             $("questLog").classList.remove("hidden");
             ui.peula($("questLog"), { refresh: true });
        },
        refresh(e, $, ui) {
             const log = $("questLog");
             const list = $("questListContent");
             list.innerHTML = "";
             
             // In a real environment, we'd fetch this from the ShlichusHandler
             const quests = e.detail.quests || [];
             
             // Filtering logic
             const filtered = quests.filter(q => {
                 const matchesSearch = q.title.toLowerCase().includes(log.searchText.toLowerCase()) || 
                                     q.description.toLowerCase().includes(log.searchText.toLowerCase());
                 const matchesFilter = log.currentFilter === "ALL" || 
                                     (log.currentFilter === "ACTIVE" && q.state !== 'COMPLETED') ||
                                     (log.currentFilter === "HIGH" && q.priority >= 2);
                 return matchesSearch && matchesFilter;
             });

             if (filtered.length === 0) {
                 list.innerHTML = `<div style='text-align:center; padding:50px; opacity:0.5'>
                    No matching Mitzvahs. ${log.searchText ? 'Try a different search.' : 'Seek and you shall find!'}
                 </div>`;
                 return;
             }
             
             filtered.forEach(q => {
                 const percent = q.progress || 0;
                 const priorityColors = { 1: "#4cc9f0", 2: "#FFD700", 3: "#bc13fe" };
                 const pColor = priorityColors[q.priority || 1];

                 ui.html({
                     parent: list,
                     className: "quest-card",
                     style: {
                         background: "rgba(255,255,255,0.05)", borderLeft: `6px solid ${pColor}`,
                         borderRadius: "10px", padding: "15px", marginBottom: "12px",
                         transition: "transform 0.2s"
                     },
                     children: [
                         {
                             style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                             children: [
                                 { 
                                    tag: "h3", textContent: q.title, 
                                    style: { margin: 0, color: pColor, textShadow: `0 0 5px ${pColor}44` } 
                                 },
                                 { 
                                     tag: "span", 
                                     textContent: q.state === 'READY_TO_TURN_IN' ? "REDEEM" : (q.state === 'COMPLETED' ? "DONE" : "ACTIVE"),
                                     style: { 
                                         background: q.state === 'READY_TO_TURN_IN' ? "#00ff00" : "#333", 
                                         color: q.state === 'READY_TO_TURN_IN' ? "black" : "#ccc",
                                         padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold"
                                     } 
                                 }
                             ]
                         },
                         { tag: "p", textContent: q.description, style: { fontSize: "15px", opacity: 0.8, margin: "10px 0" } },
                         { 
                             className: "quest-progress-bar", 
                             style: { width: "100%", height: "8px", background: "#111", borderRadius: "4px", overflow: "hidden" },
                             children: [
                                 { style: { width: percent + "%", height: "100%", background: pColor, boxShadow: `0 0 10px ${pColor}` } }
                             ]
                         }
                     ]
                 });
             });
        }
    },

    children: [
        {
            // Header with Search
            style: { padding: "20px", borderBottom: "1px solid rgba(255,215,0,0.2)", background: "rgba(0,0,0,0.2)" },
            children: [
                {
                    style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
                    children: [
                        { tag: "h2", textContent: "Mitzvah Journal", style: { margin: 0, color: "#FFD700" } },
                        { 
                            tag: "button", textContent: "✕", 
                            style: { background: "none", border: "none", color: "white", fontSize: "24px", cursor: "pointer" },
                            onclick(e, $) { $("questLog").classList.add("hidden"); } 
                        }
                    ]
                },
                {
                    className: "ql-controls",
                    style: { display: "flex", gap: "10px", alignItems: "center" },
                    children: [
                        {
                            tag: "input",
                            placeholder: "Search missions...",
                            style: { 
                                flex: 1, padding: "10px 15px", borderRadius: "50px", 
                                background: "rgba(255,255,255,0.1)", border: "1px solid #444", color: "white" 
                            },
                            oninput(e, $, ui) {
                                $("questLog").searchText = e.target.value;
                                ui.peula($("questLog"), { refresh: true });
                            }
                        },
                        {
                            tag: "select",
                            style: { padding: "10px", borderRadius: "5px", background: "#333", color: "white", border: "1px solid #555" },
                            onchange(e, $, ui) {
                                $("questLog").currentFilter = e.target.value;
                                ui.peula($("questLog"), { refresh: true });
                            },
                            children: [
                                { tag: "option", value: "ALL", textContent: "All" },
                                { tag: "option", value: "ACTIVE", textContent: "Active" },
                                { tag: "option", value: "HIGH", textContent: "High Priority" }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            shaym: "questListContent",
            style: { flex: 1, overflowY: "auto", padding: "20px" }
        }
    ]
};
