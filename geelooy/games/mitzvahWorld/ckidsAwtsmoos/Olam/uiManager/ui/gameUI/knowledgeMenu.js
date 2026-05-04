// B"H
/**
 * @module KnowledgeMenu
 * @description THE SEFER HAMITZVOS (SKILL BOOK)
 * A grand interface to view all learned Torah Passages, categorized by the 4 Worlds.
 * Allows dragging passages into the action bar.
 */

const KnowledgeMenu = {
    shaym: "knowledge menu",
    id: "knowledgeMenu",
    className: "awtsmoosKnowledgeMenu hidden",
    awtsmoosClick: true,
    style: {
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "450px",
        background: "rgba(20, 20, 20, 0.95)",
        border: "3px solid #ffd700",
        borderRadius: "15px",
        padding: "20px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        color: "#fff",
        boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
        pointerEvents: "auto"
    },
    on: {
        /**
         * @method updateKnowledge
         * @description Refreshes the skill list based on learned passages.
         */
        async updateKnowledge(e, $, ui) {
            const learnedSkills = e.detail || [];
            const listContainer = document.getElementById("knowledgeList");
            if (!listContainer) return;

            listContainer.innerHTML = ""; // Refresh

            learnedSkills.forEach(skill => {
                const item = document.createElement("div");
                item.className = "knowledgeItem";
                item.style.display = "flex";
                item.style.alignItems = "center";
                item.style.gap = "15px";
                item.style.padding = "10px";
                item.style.marginBottom = "8px";
                item.style.background = "rgba(255, 255, 255, 0.05)";
                item.style.borderRadius = "8px";
                item.style.cursor = "grab";
                item.draggable = true;

                item.innerHTML = `
                    <div style="font-size: 30px;">${skill.icon}</div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; color: ${skill.color}">${skill.name} (${skill.level.toUpperCase()})</div>
                        <div style="font-size: 12px; color: #ccc;">${skill.description}</div>
                        <div style="font-size: 10px; font-style: italic; color: #888;">"${skill.passage}"</div>
                    </div>
                `;

                // Drag Logic
                item.ondragstart = (event) => {
                    event.dataTransfer.setData("skillId", skill.id);
                    event.dataTransfer.effectAllowed = "copy";
                };

                listContainer.appendChild(item);
            });
        }
    },
    children: [
        {
            style: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
            children: [
                { textContent: "📖 SEFER HAMITZVOS (KNOWLEDGE)", style: { fontSize: "20px", fontWeight: "bold", color: "#ffd700" } },
                { 
                    textContent: "✖", 
                    style: { cursor: "pointer", fontSize: "24px" },
                    onclick: (e, $, ui) => {
                        document.getElementById("knowledgeMenu").classList.add("hidden");
                    }
                }
            ]
        },
        {
            id: "knowledgeList",
            style: { flex: 1, overflowY: "auto", paddingRight: "10px" }
        },
        {
            textContent: "Drag a passage into your Action Bar (1-5) to equip it.",
            style: { fontSize: "12px", color: "#888", marginTop: "10px", textAlign: "center" }
        }
    ]
};

export default KnowledgeMenu;
