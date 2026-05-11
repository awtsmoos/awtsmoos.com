
// B"H
import { DOM } from '../state.js';

export const UICore = {
    showLoading: (msg = 'Processing...') => {
        if (!DOM.loadingOverlay) DOM.loadingOverlay = document.getElementById('loading-overlay');
        if (DOM.loadingOverlay) {
            const span = DOM.loadingOverlay.querySelector('span');
            if (span) span.textContent = msg;
            DOM.loadingOverlay.style.display = 'flex';
        }
    },
    
    hideLoading: () => {
        if (DOM.loadingOverlay) DOM.loadingOverlay.style.display = 'none';
    },

    /**
     * @function switchView
     * @description Orchestrates the manifestation of the active layer.
     */
    switchView: function(viewId) {
        console.log(`B"H - [View] Layer Focus -> ${viewId}`);

        // Sacred Map of IDs
        const idMap = {
            'editor': 'editor-wrapper',
            'editor-wrapper': 'editor-wrapper',
            'preview': 'previewer',
            'previewer': 'previewer',
            'vibe': 'vibe-editor-wrapper',
            'vibe-editor-wrapper': 'vibe-editor-wrapper',
            'vibe-manager': 'vibe-manager-wrapper',
            'vibe-manager-wrapper': 'vibe-manager-wrapper',
            'commander': 'file-commander-wrapper',
            'file-commander-wrapper': 'file-commander-wrapper',
            'terminal': 'terminal-wrapper',
            'terminal-wrapper': 'terminal-wrapper',
            'devtools': 'devtools-wrapper',
            'devtools-wrapper': 'devtools-wrapper',
            'browser': 'browser-wrapper',
            'browser-wrapper': 'browser-wrapper',
            'empty': 'empty-editor-message',
            'empty-editor-message': 'empty-editor-message'
        };

        const targetId = idMap[viewId] || viewId;
        const allPanels = Object.values(idMap);

        allPanels.forEach(pId => {
            const el = document.getElementById(pId);
            if (!el) return;

            const isTarget = (pId === targetId);
            el.classList.toggle('hidden', !isTarget);
            
            if (isTarget) {
                el.style.display = (pId === 'editor-wrapper') ? 'flex' : 'block';
                el.style.visibility = 'visible';
                el.style.zIndex = '100';
            } else {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.zIndex = '1';
            }
        });
        
        const minimap = document.getElementById('minimap-canvas');
        if (minimap) minimap.classList.toggle('hidden', targetId !== 'editor-wrapper');
    }
};
