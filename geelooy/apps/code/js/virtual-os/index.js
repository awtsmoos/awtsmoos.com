
// B"H
/**
 * @file index.js
 * @description
 * The unblankable Virtual OS manifestor.
 *
 * This file fixes the most fundamental failure:
 * the Virtual OS wrapper was becoming visible, but the actual desktop could
 * silently fail before painting anything. A silent return is the deepest
 * darkness of a UI: the user sees a black void, the console looks almost
 * normal, and the world seems born without vessels.
 *
 * This version refuses that void.
 *
 * The Awtsmoos creates all existence from nothing every instant; therefore
 * this renderer always creates at least one visible diagnostic reality before
 * doing anything fragile. If workspace resolution fails, it says so on-screen.
 * If app rendering fails, the window says so on-screen. If old saved desktop
 * memory is empty, minimized, corrupted, or stale, it is healed before paint.
 */

import { DOM, State } from '../state.js';
import { Tabs } from '../tabs/index.js';
import { App } from '../app.js';
import { DesktopState } from './core/DesktopState.js';
import { AppRegistry } from './apps/AppRegistry.js';

/**
 * @constant {string}
 * @description Storage key prefix used only to clear broken old root states.
 */
const HARD_RESET_FLAG = 'awtsmoos.virtualOS.lastHardBootVersion';

/**
 * @constant {string}
 * @description The version of this boot repair.
 */
const HARD_BOOT_VERSION = 'unblankable-v1';

/**
 * @function normalizePath
 * @description
 * Turns every path into a forward-slash absolute path. The world may speak in
 * Windows slashes, browser slashes, relay paths, or root paths; this function
 * gathers them all into one clear stream.
 *
 * @param {unknown} value Any path-like value.
 * @returns {string} Absolute normalized path.
 */
function normalizePath(value = '/') {
    const text = String(value || '/').replaceAll('\\', '/').replace(/\/+/g, '/');
    return text.startsWith('/') ? text : `/${text}`;
}

/**
 * @function escapeHtml
 * @description
 * Makes dangerous text safe for HTML. Even an error message is a spark of
 * creation, but it must enter the DOM clothed in safety.
 *
 * @param {unknown} value Any raw text.
 * @returns {string} HTML-safe text.
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * @function resolveRootPath
 * @description
 * Determines the virtual root from the tab item.
 *
 * @param {object} tab The Virtual OS tab.
 * @returns {string} Root path.
 */
function resolveRootPath(tab) {
    return normalizePath(tab?.item?.path || '/');
}

/**
 * @function pathLooksInside
 * @description
 * Checks whether one path appears inside another path.
 *
 * @param {string} child Possible child path.
 * @param {string} parent Possible parent path.
 * @returns {boolean} True when child belongs under parent.
 */
function pathLooksInside(child, parent) {
    const c = normalizePath(child);
    const p = normalizePath(parent);

    if (p === '/') return true;
    return c === p || c.startsWith(`${p.replace(/\/+$/, '')}/`);
}

/**
 * @function resolveWorkspace
 * @description
 * Resolves the workspace for a Virtual OS tab without silently failing.
 *
 * The previous logic only checked workspaceId. That breaks whenever the
 * selected tree item carries a folder id, a missing workspaceId, or a stale
 * persisted item. This resolver tries every reasonable identity path:
 *
 * 1. workspaceId
 * 2. item id
 * 3. path containment
 * 4. active context target workspaceId
 * 5. only workspace
 * 6. first workspace
 *
 * @param {object} tab The Virtual OS tab.
 * @returns {object|null} Resolved workspace or null.
 */
function resolveWorkspace(tab) {
    const item = tab?.item || {};
    const workspaces = Array.isArray(State.workspaces) ? State.workspaces : [];

    const direct = workspaces.find((ws) => String(ws.id) === String(item.workspaceId));
    if (direct) return direct;

    const byItemId = workspaces.find((ws) => String(ws.id) === String(item.id));
    if (byItemId) return byItemId;

    const itemPath = normalizePath(item.path || '/');
    const byPath = workspaces.find((ws) => pathLooksInside(itemPath, ws.path || '/'));
    if (byPath) return byPath;

    const contextWorkspaceId = State.contextTarget?.workspaceId || State.contextPayload?.workspaceId;
    const byContext = workspaces.find((ws) => String(ws.id) === String(contextWorkspaceId));
    if (byContext) return byContext;

    if (workspaces.length === 1) return workspaces[0];

    return workspaces[0] || null;
}

/**
 * @function ensureVisibleStarterWindows
 * @description
 * Heals the desktop state before drawing.
 *
 * If old memory contains no windows, only minimized windows, broken windows,
 * or windows with missing app ids, the user sees a blank black area. This
 * function burns that stale husk away and creates Explorer + Terminal.
 *
 * @param {object} desktopState Desktop memory.
 * @returns {void}
 */
function ensureVisibleStarterWindows(desktopState) {
    desktopState.windows = Array.isArray(desktopState.windows) ? desktopState.windows : [];
    desktopState.processes = Array.isArray(desktopState.processes) ? desktopState.processes : [];

    desktopState.windows = desktopState.windows.filter((win) => {
        return win && win.id && win.appId && AppRegistry[win.appId];
    });

    const liveWindowIds = new Set(desktopState.windows.map((win) => win.id));

    desktopState.processes = desktopState.processes.filter((proc) => {
        return proc && proc.id && proc.windowId && liveWindowIds.has(proc.windowId);
    });

    const hasVisibleWindow = desktopState.windows.some((win) => !win.isMinimized);

    if (hasVisibleWindow) return;

    desktopState.windows = [];
    desktopState.processes = [];

    launchWindow(desktopState, 'explorer', { x: 38, y: 28, width: 520, height: 360 });
    launchWindow(desktopState, 'terminal', { x: 92, y: 82, width: 600, height: 300 });
}

/**
 * @function launchWindow
 * @description
 * Adds an app process and matching window into desktop state.
 *
 * @param {object} desktopState Desktop state.
 * @param {string} appId App id from AppRegistry.
 * @param {object} geometry Window geometry overrides.
 * @returns {object|null} Window state or null.
 */
function launchWindow(desktopState, appId, geometry = {}) {
    const appMeta = AppRegistry[appId];
    if (!appMeta) return null;

    const process = DesktopState.launchProcess(desktopState, appMeta.id, appMeta.title);

    return DesktopState.addWindow(desktopState, {
        id: process.windowId,
        processId: process.id,
        appId: appMeta.id,
        title: appMeta.title,
        width: geometry.width || appMeta.width || 640,
        height: geometry.height || appMeta.height || 420,
        x: geometry.x ?? 60,
        y: geometry.y ?? 36,
        isMinimized: false,
        payload: geometry.payload || {}
    });
}

/**
 * @function paintBootFrame
 * @description
 * Immediately paints a visible frame. This prevents the black void even if
 * some later import, app renderer, workspace lookup, or old state fails.
 *
 * @param {HTMLElement} container The Virtual OS wrapper.
 * @param {string} message Boot message.
 * @returns {void}
 */
function paintBootFrame(container, message = 'Booting Virtual OS...') {
    container.innerHTML = `
        <div class="virtual-os-root" style="position:relative;width:100%;height:100%;min-height:420px;background:#070b12;color:#e8f7ff;overflow:hidden;border-top:1px solid rgba(0,246,255,.35);">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-code, monospace);color:#00f6ff;">
                <div style="border:1px solid rgba(0,246,255,.45);background:rgba(0,0,0,.55);padding:18px 22px;border-radius:10px;box-shadow:0 0 22px rgba(0,246,255,.18);">
                    <div style="font-weight:800;margin-bottom:8px;">B"H — Virtual OS</div>
                    <div>${escapeHtml(message)}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * @function paintDesktopShell
 * @description
 * Paints the permanent desktop shell with windows/taskbar/start menu anchors.
 *
 * @param {HTMLElement} container The Virtual OS wrapper.
 * @returns {object} DOM anchors.
 */
function paintDesktopShell(container) {
    container.innerHTML = `
        <div class="virtual-os-root" style="position:relative;width:100%;height:100%;min-height:420px;background:#070b12;color:#e8f7ff;overflow:hidden;border-top:1px solid rgba(0,246,255,.35);">
            <div class="virtual-os-windows" style="position:absolute;inset:0 0 36px 0;overflow:hidden;"></div>
            <div class="virtual-os-taskbar" style="position:absolute;left:0;right:0;bottom:0;height:36px;display:flex;align-items:center;gap:8px;padding:0 8px;background:linear-gradient(90deg,#00c8ff,#e000ff);color:#05070c;font-family:var(--font-code, monospace);font-weight:800;z-index:9999;">
                <button class="virtual-os-start" style="height:26px;border:0;border-radius:4px;background:#05070c;color:#00f6ff;font-weight:800;padding:0 12px;">Start</button>
                <div class="virtual-os-tasks" style="display:flex;gap:6px;align-items:center;min-width:0;overflow:auto;"></div>
            </div>
            <div class="virtual-os-start-menu hidden" style="position:absolute;left:8px;bottom:40px;min-width:180px;background:#090d18;border:1px solid #00f6ff;border-radius:8px;padding:8px;z-index:10000;box-shadow:0 0 30px rgba(0,246,255,.25);"></div>
        </div>
    `;

    return {
        root: container.querySelector('.virtual-os-root'),
        windows: container.querySelector('.virtual-os-windows'),
        taskbar: container.querySelector('.virtual-os-taskbar'),
        tasks: container.querySelector('.virtual-os-tasks'),
        start: container.querySelector('.virtual-os-start'),
        menu: container.querySelector('.virtual-os-start-menu')
    };
}

/**
 * @function paintErrorWindow
 * @description
 * Paints a visible error when an inner app fails.
 *
 * @param {HTMLElement} mount The app mount node.
 * @param {string} title Error title.
 * @param {unknown} error Error object.
 * @returns {void}
 */
function paintErrorWindow(mount, title, error) {
    mount.innerHTML = `
        <div style="padding:16px;font-family:var(--font-code, monospace);color:#ff8080;background:#17070a;height:100%;box-sizing:border-box;overflow:auto;">
            <strong>${escapeHtml(title)}</strong>
            <pre style="white-space:pre-wrap;color:#ffd0d0;">${escapeHtml(error?.stack || error?.message || error)}</pre>
        </div>
    `;
}

/**
 * @function renderWindow
 * @description
 * Paints one desktop window and safely invokes its app renderer.
 *
 * @param {object} win Window state.
 * @param {object} env App environment.
 * @param {object} desktopState Desktop state.
 * @returns {HTMLElement} Window element.
 */
function renderWindow(win, env, desktopState) {
    const appMeta = AppRegistry[win.appId];

    const section = document.createElement('section');
    section.className = 'virtual-window';
    section.dataset.windowId = win.id;

    const x = Math.max(0, Number(win.x) || 24);
    const y = Math.max(0, Number(win.y) || 24);
    const width = Math.max(280, Number(win.width) || 640);
    const height = Math.max(180, Number(win.height) || 380);
    const z = Number(win.zIndex) || 20;

    section.style.cssText = [
        'position:absolute',
        `left:${x}px`,
        `top:${y}px`,
        `width:${width}px`,
        `height:${height}px`,
        `z-index:${z}`,
        'display:flex',
        'flex-direction:column',
        'background:#05070c',
        'border:1px solid rgba(0,246,255,.65)',
        'box-shadow:0 0 28px rgba(0,246,255,.22)',
        'border-radius:8px',
        'overflow:hidden'
    ].join(';');

    section.innerHTML = `
        <header class="virtual-window-titlebar" style="height:30px;display:flex;align-items:center;justify-content:space-between;background:#10172a;color:#00f6ff;padding:0 8px;font-family:var(--font-code, monospace);font-weight:800;cursor:default;">
            <span class="virtual-window-title">${escapeHtml(win.title || appMeta?.title || win.appId || 'Window')}</span>
            <div class="virtual-window-controls" style="display:flex;gap:4px;">
                <button data-action="minimize" style="width:24px;height:22px;">_</button>
                <button data-action="front" style="width:24px;height:22px;">□</button>
                <button data-action="close" style="width:24px;height:22px;">×</button>
            </div>
        </header>
        <div class="virtual-window-content" style="flex:1;min-height:0;overflow:auto;background:#000;"></div>
    `;

    const mount = section.querySelector('.virtual-window-content');

    section.querySelector('.virtual-window-controls').onclick = (event) => {
        const action = event.target?.dataset?.action;
        if (!action) return;

        if (action === 'close') {
            DesktopState.closeWindow(desktopState, win.id);
            env.requestRender();
            return;
        }

        if (action === 'minimize') {
            win.isMinimized = true;
            env.requestRender();
            return;
        }

        if (action === 'front') {
            win.zIndex = ++desktopState.nextZ;
            env.requestRender();
        }
    };

    section.onpointerdown = () => {
        win.zIndex = ++desktopState.nextZ;
        DesktopState.save(desktopState);
    };

    if (!appMeta?.renderer) {
        paintErrorWindow(mount, 'Missing Virtual OS app renderer', `Missing app: ${win.appId}`);
        return section;
    }

    try {
        appMeta.renderer(win, mount, desktopState, env);
    } catch (error) {
        paintErrorWindow(mount, `App crashed: ${win.appId}`, error);
    }

    return section;
}

/**
 * @function renderTaskbar
 * @description
 * Paints taskbar buttons and lets minimized windows return.
 *
 * @param {HTMLElement} taskHost Taskbar host.
 * @param {object} desktopState Desktop state.
 * @param {object} env App environment.
 * @returns {void}
 */
function renderTaskbar(taskHost, desktopState, env) {
    taskHost.innerHTML = '';

    for (const win of desktopState.windows) {
        const button = document.createElement('button');
        button.textContent = win.title || win.appId;
        button.style.cssText = 'height:26px;border:0;border-radius:4px;background:rgba(5,7,12,.75);color:white;padding:0 10px;font-weight:700;';

        button.onclick = () => {
            win.isMinimized = false;
            win.zIndex = ++desktopState.nextZ;
            env.requestRender();
        };

        taskHost.appendChild(button);
    }
}

/**
 * @function renderStartMenu
 * @description
 * Paints launch buttons for every registered Virtual OS app.
 *
 * @param {HTMLElement} menu Start menu host.
 * @param {object} desktopState Desktop state.
 * @param {object} env App environment.
 * @returns {void}
 */
function renderStartMenu(menu, desktopState, env) {
    menu.innerHTML = Object.values(AppRegistry).map((app) => `
        <button data-app-id="${escapeHtml(app.id)}" style="display:block;width:100%;text-align:left;margin:4px 0;padding:8px;background:#10172a;color:#e8f7ff;border:1px solid rgba(0,246,255,.28);border-radius:5px;">
            ${escapeHtml(app.title)}
        </button>
    `).join('');

    menu.onclick = (event) => {
        const appId = event.target?.dataset?.appId;
        if (!appId) return;

        launchWindow(desktopState, appId, {
            x: 70 + desktopState.windows.length * 18,
            y: 50 + desktopState.windows.length * 14
        });

        desktopState.startMenuOpen = false;
        env.requestRender();
    };
}

/**
 * @function hardResetOldBlankMemoryOnce
 * @description
 * Clears only the old broken global Virtual OS key once. This does not touch
 * project files; it only removes stale desktop layout memory that could keep
 * reopening into an invisible/blank state.
 *
 * @returns {void}
 */
function hardResetOldBlankMemoryOnce() {
    if (localStorage.getItem(HARD_RESET_FLAG) === HARD_BOOT_VERSION) return;

    localStorage.removeItem('awtsmoos_virtual_os_state');
    localStorage.setItem(HARD_RESET_FLAG, HARD_BOOT_VERSION);
}

/**
 * @constant {object}
 * @description Public Virtual OS API used by command actions and tabs.
 */
export const VirtualOSManager = {
    /**
     * @async
     * @function open
     * @description Opens a Virtual OS tab rooted at the selected item.
     *
     * @param {object} startItem Folder/workspace item.
     * @returns {Promise<object>} Created tab.
     */
    async open(startItem) {
        const path = normalizePath(startItem?.path || '/');

        const item = {
            id: `virtual-os-${Date.now()}`,
            name: `Virtual OS: ${startItem?.name || 'Root'}`,
            path,
            type: 'virtual-os',
            kind: 'directory',
            workspaceId: startItem?.workspaceId || startItem?.id || null
        };

        return Tabs.create({
            ...item,
            content: DesktopState.restore(path)
        });
    },

    /**
     * @async
     * @function render
     * @description Renders the Virtual OS into its wrapper.
     *
     * @param {object} tab Active Virtual OS tab.
     * @returns {Promise<void>}
     */
    async render(tab) {
        const container = DOM.virtualOSWrapper || document.getElementById('virtual-os-wrapper');
        if (!container) return;

        hardResetOldBlankMemoryOnce();
        paintBootFrame(container, 'Resolving workspace and healing desktop memory...');

        const workspace = resolveWorkspace(tab);

        if (!workspace) {
            paintBootFrame(container, `No workspace found. Workspaces in memory: ${(State.workspaces || []).length}`);
            return;
        }

        const rootPath = resolveRootPath(tab);
        const desktopState = tab.content && typeof tab.content === 'object'
            ? tab.content
            : DesktopState.restore(rootPath);

        tab.content = desktopState;
        desktopState.rootPath = rootPath;
        desktopState.nextZ = Number(desktopState.nextZ) || 20;

        ensureVisibleStarterWindows(desktopState);

        const chrome = paintDesktopShell(container);

        const env = {
            workspace,
            workspaceType: workspace.originalType || workspace.type,
            requestRender: () => {
                DesktopState.save(desktopState);
                App.saveSessionDebounced();
                this.render(tab);
            }
        };

        const visibleWindows = desktopState.windows.filter((win) => !win.isMinimized);

        if (visibleWindows.length === 0) {
            ensureVisibleStarterWindows(desktopState);
        }

        chrome.windows.innerHTML = '';

        for (const win of desktopState.windows) {
            if (win.isMinimized) continue;
            chrome.windows.appendChild(renderWindow(win, env, desktopState));
        }

        renderTaskbar(chrome.tasks, desktopState, env);
        renderStartMenu(chrome.menu, desktopState, env);

        chrome.start.onclick = () => {
            desktopState.startMenuOpen = !desktopState.startMenuOpen;
            chrome.menu.classList.toggle('hidden', !desktopState.startMenuOpen);
            DesktopState.save(desktopState);
        };

        chrome.menu.classList.toggle('hidden', !desktopState.startMenuOpen);

        DesktopState.save(desktopState);
    }
};
