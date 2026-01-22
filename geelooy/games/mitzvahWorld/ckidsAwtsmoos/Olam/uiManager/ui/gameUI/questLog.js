// B"H
/**
 * questLog.js - The mirror of the soul's current duties.
 * Refined with advanced sorting and interaction confirmation.
 */
export default {
    shaym: "questLog",
    className: "quest-log hidden",
    awtsmoosClick: true,
    
    state: {
        sortBy: 'PRIORITY',
        filter: 'ACTIVE'
    },

    on: {
        open(e, $, ui) {
             $("questLog").classList.remove("hidden");
             ui.peula($("questLog"), { refresh: true });
        },
        refresh(e, $, ui) {
             const list = $("questListContent");
             list.innerHTML = "";
             
             // Request latest sorted data from worker
             ui.peula("ikar", { 
                olamPeula: { 
                    getQuests: { sortBy: this.state.sortBy } 
                } 
             }).then(data => {
                const quests = data.quests || [];
                if (quests.length === 0) {
                    list.innerHTML = "<div style='text-align:center; padding:50px; opacity:0.5'>No active missions.</div>";
                    return;
                }
                
                quests.forEach(q => {
                    const isOverdue = q.expiresAt > 0 && Date.now() > q.expiresAt;
                    const priorityText = q.priority >= 3 ? "Vital" : (q.priority >= 2 ? "Important" : "Standard");
                    const pColor = q.priority >= 3 ? "#bc13fe" : (q.priority >= 2 ? "#FFD700" : "#4cc9f0");

                    ui.html({
                        parent: list,
                        className: "quest-card",
                        style: {
                            background: "rgba(255,255,255,0.05)", borderLeft: `6px solid ${pColor}`,
                            borderRadius: "10px", padding: "15px", marginBottom: "12px",
                            opacity: isOverdue ? 0.6 : 1
                        },
                        children: [
                            {
                                style: { display: "flex", justifyContent: "space-between", alignItems: "center" },
                                children: [
                                    { tag: "h3", textContent: q.title, style: { margin: 0, color: pColor } },
                                    { 
                                        tag: "span", textContent: priorityText, 
                                        style: { background: pColor, color: "black", padding: "2px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold" } 
                                    }
                                ]
                            },
                            { tag: "p", textContent: q.description, style: { fontSize: "14px", margin: "10px 0" } },
                            {
                                style: { fontSize: "12px", color: isOverdue ? "#ff4757" : "#aaa", marginBottom: "10px" },
                                textContent: q.expiresAt > 0 ? "Expires: " + new Date(q.expiresAt).toLocaleTimeString() : "Ongoing Mitzvah"
                            },
                            {
                                style: { display: "flex", gap: "10px" },
                                children: [
                                    q.state === 'ACTIVE' ? {
                                        tag: "button", className: "awtsmoosBtn small", textContent: "MARK DONE",
                                        onclick: () => {
                                            ui.peula("ikar", { olamPeula: { markQuestComplete: q.id } });
                                        }
                                    } : null,
                                    {
                                        tag: "button", className: "awtsmoosBtn small", style: { borderColor: "#ff4757", color: "#ff4757" },
                                        textContent: "ABANDON",
                                        onclick: async () => {
                                            // Sacred Confirmation via inputModal
                                            const result = await ui.peula("ikar", { 
                                                olamPeula: { 
                                                    sendUiEvent: { 
                                                        shaym: "inputModal", 
                                                        ob: { requestInput: { title: "Abandon Shlichus?", placeholder: "Type 'ABANDON' to confirm." } } 
                                                    } 
                                                } 
                                            });
                                            if (result && result.value === "ABANDON") {
                                                ui.peula("ikar", { olamPeula: { dropQuest: q.id } });
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                });
             });
        }
    },

    children: [
        {
            // Sorting Controls
            style: { padding: "20px", borderBottom: "1px solid rgba(255,215,0,0.3)", display: "flex", gap: "15px", background: "rgba(0,0,0,0.2)" },
            children: [
                { tag: "span", textContent: "Sort By:", style: { color: "#FFD700", fontWeight: "bold", alignSelf: "center" } },
                { tag: "button", className: "awtsmoosBtn small", textContent: "Priority", onclick(e,$,ui){ $("questLog").state.sortBy='PRIORITY'; ui.peula($("questLog"), {refresh:true}); } },
                { tag: "button", className: "awtsmoosBtn small", textContent: "Due Date", onclick(e,$,ui){ $("questLog").state.sortBy='DATE'; ui.peula($("questLog"), {refresh:true}); } },
                { tag: "button", className: "awtsmoosBtn small", textContent: "Title", onclick(e,$,ui){ $("questLog").state.sortBy='TITLE'; ui.peula($("questLog"), {refresh:true}); } },
                { 
                    tag: "button", className: "awtsmoosBtn small", style: { marginLeft: "auto", borderColor: "#ff4757" }, textContent: "CLOSE",
                    onclick(e, $) { $("questLog").classList.add("hidden"); } 
                }
            ]
        },
        {
            shaym: "questListContent",
            style: { flex: 1, overflowY: "auto", padding: "20px" }
        }
    ]
};
