
/**
 * B"H
 * @file olamWorker.js
 * 
 * The innermost sanctuary. The Worker Thread. 
 * This thread exists in parallel to the Main Thread, just as 
 * the spiritual realms exist in parallel to the physical, 
 * constantly refreshed by the 10 statements of creation.
 * 
 * It listens, it processes, and it never blocks the UI.
 * Completely surrendered to the Action Map logic.
 */

import { OlamWorkerActionMap } from './OlamWorkerActionMap.js';

console.log(`B"H - 👷‍♂️ OLAM WORKER SCRIPT AWAKENED FROM NOTHINGNESS AT ${Date.now()}`);

/**
 * If the worker shatters internally, it must cry out to the void.
 */
self.onerror = function(message, source, lineno, colno, error) {
    const errorMsg = `B"H - 🚨 WORKER INTERNAL CRASH: ${message} at ${source}:${lineno}`;
    console.error(errorMsg);
    self.postMessage({ type: 'ERROR', message: errorMsg });
};

/**
 * The ear of the worker, listening for the divine decrees from the Main Thread.
 */
self.onmessage = (event) => {
    const rawEmanation = event.data;
    
    if (!rawEmanation || !rawEmanation.action) {
        console.warn(`B"H - 👷‍♂️ WORKER received formless void (no action provided).`, rawEmanation);
        return;
    }

    const { action, payload } = rawEmanation;
    console.log(`B"H - 👷‍♂️ WORKER Action Engaged: ${action}`);

    try {
        const actionFunction = OlamWorkerActionMap[action];
        
        if (actionFunction) {
            // Execute the divine mapped function
            actionFunction(payload);
        } else {
            console.warn(`B"H - 👷‍♂️ WORKER: Unknown permutation of letters (Action): ${action}`);
        }
    } catch (internalError) {
        console.error(`B"H - 🚨 WORKER EXECUTION ERROR during ${action}:`, internalError);
        self.postMessage({ type: 'ERROR', message: internalError.message });
    }
};
