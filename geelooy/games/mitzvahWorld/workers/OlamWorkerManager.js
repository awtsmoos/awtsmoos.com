
import SederHishtalshelusNode from '../core/SederHishtalshelusNode.js';
import OlamWorkerErrorInterceptor from './OlamWorkerErrorInterceptor.js';
import VesselPurifier from '../utils/VesselPurifier.js';

/**
 * B"H
 * @file OlamWorkerManager.js
 * 
 * Chapter: The Shattering and the Rectification.
 * Why did the universe freeze? Because the light was poured into the 
 * Olam Worker, and the worker absorbed it all (reaching 100% READY), 
 * but there was no "Returning Light" (Or Chozer). The main thread
 * was never told that the vessels were ready! It was a state of Tohu (Chaos).
 * 
 * We fix this by giving the manager a Divine Callback (`onReadyCallback`),
 * creating a cycle of Tikun (Rectification) that bridges the parallel dimensions.
 */

/**
 * @class OlamWorkerManager
 * @extends SederHishtalshelusNode
 * @description Manages communication, purification, and lifecycle of the Web Worker.
 */
export default class OlamWorkerManager extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {string} workerPath - The URL to the worker module.
     * @param {Function} onReadyCallback - The divine decree to execute when the world is fully formed.
     */
    constructor(workerPath, onReadyCallback) {
        super({ worldName: "Beriya_Creation_Manager" });
        
        console.log(`B"H - ⚡ EXTREME LOG: Initializing Olam Worker Chariot as a MODULE from ${workerPath}`);
        
        this.workerPath = workerPath;
        this.onReadyCallback = onReadyCallback || (() => console.warn(`B"H - ⚠️ No returning light callback provided!`));
        
        // Initialize as a module to prevent syntax errors and allow pure imports
        this.worker = new Worker(this.workerPath, { type: 'module' });
        
        this.errorInterceptor = new OlamWorkerErrorInterceptor(this.worker);
        this.purifier = new VesselPurifier();
        
        this.setupDivineEars();
    }

    /**
     * @method setupDivineEars
     * @description Listens for the echoes returning from the worker, including the critical READY signal.
     * @returns {void}
     */
    setupDivineEars() {
        this.worker.onmessage = (event) => {
            const divineEcho = event.data;
            if (!divineEcho || !divineEcho.type) return;

            const actionMap = {
                'PROGRESS': () => console.log(`B"H - 🔄 Olam Worker Progressing... ${divineEcho.percent}% - ${divineEcho.message}`),
                'READY': () => {
                    console.log(`B"H - 🟢 Olam Worker is ready to receive infinite emanations! The vessels are intact!`);
                    // RECTIFICATION: We now call back to the main thread to unfreeze reality!
                    this.onReadyCallback();
                },
                'ERROR': () => console.error(`B"H - 🚨 Olam Worker Internal Torment: ${divineEcho.message}`)
            };

            const actionHandler = actionMap[divineEcho.type] || (() => console.log(`B"H - 📥 Unmapped Worker Echo:`, divineEcho));
            actionHandler();
        };
    }

    /**
     * @method dispatchCreationPayload
     * @description Purifies and safely dispatches the payload to the worker without freezing the UI.
     * @param {Object} rawUserInfo - User state.
     * @param {Object} rawSystemInfo - System state.
     * @param {Object} rawWorldDayuh - The massive world data matrix.
     * @returns {void}
     */
    dispatchCreationPayload(rawUserInfo, rawSystemInfo, rawWorldDayuh) {
        console.log(`B"H - 📦 Preparing to dispatch Creation Payload. Commencing Purification...`);

        // Purify the vessels (STRIP DOM NODES AND FUNCTIONS)
        const pureUserInfo = this.purifier.purifyPayload(rawUserInfo);
        const pureSystemInfo = this.purifier.purifyPayload(rawSystemInfo);
        const pureWorldDayuh = this.purifier.purifyPayload(rawWorldDayuh);

        console.log(`B"H - ✨ Purification Complete. Emitting to Olam Worker in phases...`);

        try {
            // Phase 1: Configuration (Keter/Crown)
            this.worker.postMessage({
                action: 'INIT_CONFIG',
                payload: { userInfo: pureUserInfo, systemInfo: pureSystemInfo }
            });

            // Phase 2: The World Form (Chokhmah/Wisdom)
            this.worker.postMessage({
                action: 'LOAD_WORLD_DATA',
                payload: pureWorldDayuh
            });

        } catch (postError) {
            console.error(`B"H - 🚨 CRITICAL EMANATION FAILURE! Data remains too dense despite purification.`, postError);
        }
    }
}
