
// B"H
export default {
    shaym: "lavaMenu",
    className: "lava-menu hidden",
    awtsmoosClick: true,
    style: {
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "rgba(30, 10, 0, 0.9)", border: "3px solid #ff4500",
        borderRadius: "15px", padding: "20px",
        display: "flex", flexDirection: "column", gap: "15px",
        color: "white", fontFamily: "Fredoka, sans-serif", zIndex: 5000,
        width: "300px"
    },
    
    currentEntityId: null,

    on: {
        open(e, $, ui) {
            const data = e.detail;
            const menu = $("lavaMenu");
            menu.classList.remove("hidden");
            menu.currentEntityId = data.id;

            const colorInput = menu.querySelector(".lava-color");
            const intensityInput = menu.querySelector(".lava-intensity");
            
            if(colorInput) colorInput.value = data.color || "#ff4500";
            if(intensityInput) intensityInput.value = data.intensity || 1.0;
        }
    },

    children: [
        { 
            tag: "h2", textContent: "Magma Control", 
            style: { margin: 0, textAlign: "center", color: "#ff8800", textShadow: "0 0 10px red" } 
        },
        {
            style: { display: "flex", flexDirection: "column", gap: "5px" },
            children: [
                { textContent: "Color" },
                { 
                    tag: "input", type: "color", className: "lava-color",
                    oninput(e, $, ui) {
                        const menu = $("lavaMenu");
                        ui.peula("ikar", { 
                            olamPeula: { 
                                updateLiveEntity: { 
                                    id: menu.currentEntityId, 
                                    data: { color: e.target.value } 
                                } 
                            } 
                        });
                    }
                }
            ]
        },
        {
            style: { display: "flex", flexDirection: "column", gap: "5px" },
            children: [
                { textContent: "Intensity" },
                { 
                    tag: "input", type: "range", className: "lava-intensity",
                    min: "0", max: "5", step: "0.1",
                    oninput(e, $, ui) {
                        const menu = $("lavaMenu");
                        ui.peula("ikar", { 
                            olamPeula: { 
                                updateLiveEntity: { 
                                    id: menu.currentEntityId, 
                                    data: { intensity: e.target.value } 
                                } 
                            } 
                        });
                    }
                }
            ]
        },
        {
            tag: "button", textContent: "Close",
            style: { 
                marginTop: "10px", padding: "8px", background: "#ff4500", 
                border: "none", color: "white", borderRadius: "5px", cursor: "pointer", fontWeight:"bold" 
            },
            onclick(e, $) { $("lavaMenu").classList.add("hidden"); }
        }
    ]
};
        