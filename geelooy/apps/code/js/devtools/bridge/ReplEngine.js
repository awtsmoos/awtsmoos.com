
// B"H
/**
 * @file ReplEngine.js
 * @brief THE MIND OF THE BRIDGE (DA'AT).
 * 
 * POEM OF THE RETRIEVED THOUGHT:
 * A thought is a spark, a word is a breath,
 * Preserved now from silence, preserved from its death.
 * We cast out the question, we give it a name,
 * To find the true answer within the deep frame.
 * Each evaluation a deed in the soul,
 * Bounded by order and under control!
 */

/**
 * @class ReplEngine
 * @description Manages the asynchronous pairing of code evaluation requests and responses.
 */
export const ReplEngine = {
    /** @private {Map} _pending */
    _pending: new Map(),

    /**
     * B"H - Initiates a request for logical manifestation within the sandbox.
     * @param {string|number} tabId - Target vision coordinate.
     * @param {string} code - The code to be evaluated.
     * @param {Function} [onResult] - Callback for the returned light.
     */
    evaluate(tabId, code, onResult) {
        const reqId = "repl_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
        
        console.log(`%cB"H [ReplEngine] - Casting Spark [${reqId}] to Vision [${tabId}]`, "color: #ffae57; font-weight: bold;");

        if (onResult && typeof onResult === 'function') {
            this._pending.set(reqId, onResult);
        }

        // Bridge import to navigate around circular dimensions
        import('../bridge.js').then(m => {
            if (m.DevToolsBridge && m.DevToolsBridge.transmitEvalRequest) {
                m.DevToolsBridge.transmitEvalRequest(tabId, code, reqId);
            } else {
                console.error("[ReplEngine] B\"H - Master Bridge unreachable.");
            }
        });
    },

    /**
     * B"H - Catching the return signal from the sandbox.
     * @param {Object} payload - { id, result, isError }
     */
    handleResponse(payload) {
        const { id, result, isError } = payload;
        
        console.log(`%cB"H [ReplEngine] - Echo captured for Spark [${id}].`, "color: #a8ff00;");

        const resolver = this._pending.get(id);
        if (resolver) {
            try {
                resolver(result, isError);
            } catch(e) {
                console.error("[ReplEngine] B\"H - Callback Shevirah:", e);
            }
            this._pending.delete(id);
        }
    }
};
