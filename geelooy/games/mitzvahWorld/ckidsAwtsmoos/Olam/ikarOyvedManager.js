
/**B"H
 * @file ikarOyvedManager.js
 * @description
 * 🕯️ CHAPTER 7: THE GUARDIAN OF THE THREAD 🕯️
 * Updated with completely absolute unyielding error tracking and popups.
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
        // B"H: silent

        this._creationStartTime = Date.now();

        try {
            this.eved = new Worker(workerPath, { type: "module" });

            this.eved.addEventListener("error", m => {
                // B"H: ABSOLUTE VISIBILITY FOR DEV SHATTERING
                console.error("B\"H - 🚨 [WORKER_FATAL]: Thread has stuttered or failed to load!");
                console.error(`Technical Detail: File: ${m.filename}, Line: ${m.lineno}, Col: ${m.colno}`);
                console.error(`Error String: ${m.message}`);

                // Blast an alert so developers never sit blind staring at an endless spinning screen
                alert(`B"H - THE CREATION WORKER HAS FAILED:\n${m.message}\n${m.filename}:${m.lineno}`);

                // Alerting of the potential path/MIME issue
                if (m.message && m.message.includes("MIME")) {
                    console.error("B\"H - ⚠️ PATHING ALERT: The server is likely sending a 404 HTML response for a JS import.");
                }
            });

            this.eved.addEventListener("messageerror", m => {
                console.error("B\"H - 🚨 [DESERIALIZATION_ERROR]: Light lost in transition!", m);
            });
        } catch (e) {
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
        // B"H: silent

    }

    _initStagnationWatch() {
        const check = () => {
            const silence = Date.now() - this._lastResponseTime;
            if (this._vesselIsReady && silence > 25000 && !this._worldLoaded) {
                console.warn(`B"H - 🔍 [WATCHDOG]: Worker is silent for ${Math.floor(silence / 1000)}s. Likely hanging in GLB parsing/Octree.`);
            }
            setTimeout(check, 5000);
        };
        setTimeout(check, 10000);
    }

    _interceptWorkerMessage(event) {
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        const msgType = data.type;

        // Display worker error signals natively
        if (msgType === 'ERROR') {
            console.error(`B"H - 🚨[WORKER POSTMESSAGE EXCEPTION]: ${data.details || data.message}`);
            if (data.isImportError) {
                alert(`B"H - Worker Boot Fatality: A file module returned 404!\nCheck Console network tab.`);
            }
            return;
        }

        if (msgType && msgType !== 'increasedOlamLoading') {
            // B"H: silent

        }

        switch (msgType) {
            case 'vessel_ready':
                // B"H: silent

                this._vesselIsReady = true;
                this._dispatchPawsawch();
                break;
            case 'loadedWorld':
                this._worldLoaded = true;
                // B"H: silent

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
            // B"H: silent

            this.functionsToDo.forEach(fn => fn());
            this.functionsToDo = [];
        }
    }
}
