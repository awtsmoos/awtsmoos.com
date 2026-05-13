
// B"H
/**
 * @file index.js
 * @description
 * Virtual OS shell. The world is no longer rendered before its windows exist.
 */

import { DOM, State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { DesktopState } from './core/DesktopState.js';
import { WindowManager } from './core/WindowManager.js';
import { AppRegistry } from './apps/AppRegistry.js';
import { ensureStarterWindows } from './core/VirtualOSBoot.js';
import { renderVirtualOSChrome } from './core/VirtualOSChrome.js';
import { buildVirtualOSEnv } from './core/VirtualOSEnv.js';

function getWorkspace(tab) {
    return State.workspaces.find((ws) => String(ws.id) === String(tab.item.workspaceId));
}

export const VirtualOSManager = {
    async open(startItem) {
        const rawPath = startItem?.path || '/';
        const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

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

        const workspace = getWorkspace(tab);
        if (!workspace) {
            container.innerHTML = `<div class="virtual-os-root"><div class="virtual-os-empty">B"H - No workspace was found for this Virtual OS tab.</div></div>`;
            return;
        }

        const workspaceType = workspace.originalType || workspace.type;
        const desktopState = tab.content || (tab.content = DesktopState.restore(tab.item.path || '/'));

        ensureStarterWindows(desktopState, this._launch.bind(this));

        const chrome = renderVirtualOSChrome(container);
        const env = buildVirtualOSEnv(this, tab, workspace, workspaceType, desktopState);

        const manager = new WindowManager(chrome.host, desktopState, (windowState, mountNode, state) => {
            const appMeta = AppRegistry[windowState.appId];

            if (!appMeta) {
                mountNode.innerHTML = `<div class="virtual-os-empty">B"H - Missing app: ${windowState.appId}</div>`;
                return;
            }

            return appMeta.renderer(windowState, mountNode, state, env);
        });

        manager.render();
        this._renderTaskbar(chrome.taskList, desktopState, env.requestRender);
        this._renderStartMenu(chrome.menu, desktopState, env.requestRender);

        chrome.startButton.onclick = () => {
            desktopState.startMenuOpen = !desktopState.startMenuOpen;
            chrome.menu.classList.toggle('hidden', !desktopState.startMenuOpen);
            DesktopState.save(desktopState);
        };
    },

    _launch(desktopState, appId) {
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

    _renderTaskbar(taskList, desktopState, requestRender) {
        taskList.innerHTML = '';

        for (const process of desktopState.processes) {
            const windowState = desktopState.windows.find((entry) => entry.id === process.windowId);
            if (!windowState) continue;

            const btn = document.createElement('button');
            btn.className = 'virtual-os-task';
            btn.textContent = process.title;

            btn.onclick = () => {
                windowState.isMinimized = !windowState.isMinimized;
                DesktopState.focusWindow(desktopState, windowState.id);
                requestRender();
            };

            taskList.appendChild(btn);
        }
    },

    _renderStartMenu(menu, desktopState, requestRender) {
        const appList = Object.values(AppRegistry);
        menu.innerHTML = appList.map((app) => `<button data-app-id="${app.id}">${app.title}</button>`).join('');

        menu.onclick = (event) => {
            const id = event.target?.dataset?.appId;
            if (!id) return;

            this._launch(desktopState, id);
            desktopState.startMenuOpen = false;
            requestRender();
        };

        menu.classList.toggle('hidden', !desktopState.startMenuOpen);
    }
};
