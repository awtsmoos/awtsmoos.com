
// B"H
/**
 * @file index.js
 * @brief The Universal Web Viewer.
 */

import { State, DOM } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { Actions } from '../actions/index.js';
import { PreviewManager } from '../editor/preview-manager.js';

export const BrowserManager = {
    /**
     * B"H
     * Initiates the opening of a new browser vessel.
     */
    async open(initialUrl = 'http://localhost:3000') {
        const item = {
            id: `browser-tab-${Date.now()}`,
            name: `Browser`,
            path: 'browser-realm',
            type: 'browser',
            kind: 'file'
        };

        const contentState = {
            currentUrl: initialUrl
        };

        await Tabs.create({ ...item, content: contentState }, false, true, true);
    },

    /**
     * B"H
     * Renders the physical DOM wrapper for the active browser tab.
     */
    render(tab) {
        const container = DOM.browserWrapper;
        if (!container) return;

        const state = tab.content || { currentUrl: '' };

        if (container.dataset.activeTabId === String(tab.id)) {
            return;
        }

        container.innerHTML = `
            <div class="browser-container">
                <div class="browser-toolbar">
                    <button id="browser-back" class="icon-button" title="Back"><svg class="svg-icon"><use href="#icon-arrow-left"></use></svg></button>
                    <button id="browser-reload" class="icon-button" title="Reload"><svg class="svg-icon"><use href="#icon-refresh"></use></svg></button>
                    <input type="text" id="browser-url-bar" class="browser-url-input" value="${state.currentUrl}" placeholder="http://...">
                    <button id="browser-go" class="primary-btn" style="min-height:0; padding:4px 12px; font-size:12px;">GO</button>
                    <div style="width:1px; background:var(--color-border); margin:0 8px; height:20px;"></div>
                    <button id="browser-console" class="icon-button" title="Open JavaScript Console" style="color:var(--neon-cyan);"><svg class="svg-icon"><use href="#icon-laptop"></use></svg></button>
                    <button id="browser-popout" class="icon-button" title="Open in New Window"><svg class="svg-icon"><use href="#icon-external-link"></use></svg></button>
                </div>
                <div class="browser-iframe-container">
                    <iframe id="browser-iframe" class="browser-iframe" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" src="${state.currentUrl}"></iframe>
                </div>
            </div>
        `;

        container.dataset.activeTabId = tab.id;

        const urlBar = container.querySelector('#browser-url-bar');
        const iframe = container.querySelector('#browser-iframe');
        const goBtn = container.querySelector('#browser-go');
        const backBtn = container.querySelector('#browser-back');
        const reloadBtn = container.querySelector('#browser-reload');
        const consoleBtn = container.querySelector('#browser-console');
        const popoutBtn = container.querySelector('#browser-popout');

        // B"H - THE ANCHORING: Register the iframe so DevTools can find it
        PreviewManager.registerIframe(tab.id, iframe);

        const navigate = () => {
            let url = urlBar.value.trim();
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'http://' + url;
                urlBar.value = url;
            }
            state.currentUrl = url;
            
            try {
                const urlObj = new URL(url);
                tab.item.name = `Web: ${urlObj.hostname}`;
                import('../tabs/index.js').then(m => m.Tabs.render());
            } catch(e) {}
            
            iframe.src = url;
            import('../app.js').then(m => m.App.saveSessionDebounced());
        };

        goBtn.onclick = navigate;
        urlBar.onkeydown = (e) => { if (e.key === 'Enter') navigate(); };
        reloadBtn.onclick = () => { iframe.src = iframe.src; };
        
        consoleBtn.onclick = () => {
            Actions.handle('open-devtools', tab);
        };
        
        backBtn.onclick = () => {
            try { iframe.contentWindow.history.back(); } catch(e) {}
        };
        
        popoutBtn.onclick = () => {
            if (state.currentUrl) window.open(state.currentUrl, '_blank');
        };
    }
};
