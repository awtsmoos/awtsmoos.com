
/**
 * @file messageHandler.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 4: THE FILTERING OF ECHOES — CHANNELS OF SPEECH              ║
 * ║                                                                          ║
 * ║  "My word shall not return to Me void..." (Yeshayahu 55:11)             ║
 * ║                                                                          ║
 * ║  Every message the Worker sends upward (to the Main Thread)             ║
 * ║  passes through this orchestrator. It maintains a promise registry      ║
 * ║  for request-response cycles and routes messages to their handlers.     ║
 * ║                                                                          ║
 * ║  This module handles BOTH protocols:                                     ║
 * ║  1. Modern: { type: 'vessel_ready', ... }  (type-keyed)                ║
 * ║  2. Legacy: { someActionName: payload }    (direct-key)                 ║
 * ║                                                                          ║
 * ║  NOTE: ikarOyvedManager.js handles `vessel_ready` and                   ║
 * ║  `pawsawch_digested` via its own `_interceptWorkerMessage` method       ║
 * ║  BEFORE this handler runs. This file handles everything else.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @module SetupMessageHandler
 */

import coreHandlers from "./handlers/core.js";
import htmlHandlers from "./handlers/html.js";
import uiHandlers from "./handlers/ui.js";
import worldHandlers from "./handlers/world.js";
import inputHandlers from "./handlers/input.js";

/**
 * @function setupMessageHandler
 * @description
 * Wires the handleMessageEvent function onto the manager.
 * Aggregates all modular handlers into a single dispatcher map.
 *
 * @param {OlamWorkerManager} manager - The manager instance to augment
 */
export default function setupMessageHandler(manager) {
    const promiseMap = new Map();

    /**
     * @function registerPromise
     * @description
     * Registers a pending Promise that will be resolved when
     * the worker sends back a message with a matching ID.
     *
     * @param {string} id - The unique promise ID
     * @returns {Promise<*>}
     */
    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }

    manager.promiseMap = promiseMap;
    manager.registerPromise = registerPromise;

    // B"H: silent


    // Aggregate all modular handlers
    const dispatcher = {
        ...coreHandlers(manager),
        ...htmlHandlers(manager),
        ...uiHandlers(manager),
        ...worldHandlers(manager),
        ...inputHandlers(manager)
    };

    // B"H: silent


    manager.tawfeekim = dispatcher;

    /**
     * @function handleMessageEvent
     * @description
     * THE MAIN EAR OF THE MANAGER.
     * Processes every arriving message packet from the Worker.
     * 
     * Routing priority:
     * 1. `type`-keyed protocol: { type: 'someAction', ... }  → dispatcher[type]
     * 2. Direct-key protocol: { someAction: payload }       → dispatcher[someAction]
     * 3. Promise resolution: if payload has an `id`, resolve the matching promise
     *
     * @param {MessageEvent} event - The incoming message event
     */
    manager.handleMessageEvent = async (event) => {
        const data = event.data;
        if (typeof data !== 'object' || data === null) return;

        // B"H: Handle type-keyed modern protocol first
        if (data.type && typeof data.type === 'string') {
            const task = dispatcher[data.type];
            if (data.type && data.type !== 'increasedOlamLoading') {
                // B"H: silent

            }
            if (typeof task === 'function') {
                try {
                    const result = await task.call(dispatcher, data.payload || data);
                    const finalResponse = (result !== undefined && result !== null) ? result : {};
                    if (finalResponse && finalResponse.id) {
                        const responseKey = data.type + "Response";
                        window.postMessage?.({ [responseKey]: finalResponse });
                    }
                } catch(e) {
                    console.error(`B"H - ⚡ Type-handler [${data.type}] crashed:`, e);
                }
            }
            // After handling type, also check promise resolution
            if (data.id && promiseMap.has(data.id)) {
                const info = promiseMap.get(data.id);
                info.resolve(data);
                promiseMap.delete(data.id);
            }
            return;
        }

        // B"H: Legacy direct-key protocol
        for (const key of Object.keys(data)) {
            const task = dispatcher[key];
            const payload = data[key];

            if (typeof task === 'function') {
                try {
                    const result = await task.call(dispatcher, payload);
                    const finalResponse = (result !== undefined && result !== null) ? result : {};

                    if (payload && payload.id && !finalResponse.id) {
                        finalResponse.id = payload.id;
                    }

                    if (finalResponse.id) {
                        const responseKey = key + "Response";
                        // Route the response back if needed
                        if (typeof manager.postMessage === 'function') {
                            // Not needed here - this is main thread receiving FROM worker
                        }
                    }

                } catch(e) {
                    console.error(`B"H - ⚡ Task [${key}] shattered during processing:`, e);
                }
            }

            // Internal Promise Resolution
            if (payload && payload.id && promiseMap.has(payload.id)) {
                const info = promiseMap.get(payload.id);
                info.resolve(payload);
                promiseMap.delete(payload.id);
            }
        }
    };

    // B"H: silent

}
