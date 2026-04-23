
// B"H
/**
 * @file TabActivationOrchestrator.js
 * @brief THE HIGH PRIEST OF THE SWITCH.
 */

import { State, DOM } from '../../state.js';
import { UI } from '../../ui.js';
import { TabSentinel } from '../sentinel.js';
import { TabRouter } from '../router.js';
import { TabsLoader } from '../loader.js';
import { TabFocusEnforcer } from '../dom/TabFocusEnforcer.js';
import { RealitySentinel } from '../../core/validation/RealitySentinel.js';
import { IntentDiscriminator } from './registry/IntentDiscriminator.js';

export const TabActivationOrchestrator = {
    /**
     * @async
     * @function execute
     * @description Switches the active tab with absolute intent verification.
     */
    async execute(tabId, forceReload = false) {
        const token = TabSentinel.startNewIntent();
        const numId = Number(tabId);

        const tab = State.tabs.find(t => t.id === numId);
        if (!tab) {
            TabFocusEnforcer.enforce(null);
            UI.switchView('empty');
            return;
        }

        // 1. INTENT VERIFICATION
        const currentIntent = IntentDiscriminator.determine(tab.item);
        console.log(`[Activator] B"H - Opening tab ${numId} with intent: ${currentIntent}`);

        // 2. REALITY CHECK: Is the vessel still in its physical location?
        const isReal = await RealitySentinel.verify(tab.item);
        if (!isReal && tab.item.type !== 'vibe-manager' && !tab.isPreview) {
            UI.showToast(`B"H - The vessel ${tab.item.name} has moved or dissolved. Closing.`, "warning");
            import('../index.js').then(m => m.Tabs.close(numId, true));
            return;
        }

        if (TabSentinel.isIntentStale(token)) return;

        // 3. SYNCHRONOUS VISUAL LOCK
        TabFocusEnforcer.enforce(numId);

        try {
            // 4. DOM ROUTING
            const viewID = TabRouter.resolveViewID(tab);
            UI.switchView(viewID);

            if (viewID.includes('vibe')) {
                const { VibeController } = await import('../../vibe/vibe-controller.js');
                await VibeController.render(tab);
            } else if (viewID === 'terminal-wrapper') {
                const { Terminal } = await import('../../terminal/index.js');
                await Terminal.render(tab, DOM.terminalWrapper);
            } else if (viewID === 'file-commander-wrapper') {
                const { FileCommander } = await import('../../file-commander/index.js');
                FileCommander.render(tab, DOM.fileCommanderWrapper);
            } else {
                if (!tab.content || forceReload) {
                    const ok = await TabsLoader.loadTabContent(tab);
                    if (TabSentinel.isIntentStale(token)) return;
                    if (!ok) { UI.switchView('empty'); return; }
                }
                await TabsLoader.renderTabView(tab, forceReload);
            }

            if (TabSentinel.isIntentStale(token)) return;
            tab.forceReload = false;
            
            // Re-render the tab bar to sync visual dots and labels
            import('../index.js').then(m => m.Tabs.render());
            import('../../app.js').then(m => m.App.saveSessionDebounced());

        } catch (err) {
            console.error(`B"H - Shift failed for Tab ${numId}:`, err);
            UI.showToast(`Vision Failure: ${err.message}`, "error");
        }
    }
};
