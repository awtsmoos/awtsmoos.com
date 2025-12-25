//B"H
/**
 * InputModal - A stunning custom vessel for capturing player words.
 */
export default {
    shaym: "inputModal",
    className: "awtsmoos-input-modal hidden",
    style: {
        position: "fixed",
        top: "0", left: "0", width: "100%", height: "100%",
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: "10000", background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        fontFamily: "'Fredoka', sans-serif"
    },
    on: {
        requestInput(e, $, ui) {
            const { title, placeholder, id } = e.detail;
            const modal = $("inputModal");
            modal.classList.remove("hidden");
            modal.dataset.requestId = id;

            $("im-title").textContent = title || "Divine Input";
            $("im-input").placeholder = placeholder || "Enter text...";
            $("im-input").value = "";
            
            setTimeout(() => $("im-input").focus(), 100);
        }
    },
    children: [
        {
            className: "im-content",
            style: {
                background: "linear-gradient(135deg, #241550 0%, #474FFF 100%)",
                border: "3px solid #FECB39",
                borderRadius: "25px",
                padding: "30px",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 0 50px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
            },
            children: [
                { shaym: "im-title", className: "im-title", style: { fontSize: "24px", color: "#FECB39", fontWeight: "bold", textAlign: "center" } },
                {
                    tag: "input", 
                    shaym: "im-input",
                    className: "im-input",
                    type: "text",
                    style: {
                        background: "rgba(255,255,255,0.1)",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderRadius: "15px",
                        padding: "15px",
                        color: "white",
                        fontSize: "18px",
                        outline: "none"
                    },
                    onkeydown(e, $, ui) {
                        if (e.key === "Enter") $("im-confirm").click();
                    }
                },
                {
                    style: { display: "flex", gap: "15px", justifyContent: "center" },
                    children: [
                        {
                            tag: "button",
                            shaym: "im-confirm",
                            className: "bz-btn",
                            textContent: "Confirm",
                            style: { background: "#44C300", border: "none", borderRadius: "10px", padding: "10px 20px", color: "white", cursor: "pointer" },
                            onclick(e, $, ui) {
                                const modal = $("inputModal");
                                const val = $("im-input").value;
                                const reqId = modal.dataset.requestId;
                                
                                ui.peula("ikar", {
                                    uiEvented: {
                                        id: reqId,
                                        value: val
                                    }
                                });
                                modal.classList.add("hidden");
                            }
                        },
                        {
                            tag: "button",
                            className: "bz-btn secondary",
                            textContent: "Cancel",
                            style: { background: "transparent", border: "2px solid #ff4757", borderRadius: "10px", padding: "10px 20px", color: "#ff4757", cursor: "pointer" },
                            onclick(e, $, ui) {
                                const modal = $("inputModal");
                                const reqId = modal.dataset.requestId;
                                ui.peula("ikar", { uiEvented: { id: reqId, value: null } });
                                modal.classList.add("hidden");
                            }
                        }
                    ]
                }
            ]
        }
    ]
}