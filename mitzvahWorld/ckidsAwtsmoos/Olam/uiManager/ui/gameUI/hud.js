
// B"H
export default {
    shaym: "gameHUD",
    className: "game-hud",
    style: {
        position: "absolute",
        top: "70px", left: "20px", // Moved down
        display: "flex", flexDirection: "column", gap: "8px",
        zIndex: 1000, pointerEvents: "none",
        fontFamily: "'Fredoka One', sans-serif"
    },
    on: {
        updateStats(e, $, ui) {
            const stats = e.detail;
            
            const hpPercent = (stats.hp / stats.maxHp) * 100;
            $("hud-hp-bar").style.width = hpPercent + "%";
            $("hud-hp-text").textContent = `${Math.ceil(stats.hp)} / ${stats.maxHp}`;
            
            const koachPercent = (stats.koach / stats.maxKoach) * 100;
            $("hud-koach-bar").style.width = koachPercent + "%";
            $("hud-koach-text").textContent = `${Math.ceil(stats.koach)} / ${stats.maxKoach}`;
            
            const xpPercent = stats.xp % 100; 
            $("hud-xp-bar").style.width = xpPercent + "%";
            $("hud-level-text").textContent = `Lvl ${stats.level}`;
        }
    },
    children: [
        {
            className: "hud-bar-container",
            style: { width: "250px", height: "25px", background: "rgba(0,0,0,0.6)", borderRadius: "12px", border: "2px solid #555", position: "relative", overflow: "hidden" },
            children: [
                { shaym: "hud-hp-bar", style: { width: "100%", height: "100%", background: "linear-gradient(90deg, #ff4757, #ff6b81)", transition: "width 0.2s" } },
                { shaym: "hud-hp-text", style: { position: "absolute", top: "0", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", textShadow: "1px 1px 2px black" }, textContent: "100 / 100" }
            ]
        },
        {
            className: "hud-bar-container",
            style: { width: "220px", height: "20px", background: "rgba(0,0,0,0.6)", borderRadius: "12px", border: "2px solid #555", position: "relative", overflow: "hidden" },
            children: [
                { shaym: "hud-koach-bar", style: { width: "100%", height: "100%", background: "linear-gradient(90deg, #2ed573, #7bed9f)", transition: "width 0.2s" } },
                { shaym: "hud-koach-text", style: { position: "absolute", top: "0", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", textShadow: "1px 1px 2px black" }, textContent: "50 / 50" }
            ]
        },
        {
            style: { display: "flex", alignItems: "center", gap: "10px" },
            children: [
                 { shaym: "hud-level-text", style: { color: "#ffd700", fontSize: "20px", textShadow: "0 0 5px #ffaa00" }, textContent: "Lvl 1" },
                 {
                    className: "hud-bar-container",
                    style: { width: "150px", height: "100%", background: "rgba(0,0,0,0.6)", borderRadius: "5px", border: "1px solid #777", position: "relative", overflow: "hidden" },
                    children: [
                        { shaym: "hud-xp-bar", style: { width: "0%", height: "100%", background: "linear-gradient(90deg, #ffa502, #eccc68)", transition: "width 0.5s" } }
                    ]
                 }
            ]
        }
    ]
};
