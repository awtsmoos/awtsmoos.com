// B"H
/**
 * @module SkillBar
 * @description THE GEVURAH BAR — Premium Action Hub
 */

const SkillBar = {
    shaym: "skill bar",
    id: "skillBar",
    className: "awtsmoosSkillBar",
    awtsmoosClick: true,
    style: {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 15px",
        background: "linear-gradient(180deg, rgba(30, 30, 60, 0.4) 0%, rgba(10, 10, 30, 0.8) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 215, 0, 0.15)",
        borderTop: "2px solid rgba(255, 215, 0, 0.4)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
        pointerEvents: "auto",
        zIndex: 1000,
        transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    },
    slots: [null, null, null, null, null],

    on: {
        async ready(el, $, ui) {
            window.addEventListener("keydown", (e) => {
                if (e.key >= "1" && e.key <= "5") {
                    const idx = parseInt(e.key) - 1;
                    if (this.slots[idx]) {
                        ui.peula("ikar", { olamPeula: { castSkill: { skillId: this.slots[idx].id } } });
                    }
                }
            });
            window.addEventListener("keydown", (e) => {
                if (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "b") {
                    this.toggleKnowledgeMenu(ui);
                }
            });
        },

        async updateSkills(e, $, ui) {
            const learnedSkills = e.detail || [];
            const container = document.getElementById("skillBar");
            if (!container) return;
            
            container.innerHTML = ""; 

            // ═══ BOOK TOGGLE BUTTON ═══
            const bookBtn = document.createElement("div");
            bookBtn.className = "skillSlot bookBtn";
            bookBtn.style.cssText = `
                width: 48px; height: 48px;
                background: radial-gradient(circle at center, #5d4037 0%, #3e2723 100%);
                border: 1px solid var(--mitzvah-gold, #ffd700);
                border-radius: 50%; display: flex; justify-content: center; align-items: center;
                cursor: pointer; fontSize: 24px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                transition: transform 0.2s ease;
            `;
            bookBtn.textContent = "📖";
            bookBtn.onmouseover = () => bookBtn.style.transform = "scale(1.1) rotate(-5deg)";
            bookBtn.onmouseout = () => bookBtn.style.transform = "scale(1)";
            bookBtn.onclick = () => this.toggleKnowledgeMenu(ui);
            container.appendChild(bookBtn);

            // ═══ ACTION SLOTS 1-5 ═══
            this.slots.forEach((skill, index) => {
                const slot = document.createElement("div");
                slot.className = "skillSlot " + (skill ? "occupied" : "empty");
                slot.style.cssText = `
                    width: 54px; height: 54px;
                    background: ${skill ? 'radial-gradient(circle at center, #2a2a4e, #1a1a3e)' : 'rgba(255,255,255,0.03)'};
                    border: 1px solid ${skill ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'};
                    border-radius: 12px; display: flex; justify-content: center; align-items: center;
                    cursor: pointer; fontSize: 32px; position: relative; transition: all 0.2s ease;
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.4);
                `;

                if (skill) {
                    slot.textContent = skill.icon;
                    slot.onmouseover = () => {
                        slot.style.transform = "translateY(-5px) scale(1.05)";
                        slot.style.borderColor = "var(--mitzvah-gold, #ffd700)";
                    };
                    slot.onmouseout = () => {
                        slot.style.transform = "translateY(0) scale(1)";
                        slot.style.borderColor = "rgba(255,215,0,0.3)";
                    };
                    slot.onclick = () => ui.peula("ikar", { olamPeula: { castSkill: { skillId: skill.id } } });
                }

                // Label
                const label = document.createElement("div");
                label.textContent = index + 1;
                label.style.cssText = `
                    position: absolute; top: -5px; left: -5px;
                    background: #111; color: var(--mitzvah-gold, #ffd700);
                    font-size: 10px; font-weight: 900; width: 18px; height: 18px;
                    display: flex; justify-content: center; align-items: center;
                    border-radius: 4px; border: 1px solid rgba(255,215,0,0.4);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                `;
                slot.appendChild(label);
                container.appendChild(slot);
            });
        }
    },

    toggleKnowledgeMenu(ui) {
        const menu = document.getElementById("knowledgeMenu");
        if (menu) {
            menu.classList.toggle("hidden");
            if (!menu.classList.contains("hidden")) {
                ui.peula("ikar", { olamPeula: "refreshKnowledge" });
            }
        }
    }
};

export default SkillBar;

