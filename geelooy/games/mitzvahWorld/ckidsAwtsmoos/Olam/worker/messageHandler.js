
/**
 * B"H
 * Worker Message Handler
 */
import Utils from "../../utils.js";

export default function setupMessageHandler(manager) {
    const { eved, myUi } = manager;
    const promiseMap = new Map();
    
    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }
    
    manager.promiseMap = promiseMap;
    manager.registerPromise = registerPromise;

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
        
        error(er) {
            myUi.htmlAction({
                shaym: "awtsmoos error",
                methods: { classList: { remove: "hidden" } },
                properties: { textContent: JSON.stringify(er) }
            });
        },

        takeInCanvas({ canvas, devicePixelRatio }) {},

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

        htmlCreate(info) {
             const parsed = Utils.evalStringifiedFunctions(info || {});
             myUi.html(parsed);
             eved.postMessage({ htmlCreated: { shaym: info.shaym, id: info.id } });
        },
        
        htmlDelete(info) {
            const { shaym, id } = info;
            const result = myUi.deleteHtml(shaym);
            eved.postMessage({ htmlDeleted: { shaym, result, id } });
        },
        
        htmlGet({ shaym, properties = {}, methods = {}, id }) {
            const html = myUi.getHtml(shaym);
            if (!html) return;

            function getProperties(htmlElement, propsObj) {
                const result = {};
                for (const prop in propsObj) {
                    if (propsObj.hasOwnProperty(prop)) {
                        if (typeof propsObj[prop] === 'object' && propsObj[prop] !== null) {
                            result[prop] = getProperties(htmlElement[prop], propsObj[prop]);
                        } else {
                            result[prop] = htmlElement[prop];
                        }
                    }
                }
                return result;
            }

            function executeMethods(htmlElement, methodsObj) {
                const results = {};
                for (const methodName in methodsObj) {
                    if (methodsObj.hasOwnProperty(methodName) && typeof htmlElement[methodName] === 'function') {
                        const args = methodsObj[methodName];
                        results[methodName] = htmlElement[methodName](...args);
                    }
                }
                return results;
            }

            let propertiesGot = getProperties(html, properties);
            let methodsGot = executeMethods(html, methods);

            propertiesGot = Utils.stringifyFunctions(propertiesGot);
            methodsGot = Utils.stringifyFunctions(methodsGot);

            eved.postMessage({ htmlGot: { shaym, propertiesGot, methodsGot, id } });
        },
        
        setHtml({shaym, dayuh}={}) {
             const parsed = Utils.evalStringifiedFunctions(dayuh || {});
             myUi.setHtmlByShaym(shaym, parsed);
             eved.postMessage({ htmlSet: { shaym } });
        },
        
        sendUiEvent({ shaym, ob, id }) {
            try {
                myUi.peula(shaym, ob, id);
            } catch(e) {
                console.error("Error in sendUiEvent:", e);
            }
            // Guard: Only send ACK if ID exists to prevent worker confusion
            if(id) eved.postMessage({ uiEvented: { id } });
        },
        
        uiEvented(ob) {
            // B"H: Safety check - Only forward if valid ID exists
            if(ob && ob.id) eved.postMessage({ uiEvented: ob });
        },
        
        updateProgress(data) {},
        
        getWindowSize(id) {
            const size = { width: innerWidth, height: innerHeight };
            eved.postMessage({ sized: { size, id } });
        },
        
        resetPercentage() {
            myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: "0%" } } });
        },
        
        increasedOlamLoading({ amount, total, action, reset = false, subAction }) {
            if (reset) total = amount;
            myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: total + "%" } } });
            myUi.htmlAction({ shaym: "sub action loading", properties: { innerHTML: subAction || "" } });
            myUi.htmlAction({ shaym: "action loading", properties: { innerHTML: action } });
        },
        
        updateMinimapScroll({ center, minimapCamera, id }) {
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
