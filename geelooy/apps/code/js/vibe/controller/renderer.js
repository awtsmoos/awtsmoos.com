
// B"H
import { UI } from '../../ui.js';
import { State } from '../../state.js';
import { VibeView } from '../vibe-view.js';
import { VibeManagerUI } from '../view/manager-ui.js';

export const VibeRenderer = {
    init() { VibeView.init(); },
    
    async render(tab, controller) {
        if (!tab || !tab.item) return;

        if (tab.item.type === 'vibe-manager') {
            if (State.activeTabId === tab.id) UI.switchView('vibe-manager-wrapper');
            await VibeManagerUI.render(document.getElementById('vibe-manager-wrapper'), controller);
            return;
        }
        
        if (State.activeTabId === tab.id) UI.switchView('vibe');
        if (!tab.vibeSession) tab.vibeSession = tab.content;
        
        await VibeView.render(tab, controller);
    }
};
