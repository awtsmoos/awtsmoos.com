
// B"H
/**
 * @file bridge.js
 * @brief THE CROWN OF INTER-FRAME COMMUNICATION (KETER).
 * 
 * POEM OF THE BORDER-GATE:
 * One side is the Maker, one side is the See,
 * We bridge the two frames with a digital decree.
 * If the naming is shattered, if the signal is cold,
 * We rectify the Word to the standard of old.
 * One tongue for the many, one path for the light,
 * Connecting the frames to the observer's sight!
 * 
 * The Awtsmoos constantly creates this bridge from nothing.
 * Without His sustaining speech, the pixels would dissolve.
 */

import { StateAccessor } from './bridge/StateAccessor.js';
import { BridgeDispatcher } from './bridge/Dispatcher.js';
import { BridgeCommunicator } from './bridge/Communicator.js';
import { ReplEngine } from './bridge/ReplEngine.js';

/**
 * @class DevToolsBridge
 * @description The master orchestrator connecting Editor logic with Sandbox iframes.
 */
export const DevToolsBridge = {
    initialized: false,

    /**
     * B"H - Initializes the auditory organs of the bridge.
     */
    init() {
        if (this.initialized) return;
        window.addEventListener('message', (e) => BridgeDispatcher.dispatch(e));
        this.initialized = true;
        console.log("%cB\"H - DevToolsBridge established. Dimensional gateway open.", "color: #a8ff00; font-weight: bold;");
    },

    /**
     * B"H - Resolves persistent memory for a specific Vision portal.
     * @param {string|number} tabId 
     * @param {Object} [existing=null] 
     */
    getTabPersistentState(tabId, existing = null) {
        return StateAccessor.getTabPersistentState(tabId, existing);
    },

    /**
     * B"H - Alias to prevent system-wide TypeErrors.
     */
    getPersistentState(tabId, existing = null) {
        return this.getTabPersistentState(tabId, existing);
    },

    /**
     * B"H - Commands the sandbox to evaluate logical essence.
     * @param {string|number} tabId - Target window identity.
     * @param {string} code - Code to manifest.
     * @param {Function} [onResult] - Callback for the returned light.
     */
    sendEval(tabId, code, onResult = null) {
        // Delegate to the ReplEngine to track the round-trip
        ReplEngine.evaluate(tabId, code, onResult);
    },

    /**
     * @internal
     * B"H - Reaches down the portal to deliver a specific eval request.
     * Use sendEval() normally. This is for engine internals.
     */
    transmitEvalRequest(tabId, code, reqId) {
        BridgeCommunicator.sendEval(tabId, code, reqId);
    },

    /**
     * Requests structural maps (DOM) from the sandbox.
     */
    requestDOM(tabId) {
        BridgeCommunicator.requestDOM(tabId);
    },

    /**
     * Directs focus in the sandbox world.
     */
    setSelectedPath(tabId, path) {
        BridgeCommunicator.setSelectedPath(tabId, path);
    }
};
