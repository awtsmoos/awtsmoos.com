//B"H
/**
 * UI Worker Handlers - Relaying spiritual commands to the physical UI.
 * Refined for smoother radial loading updates and robust error modal management.
 */
export default function uiHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        /**
         * hideLoadingScreen - Dissolves the veil of the loading screen.
         */
        hideLoadingScreen() {
            try {
                myUi.htmlAction({
                    shaym: "loading",
                    methods: { classList: { add: "hidden" } },
                    properties: { style: { display: "none", opacity: "0" } }
                });
            } catch(e) {
                console.error("B\"H - Error in hideLoadingScreen:", e);
            }
        },

        resetPercentage() {
            this.increasedOlamLoading({ amount: 0, reset: true });
        },

        /**
         * increasedOlamLoading - Manifests the descent of light into the radial vessel.
         */
        increasedOlamLoading(data) {
            const { amount, total, action, reset, subAction, error } = data || {};
            
            // 1. ERROR MANIFESTATION
            if (error) {
                myUi.htmlAction({
                    shaym: "loading-error-modal",
                    methods: { classList: { remove: "hidden" } }
                });
                myUi.htmlAction({ shaym: "error-title", properties: { textContent: error.title || "Forge Shattered" } });
                myUi.htmlAction({ shaym: "error-message", properties: { textContent: error.message || "An imperfection was found." } });
                myUi.htmlAction({ shaym: "error-details", properties: { textContent: error.details || "" } });
                return;
            }

            let t = total;
            if(reset) t = amount;
            
            // 2. RADIAL GRADIENT UPDATE
            const percent = Math.min(100, Math.max(0, t));
            
            myUi.htmlAction({ 
                shaym: "radial-progress", 
                properties: { 
                    style: { 
                        // Conic gradient reflects the unified descent of assets
                        background: `conic-gradient(#00f3ff ${percent}%, #bc13fe ${percent}%, rgba(255,255,255,0.1) ${percent}%)` 
                    } 
                } 
            });
            
            myUi.htmlAction({ 
                shaym: "loading-percent-text", 
                properties: { textContent: Math.round(percent) + "%" } 
            });

            // 3. TEXTUAL ALIGNMENT
            if (subAction) {
                myUi.htmlAction({ shaym: "sub action loading", properties: { textContent: subAction } });
            }
            
            if (action) {
                myUi.htmlAction({ shaym: "action loading", properties: { textContent: action } });
            }
        },

        sendUiEvent(data) {
            const { shaym, ob, id } = data || {};
            try {
                if (shaym && myUi) {
                    if (ob && ob.requestInput) {
                        ob.requestInput.id = id; 
                        myUi.peula(shaym, { requestInput: ob.requestInput });
                    } else {
                        myUi.peula(shaym, ob, id);
                    }
                }
            } catch(e) {
                console.error("Error in sendUiEvent:", e);
                if(id) eved.postMessage({ uiEvented: { id, error: e.toString() } });
            }
        },
        
        uiEvented(ob) {
            if(ob && ob.id) eved.postMessage({ uiEvented: ob });
        },

        startMapSetup() {
            const size = { width: 300, height: 300 };
            const mapParent = myUi.html({
                shaym: "map parent", className: "mapParent", parent: "ikarGameMenu",
                style: { cssText: `width:${size.width}px; height:${size.height}px;` }
            });

            myUi.html({ shaym: "map av", className: "map", parent: mapParent });
            myUi.html({ shaym: "raw map", className: "mapRaw", parent: "map av" });
            
            myUi.html({
                shaym: "map controls", className: "mapControls", parent: mapParent,
                children: [
                    {
                        className: "leftBtns",
                        children: [
                            { tag: "button", className: "button", innerHTML: "-", onclick: (e, $, m) => { e.target.blur(); m.peula(e.target, { "peula": { peulaName: "minimap zoom out", peulaVars: [0.25] } }) } },
                            { tag: "button", className: "button", innerHTML: "+", onclick: (e, $, m) => { e.target.blur(); m.peula($("ikar"), { "peula": { peulaName: "minimap zoom in", peulaVars: [0.25] } }) } }
                        ]
                    },
                    {
                        className: "rightBtns",
                        children: [
                            { tag: "img", width: 50, height: 50, awtsmoosClick: true, className: "fullScreenBtn", onclick: (e, $, m) => { e.target.blur(); m.peula($("ikar"), { "peula": { peulaName: "minimap fullscreen toggle" } }) }, src: "./resources/pictures/fullscreen.svg" }
                        ]
                    }
                ]
            });

            const mapCanvas = myUi.getHtml("canvasMap");
            if(mapCanvas) {
                const off = mapCanvas.transferControlToOffscreen();
                eved.postMessage({ gotMapCanvas: { canvas: off, size } }, [off]);
            }
        }
    };
}
