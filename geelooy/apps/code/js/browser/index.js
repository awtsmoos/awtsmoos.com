
// B"H
/**
 * @file index.js
 * @brief The Universal Web Viewer.
 */

import { DOM } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { BrowserRuntime } from './runtime/BrowserRuntime.js';

export const BrowserManager = {
    async open(initialUrl = 'http://localhost:3000') {
        const item = {
            id: `browser-tab-${Date.now()}`,
            name: 'Browser',
            path: 'browser-realm',
            type: 'browser',
            kind: 'file'
        };

        const contentState = {
            currentUrl: initialUrl,
            history: [],
            consoleVisible: false
        };

        await Tabs.create({ ...item, content: contentState }, false, true, true);
    },

    render(tab) {
        const container = DOM.browserWrapper;
        if (!container) return;

        const state = tab.content || (tab.content = { currentUrl: 'about:blank', history: [], consoleVisible: false });

        const runtime = new BrowserRuntime({
            id: tab.id,
            container,
            state,
            save() {
                import('../app.js').then((m) => m.App.saveSessionDebounced());
            }
        });

        runtime.mount();
    }
};
