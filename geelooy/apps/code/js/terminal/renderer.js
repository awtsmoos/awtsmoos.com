
// B"H
import { DOM } from '../state.js';
import { TerminalShell } from './shell.js';

export const TerminalRenderer = {
    _activeShells: new Map(),

    async render(tab, container) {
        const target = container || DOM.terminalWrapper;
        if (!target) return;

        // Persistence: Refocus if already rendered
        if (target.dataset.activeTabId === String(tab.id) && this._activeShells.has(tab.id)) {
            this._activeShells.get(tab.id).ui.focus();
            return;
        }

        target.innerHTML = '';
        target.dataset.activeTabId = tab.id;
        
        const shell = new TerminalShell(tab, target);
        this._activeShells.set(tab.id, shell);
        await shell.init();
    },

    close(tabId) {
        this._activeShells.delete(tabId);
        if (DOM.terminalWrapper && DOM.terminalWrapper.dataset.activeTabId === String(tabId)) {
            DOM.terminalWrapper.innerHTML = '';
            delete DOM.terminalWrapper.dataset.activeTabId;
        }
    }
};
