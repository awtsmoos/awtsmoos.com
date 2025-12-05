
// B"H
export default {
    shaym: "questLog",
    className: "quest-log hidden",
    awtsmoosClick: true,
    style: {
        position: "absolute", top: "10%", left: "10%", width: "80%", height: "80%",
        background: "rgba(20, 10, 40, 0.95)", border: "3px solid #FFD700",
        borderRadius: "20px", zIndex: 3000, display: "flex", flexDirection: "column",
        color: "white", fontFamily: "Fredoka, sans-serif", boxShadow: "0 0 50px rgba(0,0,0,0.8)"
    },
    children: [
        {
            style: { padding: "20px", borderBottom: "2px solid #4435B2", display: "flex", justifyContent: "space-between", alignItems: "center" },
            children: [
                { tag: "h2", textContent: "Mitzvah Journal (Quest Log)", style: { margin: 0, color: "#FFD700" } },
                { tag: "button", className: "awtsmoosBtn", textContent: "Close", onclick(e, $) { $("questLog").classList.add("hidden"); } }
            ]
        },
        {
            shaym: "questListContainer",
            style: { flex: 1, overflowY: "auto", padding: "20px" },
            children: [
                { textContent: "Active Missions", style: { fontSize: "24px", borderBottom: "1px solid #555", marginBottom: "10px", paddingBottom: "5px" } },
                { shaym: "activeQuestsList", style: { display: "flex", flexDirection: "column", gap: "10px" } },
                { textContent: "Completed", style: { fontSize: "24px", borderBottom: "1px solid #555", margin: "20px 0 10px", paddingBottom: "5px", color: "#aaa" } },
                { shaym: "completedQuestsList", style: { display: "flex", flexDirection: "column", gap: "10px", opacity: 0.7 } }
            ]
        }
    ],
    on: {
        updateQuests(e, $, ui) {
            const { active, completed } = e.detail;
            const activeList = $("activeQuestsList");
            const completedList = $("completedQuestsList");
            activeList.innerHTML = "";
            completedList.innerHTML = "";

            const renderQuest = (q, container) => {
                ui.html({
                    parent: container,
                    style: { background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "10px", borderLeft: "5px solid #FFD700" },
                    children: [
                        { tag: "h3", textContent: q.shaym, style: { margin: "0 0 5px 0" } },
                        { textContent: q.objective },
                        { textContent: q.progressDescription ? `${q.progressDescription}: ${q.collected}/${q.totalCollectedObjects}` : "", style: { marginTop: "5px", fontWeight: "bold", color: "#00ff00" } }
                    ]
                });
            };

            if (active) active.forEach(q => renderQuest(q, activeList));
            if (completed) completed.forEach(q => renderQuest(q, completedList));
        }
    }
};
