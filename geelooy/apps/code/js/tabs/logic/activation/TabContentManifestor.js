
// B"H
/**
 * @file TabContentManifestor.js
 * @brief Bridges the data into the physical DOM.
 */
import { State, DOM } from '../../../state.js';
import { UI } from '../../../ui.js';
import { TabRouter } from '../../router.js';
import { TabsLoader } from '../../loader.js';
import { TabSentinel } from '../../sentinel.js';

export const TabContentManifestor = {
    async manifest(tab, token, forceReload) {
        const viewID = TabRouter.resolveViewID(tab);
        UI.switchView(viewID);

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
            if (!tab.content || forceReload) {
                const ok = await TabsLoader.loadTabContent(tab);
                if (TabSentinel.isIntentStale(token)) return false;
                if (!ok) return false;
            }
            await TabsLoader.renderTabView(tab, forceReload);
        }
        return true;
    }
};
