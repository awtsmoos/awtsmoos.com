
// B"H
/**
 * @file DesktopState.js
 * @description
 * Per-root desktop memory. Old global blank states are not trusted.
 */

const PREFIX = 'awtsmoos_virtual_os_state_v3';

function nextId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function keyFor(rootPath = '/') {
    return `${PREFIX}:${String(rootPath || '/').replaceAll('\\', '/')}`;
}

function baseState(rootPath = '/') {
    return {
        rootPath,
        nextZ: 10,
        startMenuOpen: false,
        windows: [],
        processes: []
    };
}

function heal(state, rootPath) {
    const healed = { ...baseState(rootPath), ...(state || {}), rootPath };
    healed.windows = Array.isArray(healed.windows) ? healed.windows : [];
    healed.processes = Array.isArray(healed.processes) ? healed.processes : [];
    healed.nextZ = Number(healed.nextZ) || 10;
    return healed;
}

export const DesktopState = {
    restore(rootPath = '/') {
        try {
            const raw = localStorage.getItem(keyFor(rootPath));
            return raw ? heal(JSON.parse(raw), rootPath) : baseState(rootPath);
        } catch (e) {
            return baseState(rootPath);
        }
    },

    save(state) {
        localStorage.setItem(keyFor(state.rootPath || '/'), JSON.stringify(heal(state, state.rootPath || '/')));
    },

    launchProcess(state, appId, title) {
        const process = {
            id: nextId('proc'),
            appId,
            title,
            windowId: nextId('win'),
            startedAt: Date.now()
        };

        state.processes.push(process);
        return process;
    },

    addWindow(state, config) {
        const win = {
            id: config.id || nextId('win'),
            processId: config.processId,
            title: config.title || 'Window',
            appId: config.appId,
            x: config.x ?? 64,
            y: config.y ?? 42,
            width: config.width ?? 720,
            height: config.height ?? 460,
            minWidth: config.minWidth ?? 280,
            minHeight: config.minHeight ?? 180,
            isMinimized: Boolean(config.isMinimized),
            isMaximized: Boolean(config.isMaximized),
            zIndex: ++state.nextZ,
            payload: config.payload || {}
        };

        state.windows.push(win);
        return win;
    },

    focusWindow(state, windowId) {
        const win = state.windows.find((entry) => entry.id === windowId);
        if (!win) return;
        win.isMinimized = false;
        win.zIndex = ++state.nextZ;
    },

    closeWindow(state, windowId) {
        const closed = state.windows.find((entry) => entry.id === windowId);
        state.windows = state.windows.filter((entry) => entry.id !== windowId);
        if (closed?.processId) {
            state.processes = state.processes.filter((proc) => proc.id !== closed.processId);
        }
    }
};
