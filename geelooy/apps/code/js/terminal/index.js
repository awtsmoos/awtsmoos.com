
// B"H
import { TerminalManager } from './manager.js';
import { TerminalRenderer } from './renderer.js';

export const Terminal = {
    open: (item) => TerminalManager.open(item),
    render: (tab, container) => TerminalRenderer.render(tab, container),
    close: (tabId) => TerminalRenderer.close(tabId)
};
