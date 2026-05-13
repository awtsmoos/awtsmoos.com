
// B"H
/**
 * @file index.js
 * @description
 * Virtual OS orchestrator.
 *
 * The crucial repair: starter windows are created before rendering,
 * workspace lookup is healed, and no missing workspace can fail silently.
 */

import { DOM } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { DesktopState } from './core/DesktopState.js';
import { WindowManager } from './core/WindowManager.js';
import { AppRegistry } from './apps/AppRegistry.js';
import { ensureStarterWindows } from './core/VirtualOSBoot.js';
import { renderVirtualOSChrome, renderVirtualOSError } from './core/VirtualOSChrome.js';
import { buildVirtualOSEnv } from './core/VirtualOSEnv.js';
import { resolveVirtualWorkspace, resolveVirtualRootPath } from './core/rootResolver.js';

export const VirtualOSManager = {
    async open(startItem) {
        const path = String(startItem?.path || '/').startsWith('/')
            ? String(startItem?.path || '/')
            : `/${String(startItem?.path || '')}`;

        const item = {
            id: `virtual-os-${Date.now()}`,
            name: `Virtual OS: ${startItem?.name || 'Root'}`,
            path,
            type: 'virtual-os',
            kind: 'directory',
            workspaceId: startItem?.workspaceId || startItem?.id
        };

        const content = DesktopState.restore(path);
        return Tabs.create({ ...item, content });
    },

    async render(tab) {
        const container = DOM.virtualOSWrapper;
        if (!container) return;

        const workspace = resolveVirtualWorkspace(tab);

        if (!workspace) {
            renderVirtualOSError(container, 'No workspace exists for this Virtual OS tab.');
            return;
        }

        const workspaceType = workspace.originalType || workspace.type;
        const rootPath = resolveVirtualRootPath(tab);
        const desktopState = tab.content || (tab.content = DesktopState.restore(rootPath));

        desktopState.rootPath = rootPath;
        ensureStarterWindows(desktopState, this.launch.bind(this));

        const chrome = renderVirtualOSChrome(container);
        const env = buildVirtualOSEnv(this, tab, workspace, workspaceType, desktopState);

        const windowManager = new WindowManager(chrome.host, desktopState, (windowState, mountNode, state) => {
            const appMeta = AppRegistry[windowState.appId];

            if (!appMeta) {
                mountNode.innerHTML = `<div class="virtual-os-empty">B"H - Missing app: ${windowState.appId}</div>`;
                return;
            }

            appMeta.renderer(windowState, mountNode, state, env);
        });

        windowManager.render();
        this.renderTaskbar(chrome.taskList, desktopState, env.requestRender);
        this.renderStartMenu(chrome.menu, desktopState, env.requestRender);

        chrome.startButton.onclick = () => {
            desktopState.startMenuOpen = !desktopState.startMenuOpen;
            chrome.menu.classList.toggle('hidden', !desktopState.startMenuOpen);
            DesktopState.save(desktopState);
        };

        DesktopState.save(desktopState);
    },

    launch(desktopState, appId) {
        const appMeta = AppRegistry[appId];
        if (!appMeta) return;

        const process = DesktopState.launchProcess(desktopState, appMeta.id, appMeta.title);

        DesktopState.addWindow(desktopState, {
            id: process.windowId,
            processId: process.id,
            appId: appMeta.id,
            title: appMeta.title,
            width: appMeta.width,
            height: appMeta.height,
            x: 60 + desktopState.windows.length * 24,
            y: 36 + desktopState.windows.length * 18,
            isMinimized: false
        });
    },

    renderTaskbar(taskList, desktopState, requestRender) {
        taskList.innerHTML = '';

        for (const process of desktopState.processes) {
            const windowState = desktopState.windows.find((entry) => entry.id === process.windowId);
            if (!windowState) continue;

            const button = document.createElement('button');
            button.className = 'virtual-os-task';
            button.textContent = process.title;

            button.onclick = () => {
                windowState.isMinimized = !windowState.isMinimized;
                DesktopState.focusWindow(desktopState, windowState.id);
                requestRender();
            };

            taskList.appendChild(button);
        }
    },

    renderStartMenu(menu, desktopState, requestRender) {
        menu.innerHTML = Object.values(AppRegistry)
            .map((app) => `<button data-app-id="${app.id}">${app.title}</button>`)
            .join('');

        menu.onclick = (event) => {
            const id = event.target?.dataset?.appId;
            if (!id) return;

            this.launch(desktopState, id);
            desktopState.startMenuOpen = false;
            requestRender();
        };

        menu.classList.toggle('hidden', !desktopState.startMenuOpen);
    }
};
