
/**
 * @file ikarOyvedManager.js
 * @description
 * 🕯️ CHAPTER 7: THE GUARDIAN OF THE THREAD 🕯️
 * Updated with resilient error reporting.
 */

import Utils from "../utils.js";
import UI from "/scripts/awtsmoos/ui/index.js";
import setupDomEvents from "./worker/domEvents.js";
import setupMessageHandler from "./worker/messageHandler.js";

export default class OlamWorkerManager {
    eved;
    customTawfeekeem = {};
    opened = false;
    functionsToDo = [];
    _vesselIsReady = false;
    _pawsawchDispatched = false;
    _creationStartTime = Date.now();
    _lastResponseTime = Date.now();

    constructor(workerPath, options = {}, canvasElement, ui) {
        console.log(`B"H - 🏗️ OlamWorkerManager: awakening with path [${workerPath}]`);
        this._creationStartTime = Date.now();

        try {
            this.eved = new Worker(workerPath, { type: "module" });

            this.eved.addEventListener("error", m => {
                // Resilient Error Logging
                console.error("B\"H - 🚨 [WORKER_FATAL]: Thread has stuttered or failed to load!");
                console.error("Technical Detail:", m);
                
                // Alerting of the potential path/MIME issue mentioned by the user
                if (m.message && m.message.includes("MIME")) {
                    console.error("B\"H - ⚠️ PATHING ALERT: The server is likely sending a 404 JSON for a JS import.");
                }
            });

            this.eved.addEventListener("messageerror", m => {
                console.error("B\"H - 🚨 [DESERIALIZATION_ERROR]: Light lost in transition!", m);
            });
        } catch(e) {
            console.error("B\"H - 🚨 [WORKER_CREATION_FAILED]:", e);
        }

        this.myUi = ui || new UI();
        window.ui = this.myUi;
        this.canvasElement = canvasElement;
        this.customTawfeekeem = options;

        setupMessageHandler(this);
        setupDomEvents(this);

        if (this.eved) {
            this.eved.onmessage = (e) => {
                this._lastResponseTime = Date.now();
                this._interceptWorkerMessage(e);
                this.handleMessageEvent(e);
            };
        }

        this._initStagnationWatch();
        console.log("B\"H - ⏳ [MANAGER]: Thread summoned. Awaiting 'vessel_ready'.");
    }

    _initStagnationWatch() {
        const check = () => {
            const silence = Date.now() - this._lastResponseTime;
            if (this._vesselIsReady && silence > 25000 && !this._worldLoaded) {
                 console.warn(`B"H - 🔍 [WATCHDOG]: Worker is silent for ${Math.floor(silence/1000)}s. Likely hanging in GLB parsing/Octree.`);
            }
            setTimeout(check, 5000);
        };
        setTimeout(check, 10000);
    }

    _interceptWorkerMessage(event) {
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        const msgType = data.type;

        if (msgType && msgType !== 'increasedOlamLoading') {
            console.log(`B"H - 📨 [WORKER→MAIN]: type="${msgType}"`, data);
        }

        switch (msgType) {
            case 'vessel_ready':
                console.log("B\"H - 🎉 [VESSEL_READY]: Worker core is established.");
                this._vesselIsReady = true;
                this._dispatchPawsawch();
                break;
            case 'loadedWorld':
                this._worldLoaded = true;
                console.log("B\"H - 🌍 [WORLD_LOADED]: The vessels are ready for emanation.");
                break;
        }
    }

    async _dispatchPawsawch() {
        if (this._pawsawchDispatched) return;
        this._pawsawchDispatched = true;
        this.opened = true;
        this.processQueue();
        if (typeof this.customTawfeekeem.pawsawch === 'function') {
            await this.customTawfeekeem.pawsawch();
        }
    }

    postMessage(data, transfer = []) {
        if (!this.eved) return;
        let dayuh = data;
        if (dayuh && typeof dayuh === "object") {
            dayuh = Utils.stringifyFunctions(data);
        }

        if (!this.opened) {
            this.functionsToDo.push(() => {
                this.eved.postMessage(dayuh, transfer.length > 0 ? transfer : undefined);
            });
        } else {
            this.eved.postMessage(dayuh, transfer.length > 0 ? transfer : undefined);
        }
    }

    processQueue() {
        if (this.functionsToDo.length > 0) {
            console.log(`B"H - 📤 [QUEUE]: Executing ${this.functionsToDo.length} stored decrees.`);
            this.functionsToDo.forEach(fn => fn());
            this.functionsToDo = [];
        }
    }
}
