
// B"H
/**
 * @file hud.js
 * @description
 * THE MIRROR OF VITALITY — A UI vessel reflecting the player's essence.
 */
export default {
    shaym: "gameHUD",
    className: "game-hud hidden",
    on: {
        updateStats(e, $, ui) {
            const stats = e.detail;
            
            const hpPercent = (stats.hp / stats.maxHp) * 100;
            const hpBar = $("hud-hp-bar");
            if (hpBar) hpBar.style.width = hpPercent + "%";
            
            const hpText = $("hud-hp-text");
            if (hpText) hpText.textContent = `${Math.ceil(stats.hp)} / ${stats.maxHp}`;
            
            const koachPercent = (stats.koach / stats.maxKoach) * 100;
            const kBar = $("hud-koach-bar");
            if (kBar) kBar.style.width = koachPercent + "%";
            
            const xpPercent = stats.xp % 100; 
            const xBar = $("hud-xp-bar");
            if (xBar) xBar.style.width = xpPercent + "%";
            
            const lvlText = $("hud-level-text");
            if (lvlText) lvlText.textContent = `Lvl ${stats.level}`;
        },
        tooltip(e, $, ui) {
            const data = e.detail;
            const tt = $("icon tooltip");
            if (!tt) return;
            if (data.show) {
                tt.classList.remove("hidden");
                tt.textContent = data.text;
                if (data.x !== undefined && data.y !== undefined) {
                    tt.style.left = data.x + "px";
                    tt.style.top = data.y + "px";
                    tt.style.position = "fixed";
                    tt.style.transform = "translate(15px, 15px)";
                } else {
                    tt.style.position = "absolute";
                    tt.style.left = "50%";
                    tt.style.top = "50%";
                    tt.style.transform = "translate(-50%, -50%)";
                }
            } else {
                tt.classList.add("hidden");
            }
        }
    },
    children: [
        {
            className: "hud-bar-container",
            style: { width: "250px" },
            children: [
                { 
                    shaym: "hud-hp-bar", 
                    className: "hud-bar", 
                    style: { background: "linear-gradient(90deg, #ff4757, #ff6b81)" } 
                },
                { 
                    shaym: "hud-hp-text", 
                    className: "hud-text", 
                    textContent: "100 / 100" 
                }
            ]
        },
        {
            className: "hud-bar-container",
            style: { width: "220px", height: "20px" },
            children: [
                { 
                    shaym: "hud-koach-bar", 
                    className: "hud-bar", 
                    style: { background: "linear-gradient(90deg, #2ed573, #7bed9f)" } 
                },
                { 
                    shaym: "hud-koach-text", 
                    className: "hud-text", 
                    style: { fontSize: "12px" }, 
                    textContent: "50 / 50" 
                }
            ]
        },
        {
            style: { display: "flex", alignItems: "center", gap: "10px" },
            children: [
                 { 
                    shaym: "hud-level-text", 
                    style: { color: "#ffd700", fontSize: "20px", textShadow: "0 0 5px #ffaa00" }, 
                    textContent: "Lvl 1" 
                 },
                 {
                    className: "hud-bar-container",
                    style: { width: "150px", height: "15px", borderRadius: "5px" },
                    children: [
                        { 
                            shaym: "hud-xp-bar", 
                            className: "hud-bar", 
                            style: { background: "linear-gradient(90deg, #ffa502, #eccc68)", transition: "width 0.5s" } 
                        }
                    ]
                 }
            ]
        },
        // B"H: The Hidden Label of the Horizon
        { 
            shaym: "minimap label", 
            className: "hidden", 
            style: { position: "absolute", pointerEvents: "none" } 
        }
    ]
};
