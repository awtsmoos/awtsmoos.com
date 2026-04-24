
// B"H
import { TabActivationOrchestrator } from './logic/TabActivationOrchestrator.js';
import { VisualFocusEnforcer } from './dom/VisualFocusEnforcer.js';

export const TabsNavigation = {
    /**
     * @function forceVisualSync
     * @description Absolute UI conformity. 
     */
    forceVisualSync(targetId) {
        VisualFocusEnforcer.enforce(targetId);
    },

    async activate(tabId, forceReload = false) {
        // Synchronously resolve visual state first to prevent glitching
        this.forceVisualSync(tabId);
        
        // Execute the dimensional shift
        return await TabActivationOrchestrator.execute(tabId, forceReload);
    }
};
