// B"H
/**
 * @module ShlichusBook
 * @description THE SEFER HASHALICHUS (MISSION JOURNAL)
 * A beautiful, elaborate interface to track the Chossid's progress in refining the world.
 */

const ShlichusBook = {
    shaym: "shlichusBook",
    id: "shlichusBook",
    className: "awtsmoosShlichusBook hidden",
    awtsmoosClick: true,
    style: {
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px", height: "550px",
        background: "url('awtsmoos://parchmentTexture') center/cover, #f4e4bc",
        border: "10px solid #5d4037",
        borderRadius: "15px",
        padding: "30px",
        zIndex: 2500,
        display: "flex",
        flexDirection: "column",
        color: "#3e2723",
        boxShadow: "0 0 50px rgba(0,0,0,0.5)",
        fontFamily: "'Playfair Display', serif",
        pointerEvents: "auto"
    },
    on: {
        async updateShlichus(e, $, ui) {
            const missions = e.detail || [];
            const container = document.getElementById("shlichusContent");
            if (!container) return;

            container.innerHTML = "";

            if (missions.length === 0) {
                container.innerHTML = "<div style='text-align:center; padding:50px; opacity:0.5; font-style:italic;'>No active missions. Seek out the elders of the village.</div>";
                return;
            }

            missions.forEach(mission => {
                const card = document.createElement("div");
                card.style.marginBottom = "25px";
                card.style.padding = "15px";
                card.style.borderBottom = "1px solid rgba(62, 39, 35, 0.2)";
                
                const percent = (mission.currentValue / mission.targetValue) * 100;

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="margin:0; color:#5d4037; font-variant:small-caps;">${mission.title}</h2>
                        <span style="font-size:12px; font-weight:bold; color:${mission.completed ? '#2e7d32' : '#d84315'}">
                            ${mission.completed ? 'COMPLETED' : 'IN PROGRESS'}
                        </span>
                    </div>
                    <p style="font-size:14px; line-height:1.4; font-style:italic; margin:10px 0;">${mission.description}</p>
                    <div style="font-weight:bold; font-size:13px; margin-bottom:5px;">Objective: ${mission.shortObjective}</div>
                    <div style="width:100%; height:8px; background:rgba(0,0,0,0.1); border-radius:4px; overflow:hidden;">
                        <div style="width:${percent}%; height:100%; background:#5d4037; transition:width 0.5s;"></div>
                    </div>
                    <div style="font-size:11px; text-align:right; margin-top:5px;">${mission.currentValue} / ${mission.targetValue}</div>
                `;
                container.appendChild(card);
            });
        }
    },
    children: [
        {
            style: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
            children: [
                { textContent: "📜 SEFER HASHALICHUS", style: { fontSize: "26px", fontWeight: "bold", borderBottom: "2px solid #5d4037" } },
                { 
                    textContent: "✖", 
                    style: { cursor: "pointer", fontSize: "24px" },
                    onclick: (e, $, ui) => {
                        document.getElementById("shlichusBook").classList.add("hidden");
                    }
                }
            ]
        },
        {
            id: "shlichusContent",
            style: { flex: 1, overflowY: "auto" }
        }
    ]
};

export default ShlichusBook;
