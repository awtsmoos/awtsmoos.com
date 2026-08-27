
// B"H
/**
 * @file LoopErrorHandler.js
 * @brief The Sentinel of the Fractured Labor.
 * 
 * CHAPTER XXI: THE COMFORT OF THE BROKEN
 * When a letter is written incorrectly, or when the physical world 
 * refuses to hold the spark, a cry (Error) is heard. We must catch 
 * this cry and translate it into a message of clarity.
 */

import { UI } from '../../../ui.js';

export const LoopErrorHandler = {
    /**
     * B"H
     * Interprets and reports an error that occurred during the Vibe solidification.
     * 
     * @param {Error} err - The shattering event.
     * @param {string} displayPath - The target coordinate.
     * @param {string} taskId - The unique task label.
     * @param {Function} onProgress - Feedback hook for the controller.
     * @param {Object} changeObj - The original payload.
     */
    handle(err, displayPath, taskId, onProgress, changeObj) {
        const errMsg = err.message || "";
        const errName = err.name || "";
        const fileName = displayPath.split('/').pop();

        let userFeedback = `Manifestation Shattered: ${fileName}`;
        let toastType = "error";

        // 1. ACCESS BLOCKAGE (The common Mobile/Permission hurdle)
        if (errMsg.includes('MobileGuard_Blocked') || errName === 'NotAllowedError') {
            userFeedback = `OS Refused Entry: ${fileName}. Please grant permission in the Sidebar.`;
            toastType = "warning";
        } 
        // 2. ILLEGAL VESSEL NAME
        else if (errMsg.includes('Name is not allowed') || errName === 'TypeError') {
            userFeedback = `Impure Label: "${fileName}" contains forbidden symbols.`;
            toastType = "error";
            console.error(`B"H [VibeLoop] Rejection due to impure label: ${displayPath}`);
        }
        // 3. GENERIC DISRUPTION
        else {
            console.error(`B"H [VibeLoop] Unknown divergence at ${displayPath}:`, err);
            userFeedback = `Divergence at ${fileName}: ${errMsg.substring(0, 50)}...`;
        }

        UI.showToast(`B"H - ${userFeedback}`, toastType, 6000);
        UI.endTask(taskId, 'error', userFeedback);

        if (onProgress) {
            onProgress(changeObj, false); // Signal failure to the UI cards
        }
    }
};
