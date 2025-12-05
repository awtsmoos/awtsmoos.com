
/**
 * B"H
 * Worker Message Handler
 */
import Utils from "../../utils.js";

export default function setupMessageHandler(manager) {
    const { eved, myUi, canvasElement } = manager;
    const promiseMap = new Map();

    manager.tawfeekim = {
        async htmlAction(dayuh = {}, noSocket) {
            if (!dayuh || typeof dayuh !== "object") dayuh = {};
            const parsed = Utils.evalStringifiedFunctions(dayuh);
            const { shaym, selector, properties, methods, id } = parsed;

            const ac = myUi.htmlAction({ shaym, selector, properties, methods });

            if (!ac) return null;

            const ps = ac.propertiesSet ? Utils.stringifyFunctions(ac.propertiesSet) : null;
            const mc = ac.methodsCalled ? Utils.stringifyFunctions(ac.methodsCalled) : null;

            const res = {
                htmlActioned: {
                    shaym,
                    methodsCalled: mc,
                    propertiesSet: ps,
                    selector,
                    id
                }
            };

            if (!noSocket) eved.postMessage(res);
            return res;
        },

        htmlActions(dayuh = { ar: [], id: null }) {
            const ar = dayuh.ar;
            const id = dayuh.id;
            const done = [];
            if (Array.isArray(ar)) {
                ar.filter(Boolean).forEach(m => {
                    done.push(manager.tawfeekim.htmlAction(m, true));
                });
            }
            eved.postMessage({ htmlActioned: { ar, done, id } });
        },

        alert(ms) { window.alert(ms + ""); },

        takeInCanvas({ canvas, devicePixelRatio }) {
             // Logic handled in worker, but manager might need to ack
        },

        startMapSetup() {
            const size = { width: 300, height: 300 };
            
            // Create DOM elements for minimap
            const mapParent = myUi.html({
                shaym: "map parent", className: "mapParent", parent: "ikarGameMenu",
                style: { cssText: `width:${size.width}px; height:${size.height}px;` }
            });

            myUi.html({ shaym: "map av", className: "map", parent: mapParent });
            myUi.html({ shaym: "raw map", className: "mapRaw", parent: "map av" });
            
            // Controls
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
            const off = mapCanvas.transferControlToOffscreen();
            
            eved.postMessage({
                gotMapCanvas: { canvas: off, size }
            }, [off]);
        },
        
        downloadWorld(ob) {
            const txt = ob?.text;
            if (!txt) return;

            if (window.curAlias) {
                if (!window.worldName) window.worldName = prompt("Name this world?");
                if (window.worldName) {
                    fetch(`/api/social/aliases/${window.curAlias}/fileSystem/makeFile`, {
                        method: "POST",
                        body: new URLSearchParams({
                            path: "desktop.folder/game data.folder/worlds/" + window.worldName + ".js",
                            value: txt
                        })
                    }).then(r => r.json()).then(d => {
                        alert(d?.success ? "Saved to profile!" : "Failed to save.");
                    });
                }
            } else {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([txt]));
                a.download = "BH_" + Date.now() + ".js";
                a.click();
            }
            myUi.htmlAction({ shaym: "Saving", methods: { classList: { add: "hidden" } } });
        },

        // ... (Port other methods like setHtml, htmlCreate, etc. similarly)
        htmlCreate(info) {
             const parsed = Utils.evalStringifiedFunctions(info || {});
             myUi.html(parsed);
             eved.postMessage({ htmlCreated: { shaym: info.shaym, id: info.id } });
        },
        
        setHtml({shaym, dayuh}={}) {
             const parsed = Utils.evalStringifiedFunctions(dayuh || {});
             myUi.setHtmlByShaym(shaym, parsed);
             eved.postMessage({ htmlSet: { shaym } });
        },
        
        uiEvented(ob) {
            // Ack for UI events
            if(ob.id) eved.postMessage({ uiEvented: ob });
        }
    };

    manager.handleMessageEvent = (event) => {
        const data = event.data;
        if (typeof data === 'object') {
            Object.keys(data).forEach(key => {
                const task = manager.tawfeekim[key];
                const k = data[key];
                if (k && k.error && manager.onerror) manager.onerror(k.error, manager);
                if (typeof task === 'function') task(k);
                if (manager.customTawfeekeem[key]) manager.customTawfeekeem[key](k);
            });
        }
    };
}
