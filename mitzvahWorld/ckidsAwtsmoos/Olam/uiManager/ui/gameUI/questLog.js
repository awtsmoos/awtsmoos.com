
// B"H
export default {
    shaym: "questLog",
    className: "quest-log hidden",
    awtsmoosClick: true,
    style: {
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "90%", maxWidth: "800px", height: "80%", maxHeight: "600px",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "4px solid #FFD700", borderRadius: "20px", zIndex: 3000,
        display: "flex", flexDirection: "column", color: "white", 
        fontFamily: "Fredoka, sans-serif", boxShadow: "0 0 50px rgba(0,0,0,0.8)"
    },
    
    on: {
        open(e, $, ui) {
             $("questLog").classList.remove("hidden");
             ui.peula($("questLog"), { refresh: true });
        },
        refresh(e, $, ui) {
             const list = $("questListContent");
             list.innerHTML = "";
             
             // Get active quests from handler via Olam
             // Note: In worker structure, we might need to request this data. 
             // But assuming we have access to the handler instance in the main thread mirror or via events:
             // For now, assume this event is triggered with data.
             
             const quests = e.detail.quests || [];
             
             if (quests.length === 0) {
                 list.innerHTML = "<div style='text-align:center; padding:50px; opacity:0.5'>No active missions. Go find some!</div>";
                 return;
             }
             
             quests.forEach(q => {
                 const percent = q.progress || 0;
                 ui.html({
                     parent: list,
                     className: "quest-card",
                     style: {
                         background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,215,0,0.3)",
                         borderRadius: "10px", padding: "15px", marginBottom: "10px"
                     },
                     children: [
                         {
                             style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                             children: [
                                 { tag: "h3", textContent: q.title, style: { margin: 0, color: "#FFD700" } },
                                 { 
                                     tag: "span", 
                                     textContent: q.state === 'READY_TO_TURN_IN' ? "RETURN!" : (q.state === 'COMPLETED' ? "DONE" : "ACTIVE"),
                                     style: { 
                                         background: q.state === 'READY_TO_TURN_IN' ? "#00ff00" : "#444", 
                                         color: "black", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold"
                                     } 
                                 }
                             ]
                         },
                         { tag: "p", textContent: q.description, style: { fontSize: "14px", opacity: 0.8 } },
                         { 
                             className: "quest-progress-bar", 
                             style: { width: "100%", height: "10px", background: "#333", borderRadius: "5px", marginTop: "10px", overflow: "hidden" },
                             children: [
                                 { style: { width: percent + "%", height: "100%", background: "linear-gradient(90deg, #FFD700, #FFA500)" } }
                             ]
                         }
                     ]
                 });
             });
        }
    },

    children: [
        {
            style: { padding: "20px", borderBottom: "2px solid rgba(255,215,0,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
                { tag: "h2", textContent: "Mitzvah Journal", style: { margin: 0, color: "#FFD700", textShadow: "0 0 10px #FFD700" } },
                { tag: "button", className: "awtsmoosBtn", textContent: "X", onclick(e, $) { $("questLog").classList.add("hidden"); } }
            ]
        },
        {
            shaym: "questListContent",
            style: { flex: 1, overflowY: "auto", padding: "20px" }
        }
    ]
};
