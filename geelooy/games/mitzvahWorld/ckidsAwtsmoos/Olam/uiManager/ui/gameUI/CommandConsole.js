
// B"H
/**
 * CommandConsole - A direct interface to the Divine Will of the world.
 */
export default {
    shaym: "commandConsole",
    className: "awtsmoos-console hidden",
    awtsmoosClick: true,
    style: {
        position: "fixed",
        bottom: "0", left: "0", width: "100%",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        borderTop: "2px solid #FECB39",
        padding: "10px 20px",
        zIndex: "6000",
        display: "flex", gap: "10px", alignItems: "center",
        fontFamily: "'Courier New', monospace"
    },
    on: {
        toggle(e, $, ui) {
            const con = $("commandConsole");
            const input = $("console-input");
            const isHidden = con.classList.toggle("hidden");
            if (!isHidden) {
                input.value = "";
                setTimeout(() => input.focus(), 50);
            }
        }
    },
    children: [
        { textContent: "Decree:", style: { color: "#FECB39", fontWeight: "bold" } },
        {
            tag: "input",
            shaym: "console-input",
            placeholder: "Enter sacred command... (e.g. /spawn brick)",
            style: {
                flex: 1, background: "transparent", border: "none",
                color: "#00ffed", fontSize: "18px", outline: "none"
            },
            onkeydown(e, $, ui) {
                if (e.key === "Enter") {
                    const cmd = e.target.value;
                    ui.peula("ikar", { olamPeula: { executeCommand: cmd } });
                    e.target.value = "";
                    $("commandConsole").classList.add("hidden");
                }
                if (e.key === "Escape") $("commandConsole").classList.add("hidden");
            }
        }
    ]
}
