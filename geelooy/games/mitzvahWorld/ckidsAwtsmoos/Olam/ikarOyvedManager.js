
/**
 * B"H
 * The OlamWorkerManager class (Refactored & Robust)
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
    
    constructor(workerPath, options={}, canvasElement, ui) {
        this.eved = new Worker(workerPath, { type: "module" });
        this.eved.addEventListener("error", m => console.log("Worker Error:", m));
        
        this.myUi = ui || new UI();
        window.ui = this.myUi;
        this.canvasElement = canvasElement;
        this.customTawfeekeem = options;

        // Setup Modular Logic
        setupMessageHandler(this);
        setupDomEvents(this);

        this.eved.onmessage = e => this.handleMessageEvent(e);

        console.log("B\"H - Olam Worker Manager Started");
        this.postMessage({ pawsawch: true });
        this.opened = true;
        this.processQueue();
    }

    postMessage(data) {
        let dayuh = data;
        if (dayuh && typeof dayuh === "object") {
            dayuh = Utils.stringifyFunctions(data);
        }
        if (!this.opened) {
            this.functionsToDo.push(() => this.eved.postMessage(dayuh));
        } else {
            this.eved.postMessage(dayuh);
        }
    }

    processQueue() {
        this.functionsToDo.forEach(fn => fn());
        this.functionsToDo = [];
    }
}
