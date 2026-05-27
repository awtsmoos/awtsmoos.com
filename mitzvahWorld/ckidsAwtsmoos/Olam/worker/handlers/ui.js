
/**
 * B"H
 * UI Worker Handlers
 * Handles minimap, loading screens, and specific UI events.
 */
export default function uiHandlers(manager) {
    const { eved, myUi } = manager;

    return {
        hideLoadingScreen() {
            console.log("B\"H - Main Thread: Received hideLoadingScreen command.");
            try {
                const el = myUi.getHtml("loading");
                const hideElement = (element) => {
                    if (element) {
                        element.classList.add("hidden");
                        element.style.display = "none"; // B"H: Force inline hide
                        element.style.opacity = "0";
                        element.style.zIndex = "-1000";
                        console.log("B\"H - Hid element:", element);
                    }
                };

                if (el) {
                    hideElement(el);
                } else {
                    console.warn("B\"H - Loading element 'loading' not found in UI registry. Trying querySelector.");
                    const domEl = document.querySelector(".loading");
                    if (domEl) {
                        hideElement(domEl);
                    } else {
                        console.error("B\"H - Loading element NOT FOUND anywhere.");
                        // B"H: Last ditch attempt - hide by ID if it exists or generic class
                        const genericLoaders = document.querySelectorAll('[class*="loading"]');
                        genericLoaders.forEach(l => hideElement(l));
                    }
                }
                
                // Redundant check via htmlAction to ensure state sync if needed
                myUi.htmlAction({
                    shaym: "loading",
                    methods: { classList: { add: "hidden" } },
                    properties: { style: { display: "none" } }
                });
            } catch(e) {
                console.error("B\"H - Error in hideLoadingScreen handler:", e);
            }
        },

        resetPercentage() {
            myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: "0%" } } });
        },

        increasedOlamLoading(data) {
            const { amount, total, action, reset, subAction } = data || {};
            let t = total;
            if(reset) t = amount;
            myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: t+"%" } } });
            myUi.htmlAction({ shaym: "sub action loading", properties: { innerHTML: subAction || "" } });
            myUi.htmlAction({ shaym: "action loading", properties: { innerHTML: action } });
        },

        updateProgress(data) {},

        sendUiEvent(data) {
            const { shaym, ob, id } = data || {};
            try {
                if(shaym) {
                    myUi.peula(shaym, ob, id);
                }
            } catch(e) {
                console.error("Error in sendUiEvent:", e);
            }
            if(id) eved.postMessage({ uiEvented: { id } });
        },
        
        uiEvented(ob) {
            // Ensure ob is not null to avoid reading property of undefined
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

            const mapCanvas = myUi.html({ parent: "raw map", tag: "canvas", shaym: "canvasMap", className: "filled" });
            if(mapCanvas) {
                const off = mapCanvas.transferControlToOffscreen();
                eved.postMessage({ gotMapCanvas: { canvas: off, size } }, [off]);
            }
        },

        updateMinimapScroll(data) {
             const { center, minimapCamera, id } = data || {};
             if (!center || !minimapCamera) return;

             const minimapCanvas = myUi.getHtml("canvasMap");
             if (!minimapCanvas) return;
             
             const parentElement = minimapCanvas.parentElement.parentElement;
             const minimapWidth = minimapCanvas.width;
             const minimapHeight = minimapCanvas.height;
             
             const relativePlayerX = (center.x - minimapCamera.position.x + minimapCamera.right) / (minimapCamera.right - minimapCamera.left);
             const relativePlayerZ = (center.z - minimapCamera.position.z + minimapCamera.top) / (minimapCamera.top - minimapCamera.bottom);

             const parentScrollLeft = relativePlayerX * minimapWidth - parentElement.clientWidth / 2;
             const parentScrollTop = relativePlayerZ * minimapHeight - parentElement.clientHeight / 2;
             
             const maxScrollLeft = minimapWidth - parentElement.clientWidth;
             const maxScrollTop = minimapHeight - parentElement.clientHeight;

             if (parentScrollLeft < 0 || parentScrollTop < 0 || parentScrollLeft > maxScrollLeft || parentScrollTop > maxScrollTop) {
                 eved.postMessage({ captureMinimapScene: true });
                 return;
             }

             parentElement.scrollLeft = parentScrollLeft;
             parentElement.scrollTop = parentScrollTop;
             
             eved.postMessage({ scrolledMap: { id } });
        },

        scrolledMap(info) {},
        gotMapCanvas(info) {},
        captureMinimapScene(info) {}
    };
}
