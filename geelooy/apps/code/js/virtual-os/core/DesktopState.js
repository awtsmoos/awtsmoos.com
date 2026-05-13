// B"H
/**
 * @file DesktopState.js
 * @description Persistent window/process state for the Virtual OS dimension.
 */

const STORAGE_KEY = 'awtsmoos_virtual_os_state_v1';

function nextId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function baseState(rootPath) {
    return {
        rootPath,
        nextZ: 10,
        startMenuOpen: false,
        windows: [],
        processes: []
    };
}

export const DesktopState = {
    restore(rootPath = '/') {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return baseState(rootPath);
            const parsed = JSON.parse(raw);
            return {
                ...baseState(rootPath),
                ...parsed,
                rootPath
            };
        } catch (error) {
            return baseState(rootPath);
        }
    },

    save(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    launchProcess(state, appId, title) {
        const processId = nextId('proc');
        const windowId = nextId('win');
        const process = { id: processId, appId, title, windowId, startedAt: Date.now() };
        state.processes.push(process);
        return process;
    },

    addWindow(state, config) {
        const windowState = {
            id: config.id || nextId('win'),
            processId: config.processId,
            title: config.title || 'Window',
            appId: config.appId,
            x: config.x ?? 80,
            y: config.y ?? 80,
            width: config.width ?? 720,
            height: config.height ?? 460,
            minWidth: config.minWidth ?? 320,
            minHeight: config.minHeight ?? 200,
            isMinimized: false,
            isMaximized: false,
            zIndex: ++state.nextZ,
            payload: config.payload || {}
        };
        state.windows.push(windowState);
        return windowState;
    },

    focusWindow(state, windowId) {
        const windowState = state.windows.find((entry) => entry.id === windowId);
        if (!windowState) return;
        windowState.zIndex = ++state.nextZ;
    },

    closeWindow(state, windowId) {
        const closed = state.windows.find((entry) => entry.id === windowId);
        state.windows = state.windows.filter((entry) => entry.id !== windowId);
        if (closed?.processId) {
            state.processes = state.processes.filter((proc) => proc.id !== closed.processId);
        }
    }
};
