
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
        
        // B"H: EXTREME VERBOSE LOGGING FOR WORKER ERRORS
        this.eved.addEventListener("error", (e) => {
            console.group("%c B\"H - CRITICAL WORKER ERROR ", "background: red; color: white; font-size: 14px; padding: 4px;");
            
            console.log("%c Error Message: ", "font-weight: bold; color: #ff5555;", e.message);
            console.log("%c Filename: ", "font-weight: bold;", e.filename);
            console.log("%c Location: ", "font-weight: bold;", `Line ${e.lineno}, Column ${e.colno}`);
            
            if (e.error) {
                console.log("%c Error Object: ", "font-weight: bold;", e.error);
                if (e.error.stack) {
                    console.log("%c Stack Trace: ", "font-weight: bold;", e.error.stack);
                }
            } else {
                console.log("No inner error object available (likely a script loading or syntax error).");
            }

            console.trace("Full Event:", e);
            console.groupEnd();
            
            // Attempt to alert visually in the UI if possible
            try {
                if(this.myUi) {
                    this.myUi.htmlAction({
                        shaym: "awtsmoos error",
                        methods: { classList: { remove: "hidden" } },
                        properties: { 
                            textContent: `Worker Error:\n${e.message}\n\nFile: ${e.filename}\nLine: ${e.lineno}` 
                        }
                    });
                }
            } catch(uiErr) {
                console.error("Failed to show error in UI:", uiErr);
            }
        });

        this.eved.addEventListener("messageerror", (e) => {
            console.error("B\"H - Worker Message Deserialization Error:", e);
        });
        
        this.myUi = ui || new UI();
        window.ui = this.myUi;
        this.canvasElement = canvasElement;
        this.customTawfeekeem = options;

        // Setup Modular Logic
        setupMessageHandler(this);
        setupDomEvents(this);

        this.eved.onmessage = e => this.handleMessageEvent(e);

        console.log("B\"H - Olam Worker Manager Started - Verbose Logging Active");
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
