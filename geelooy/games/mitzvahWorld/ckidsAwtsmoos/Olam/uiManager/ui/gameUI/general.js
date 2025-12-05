
// B"H
export const Saving = {
    shaym: "Saving",
    className: "hidden menuItm",
    innerHTML: "Saving...",
    on: {
        awtsmoosRevealed(e, $, ui) {
            var ikar = $("ikar");
            if (!ikar) return;
            ikar.dispatchEvent(new CustomEvent("olamPeula",{ detail: { downloadWorld: true } }));
        },
    }
};

export const DragGhost = {
    id: "awtsmoos-drag-ghost",
    className: "slotBtn hidden",
    style: {
        position: "fixed", pointerEvents: "none", zIndex: 9999, 
        width: "60px", height: "60px", transform: "translate(-50%, -50%)", opacity: 0.8
    }
};

export const QuantityModal = {
    shaym: "quantityModal",
    className: "quantity-modal hidden",
    style: {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
        background: "rgba(0,0,0,0.7)", zIndex: 10000, display: "flex",
        justifyContent: "center", alignItems: "center", backdropFilter: "blur(5px)"
    },
    children: [{
        className: "modal-content",
        style: {
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            border: "2px solid #FFD700", borderRadius: "15px", padding: "25px",
            display: "flex", flexDirection: "column", gap: "15px", minWidth: "300px",
            boxShadow: "0 0 30px rgba(255, 215, 0, 0.3)", color: "white", fontFamily: "Fredoka, sans-serif"
        },
        children: [
            { tag: "h3", textContent: "Split Stack", style: { margin: 0, color: "#FFD700", textAlign: "center" } },
            { 
                tag: "input", shaym: "qtyInput", type: "number", min: "1", value: "1",
                style: {
                    background: "rgba(255,255,255,0.1)", border: "1px solid #4cc9f0",
                    padding: "10px", color: "white", borderRadius: "5px", fontSize: "18px", textAlign: "center"
                }
            },
            {
                style: { display: "flex", gap: "10px", justifyContent: "center" },
                children: [
                    { 
                        tag: "button", className: "awtsmoosBtn", textContent: "Confirm", style: { borderColor: "#00ff00", color: "#00ff00" },
                        onclick(e, $, ui) {
                            const qty = parseInt($("qtyInput").value);
                            if (qty > 0 && window.AwtsmoosDragSystem && window.AwtsmoosDragSystem.pendingSplitCallback) {
                                window.AwtsmoosDragSystem.pendingSplitCallback(qty);
                            }
                            $("quantityModal").classList.add("hidden");
                        }
                    },
                    { 
                        tag: "button", className: "awtsmoosBtn", textContent: "Cancel", style: { borderColor: "#ff4757", color: "#ff4757" },
                        onclick(e, $) { $("quantityModal").classList.add("hidden"); window.AwtsmoosDragSystem.pendingSplitCallback = null; }
                    }
                ]
            }
        ]
    }]
};

export const Tooltips = [
    { shaym: "icon tooltip", className: "awtsmoos tooltip hidden" }, 
    {
        shaym: "block selector menu", className: "blockSelected hidden", awtsmoosClick: true,
        on: { awtsmoosOptions(e) { window?.socket?.postMessage?.({ uiEvented: { awtsmoosResponse: { array: Array.from(e.target.children).map(q => q.innerText) }, id: e.detail?._awtsmoosId } }) } },
        children: ["Grab", "Delete"].map( (q, i, a) => ({ shaym: "menu item " + q, innerHTML: q, className: q, on: { awtsmoosHighlight(e) { var par = e.target.parentNode; Array.from(par.children).forEach(w => w.classList.remove("active")); e.target.classList.add("active") } }, onclick: async (e) => { ikar.dispatchEvent(new CustomEvent("olamPeula",{ detail: { activeObjectAction: e.target.innerHTML } })); } }))
    }
];
