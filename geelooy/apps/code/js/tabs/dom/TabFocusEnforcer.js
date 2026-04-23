
// B"H
/**
 * @file TabFocusEnforcer.js
 * @brief THE MASTER OF THE SINGULAR FOCUS.
 */

import { TabShieldPurger } from './highlight/TabShieldPurger.js';
import { TabIlluminator } from './highlight/TabIlluminator.js';

export const TabFocusEnforcer = {
    /**
     * @function enforce
     * @description Synchronously rectifies the visual state of the Tab Bar.
     */
    enforce(targetId) {
        // First, darken the world.
        TabShieldPurger.purge();

        // Then, kindle the true flame.
        if (targetId !== null && targetId !== undefined) {
            TabIlluminator.shine(targetId);
        }
    }
};
