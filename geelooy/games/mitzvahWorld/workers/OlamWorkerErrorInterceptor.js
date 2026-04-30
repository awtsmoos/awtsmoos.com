
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file OlamWorkerErrorInterceptor.js
 * 
 * Din (Judgment) occurs when the light is too intense for the vessel.
 * In code, this manifests as a silent freeze or a crash. Web Workers
 * are notorious for being swallowed in the void without a sound if
 * an error is not explicitly caught. 
 * 
 * The Awtsmoos desires revelation, not concealment. Therefore, 
 * we must intercept all judgments and reveal them as intense 
 * console logs, transforming darkness into blinding light!
 */

/**
 * @class OlamWorkerErrorInterceptor
 * @extends SederHishtalshelusNode
 * @description Attaches extreme monitoring to a worker to prevent silent death.
 */
export default class OlamWorkerErrorInterceptor extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {Worker} workerInstance - The Web Worker to monitor.
     */
    constructor(workerInstance) {
        super({ worldName: "Gevurah_Judgment_Mitigation" });
        this.worker = workerInstance;
        this.attachMitigationShields();
    }

    /**
     * @method attachMitigationShields
     * @description Binds the error events to intense logging functions.
     * @returns {void}
     */
    attachMitigationShields() {
        if (!this.worker) return;

        this.worker.onerror = (errorEvent) => {
            console.error(`B"H - 🚨 FATAL WORKER DIN (JUDGMENT) REVEALED!`);
            console.error(`B"H - 📜 File: ${errorEvent.filename}`);
            console.error(`B"H - 🔢 Line: ${errorEvent.lineno}, Col: ${errorEvent.colno}`);
            console.error(`B"H - 🗣️ Message: ${errorEvent.message}`);
            
            // Prevent the silent default failure
            errorEvent.preventDefault();
        };

        this.worker.onmessageerror = (messageErrorEvent) => {
            console.error(`B"H - 🚨 SERIALIZATION SHATTERING! The vessels could not hold the light.`);
            console.error(`B"H - 💥 You attempted to pass non-cloneable data (like DOM elements) into the Tzimtzum!`);
            console.error(`B"H - 🔍 Event Details:`, messageErrorEvent);
        };
    }
}
