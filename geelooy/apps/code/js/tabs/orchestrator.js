
// B"H
/**
 * @file orchestrator.js
 */

import { TabActivationOrchestrator } from './logic/TabActivationOrchestrator.js';
import { VisualFocusEnforcer } from './dom/VisualFocusEnforcer.js';
import { State } from '../state.js';

export const TabOrchestrator = {
    async activate(tabId, forceReload = false) {
        // 1. Synchronously fix the visual aura
        VisualFocusEnforcer.enforce(tabId);
        
        // 2. Perform the dimensional shift
        const result = await TabActivationOrchestrator.execute(tabId, forceReload);

        // 3. Broadcast the realization to the heavens
        const tab = State.tabs.find(t => t.id === Number(tabId));
        window.dispatchEvent(new CustomEvent('awtsmoos-tab-activated', { detail: { tabId, tab } }));

        return result;
    }
};
