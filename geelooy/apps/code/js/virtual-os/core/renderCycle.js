
// B"H
/**
 * @file renderCycle.js
 * @description
 * Complete Virtual OS render cycle, split away from index.js.
 */

import { DesktopState } from './DesktopState.js';
import { resolveVirtualWorkspace } from './workspaceResolver.js';
import { normalizePath } from '../utils/path.js';
import { ensureStarterWindows } from './desktopBoot.js';
import { makeVirtualEnv } from './env.js';
import { mountBootScreen } from '../ui/mount/bootMount.js';
import { mountChrome } from '../ui/mount/chromeMount.js';
import { renderWindowLayer } from './windowLayer.js';
import { renderTaskbar } from '../ui/taskbar.js';
import { renderStartMenu } from '../ui/startMenu.js';
import { probeVirtualOSDom } from '../diagnostics/domProbe.js';
import { mountProbeOverlay } from '../diagnostics/probeOverlay.js';
import { error, log } from '../diagnostics/VirtualOSLog.js';

/**
 * @function renderVirtualOS
 * @param {object} manager VirtualOS manager.
 * @param {HTMLElement} container Virtual OS wrapper.
 * @param {object} tab Active tab.
 * @returns {Promise<void>}
 */
export async function renderVirtualOS(manager, container, tab) {
    mountBootScreen(container, 'Renderer entered. The vessels are being measured.');
    log('Render cycle entered', { tabId: tab?.id, item: tab?.item });

    try {
        const workspace = resolveVirtualWorkspace(tab);

        if (!workspace) {
            mountBootScreen(container, 'No workspace resolved. See console DOM probe.');
            probeVirtualOSDom(container, 'no-workspace');
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
        const env = makeVirtualEnv(manager, tab, workspace, state);

        renderWindowLayer(chrome.windows, state, env);
        renderTaskbar(chrome.tasks, state, env.requestRender);
        renderStartMenu(chrome.menu, state, env.requestRender);

        chrome.start.addEventListener('click', () => {
            state.startMenuOpen = !state.startMenuOpen;
            renderStartMenu(chrome.menu, state, env.requestRender);
            DesktopState.save(state);
        });

        DesktopState.save(state);

        const immediateProbe = probeVirtualOSDom(container, 'after-sync-render');
        mountProbeOverlay(chrome.root, immediateProbe);

        requestAnimationFrame(() => {
            const frameProbe = probeVirtualOSDom(container, 'after-animation-frame');
            mountProbeOverlay(chrome.root, frameProbe);
        });

        log('Render cycle complete', {
            rootPath,
            workspaceName: workspace.name,
            windows: state.windows.length,
            processes: state.processes.length
        });
    } catch (thrown) {
        error('Fatal render cycle rupture', thrown, { tab });
        mountBootScreen(container, `Fatal Virtual OS render error:\n${thrown?.stack || thrown?.message || thrown}`);
        probeVirtualOSDom(container, 'fatal-error');
    }
}
