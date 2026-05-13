// B"H
/**
 * @file index.js
 * @description Virtual OS shell with start menu, process model, taskbar, and window manager.
 */

import { DOM, State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { App } from '../app.js';
import { DesktopState } from './core/DesktopState.js';
import { WindowManager } from './core/WindowManager.js';
import { AppRegistry } from './apps/AppRegistry.js';

function getWorkspace(tab) {
    return State.workspaces.find((ws) => String(ws.id) === String(tab.item.workspaceId));
}

export const VirtualOSManager = {
    async open(startItem) {
        const path = (startItem?.path || '/').startsWith('/') ? startItem.path : `/${startItem.path || ''}`;
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
        if (!workspace) return;
        const workspaceType = workspace.originalType || workspace.type;
        const desktopState = tab.content || (tab.content = DesktopState.restore(tab.item.path || '/'));
        const requestRender = () => {
            DesktopState.save(desktopState);
            App.saveSessionDebounced();
            this.render(tab);
        };

        container.innerHTML = `
            <div class="virtual-os-root">
                <div class="virtual-os-windows"></div>
                <div class="virtual-os-taskbar">
                    <button class="virtual-os-start">Start</button>
                    <div class="virtual-os-tasks"></div>
                </div>
                <div class="virtual-os-start-menu hidden"></div>
            </div>
        `;

        const host = container.querySelector('.virtual-os-root');
        const menu = container.querySelector('.virtual-os-start-menu');
        const taskList = container.querySelector('.virtual-os-tasks');
        const env = {
            workspace,
            workspaceType,
            requestRender
        };

        const manager = new WindowManager(host, desktopState, (windowState, mountNode, state) => {
            const appMeta = AppRegistry[windowState.appId];
            if (!appMeta) return;
            appMeta.renderer(windowState, mountNode, state, env);
        });
        manager.render();

        this._renderTaskbar(taskList, desktopState, requestRender);
        this._renderStartMenu(menu, desktopState, requestRender);

        container.querySelector('.virtual-os-start').onclick = () => {
            desktopState.startMenuOpen = !desktopState.startMenuOpen;
            menu.classList.toggle('hidden', !desktopState.startMenuOpen);
            DesktopState.save(desktopState);
        };

        if (desktopState.windows.length === 0) {
            this._launch(desktopState, 'explorer');
            this._launch(desktopState, 'terminal');
            requestRender();
        }
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
            y: 36 + desktopState.windows.length * 18
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
