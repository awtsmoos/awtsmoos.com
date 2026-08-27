
// B"H
/**
 * @file AutoLoopState.js
 * @brief The Master of the Divine Loop and the Keeper of the Threshold.
 */

import { UI } from '../../../ui.js';

export const AutoLoopState = {
    isStopped: false,
    currentLoopCount: 0,
    MAX_LOOPS: 15,

    /**
     * B"H - Prepares the realm for a new cycle.
     */
    reset() {
        this.isStopped = false;
        this.currentLoopCount = 0;
        console.log('[AutoLoopState] B"H - Threshold reset.');
    },

    /**
     * B"H - Increments and validates the loop.
     */
    advance() {
        if (this.isStopped) {
            console.log('[AutoLoopState] B"H - ADVANCE BLOCKED: Stop flag is active.');
            return false;
        }

        this.currentLoopCount++;
        console.log('[AutoLoopState] B"H - Advancing to Layer ' + this.currentLoopCount + '/' + this.MAX_LOOPS);
        
        if (this.currentLoopCount > this.MAX_LOOPS) {
            UI.showToast("B\"H - Loop threshold reached. Pausing emanation.", "warning");
            this.isStopped = true;
            return false;
        }

        return true;
    },

    /**
     * B"H - The absolute decree of cessation. 
     */
    halt() {
        this.isStopped = true;
        console.log('%cB"H [AutoLoopState] !!! HALT DECREE ISSUED BY MASTER !!!', "color: #f75d65; font-weight: bold; font-size: 1.2em;");
        UI.showToast("B\"H - Autonomous loop successfully halted.", "info");
    }
};
