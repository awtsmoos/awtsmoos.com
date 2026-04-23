
// B"H
/**
 * @file LoopErrorHandler.js
 * @brief Shields the Vibe Loop from completely shattering when a single file fails.
 */

import { UI } from '../../ui.js';

export const LoopErrorHandler = {
    handle(err, displayPath, taskId, onProgress, changeObj) {
        if (err.message && err.message.includes('MobileGuard_Blocked')) {
            UI.showToast(`Mobile Blocked: ${displayPath}`, "warning");
            if (onProgress) onProgress(changeObj, false);
        } else {
            UI.showToast(`Blocked: ${displayPath}`, "error");
            if (onProgress) onProgress(changeObj, false);
            console.error(`[VibeLoop] Error applying to ${displayPath}:`, err);
        }
    }
};
