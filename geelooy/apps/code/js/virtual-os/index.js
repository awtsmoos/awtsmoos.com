
// B"H
/**
 * @file index.js
 * @description
 * Tiny orchestrator only. Real work lives in submodules.
 */

import { DOM } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { DesktopState } from './core/DesktopState.js';
import { WindowManager } from './core/WindowManager.js';
import { ensureStarterWindows } from './core/desktopBoot.js';
import { makeVirtualEnv } from './core/env.js';
import { resolveVirtualWorkspace } from './core/workspaceResolver.js';
import { normalizePath } from './utils/path.js';
import { renderBootScreen } from './ui/bootScreen.js';
import { mountChrome } from './ui/chromeMount.js';
import { renderTaskbar } from './ui/taskbar.js';
import { renderStartMenu } from './ui/startMenu.js';
import { error, log, warn } from './diagnostics/VirtualOSLog.js';

export const VirtualOSManager = {
    async open(startItem) {
        const path = normalizePath(startItem?.path || '/');

        log('Opening tab', {
            name: startItem?.name,
            path,
            workspaceId: startItem?.workspaceId,
            id: startItem?.id
        });

        return Tabs.create({
            id: `virtual-os-${Date.now()}`,
            name: `Virtual OS: ${startItem?.name || 'Root'}`,
            path,
            type: 'virtual-os',
            kind: 'directory',
            workspaceId: startItem?.workspaceId || startItem?.id || null,
            content: DesktopState.restore(path)
        });
    },

    async render(tab) {
        const container = DOM.virtualOSWrapper || document.getElementById('virtual-os-wrapper');

        if (!container) {
            warn('No virtual-os-wrapper found');
            return;
        }

        renderBootScreen(container, 'Renderer entered. Resolving workspace...');
        log('Render entered', { tabId: tab?.id, item: tab?.item });

        try {
            const workspace = resolveVirtualWorkspace(tab);

            if (!workspace) {
                renderBootScreen(container, 'No workspace resolved. Check State.workspaces.');
                return;
            }

            const rootPath = normalizePath(tab?.item?.path || '/');
            const state = tab.content && typeof tab.content === 'object'
                ? tab.content
                : DesktopState.restore(rootPath);

            tab.content = state;
            state.rootPath = rootPath;

            ensureStarterWindows(state);

            const chrome = mountChrome(container);
            const env = makeVirtualEnv(this, tab, workspace, state);
            const manager = new WindowManager(chrome.root, state, env);

            manager.render();
            renderTaskbar(chrome.tasks, state, env.requestRender);
            renderStartMenu(chrome.menu, state, env.requestRender);

            chrome.start.addEventListener('click', () => {
                state.startMenuOpen = !state.startMenuOpen;
                renderStartMenu(chrome.menu, state, env.requestRender);
                DesktopState.save(state);
            });

            DesktopState.save(state);

            log('Render complete', {
                rootPath,
                workspaceName: workspace.name,
                windows: state.windows.length,
                processes: state.processes.length
            });
        } catch (thrown) {
            error('Fatal render rupture', thrown, { tab });
            renderBootScreen(container, `Fatal Virtual OS render error: ${thrown?.message || thrown}`);
        }
    }
};
