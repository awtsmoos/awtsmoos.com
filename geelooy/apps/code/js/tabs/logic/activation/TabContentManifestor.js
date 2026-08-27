
// B"H
/**
 * @file TabContentManifestor.js
 * @brief Bridges the data into the physical DOM.
 */
import { State, DOM } from '../../../state.js';
import { UI } from '../../../ui.js'; // B"H - Corrected path
import { TabRouter } from '../../router.js';
import { TabsLoader } from '../../loader.js';
import { TabSentinel } from '../../sentinel.js';

/**
 * @class TabContentManifestor
 * @description Responsible for the final stage of activation: engraving the data into the DOM.
 */
export const TabContentManifestor = {
    /**
     * @async
     * @function manifest
     * @description Renders the tab's specific view and loads content if missing.
     */
    async manifest(tab, token, forceReload) {
        const viewID = TabRouter.resolveViewID(tab);
        UI.switchView(viewID);

        // B"H - Decision Tree for View Manifestation
        if (viewID.includes('vibe')) {
            const { VibeController } = await import('../../../vibe/vibe-controller.js');
            await VibeController.render(tab);
        } else if (viewID === 'terminal-wrapper') {
            const { Terminal } = await import('../../../terminal/index.js');
            await Terminal.render(tab, DOM.terminalWrapper);
        } else if (viewID === 'file-commander-wrapper') {
            const { FileCommander } = await import('../../../file-commander/index.js');
            FileCommander.render(tab, DOM.fileCommanderWrapper);
        } else {
            // Load content from the physical disk if necessary
            if (!tab.content || forceReload) {
                const ok = await TabsLoader.loadTabContent(tab);
                // Verify the intent is still fresh after the async I/O wait
                if (TabSentinel.isIntentStale(token)) return false;
                if (!ok) return false;
            }
            // Delegate to the specialized renderer
            await TabsLoader.renderTabView(tab, forceReload);
        }
        return true;
    }
};
