
// B"H
/**
 * @file DesktopState.js
 * @description
 * Persistent process/window state, keyed by root path.
 *
 * The older global key mixed different Virtual OS roots together, so an old,
 * minimized, offscreen, or broken desktop could make a fresh OS tab look
 * completely empty. This version stores per-root memory and heals bad state.
 */

const STORAGE_PREFIX = 'awtsmoos_virtual_os_state_v2';

function nextId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function keyFor(rootPath = '/') {
    return `${STORAGE_PREFIX}:${String(rootPath || '/').replaceAll('\\', '/')}`;
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

function healState(state, rootPath) {
    const healed = {
        ...baseState(rootPath),
        ...(state && typeof state === 'object' ? state : {}),
        rootPath
    };

    healed.windows = Array.isArray(healed.windows)
        ? healed.windows.filter((win) => win && win.id && win.appId)
        : [];

    healed.processes = Array.isArray(healed.processes)
        ? healed.processes.filter((proc) => proc && proc.id && proc.windowId)
        : [];

    const liveWindowIds = new Set(healed.windows.map((win) => win.id));
    healed.processes = healed.processes.filter((proc) => liveWindowIds.has(proc.windowId));

    healed.nextZ = Number(healed.nextZ) || 10;
    healed.startMenuOpen = Boolean(healed.startMenuOpen);

    return healed;
}

export const DesktopState = {
    /**
     * @function restore
     * @param {string} rootPath Desktop root path.
     * @returns {object} Healed desktop state.
     */
    restore(rootPath = '/') {
        try {
            const raw = localStorage.getItem(keyFor(rootPath));
            if (!raw) return baseState(rootPath);
            return healState(JSON.parse(raw), rootPath);
        } catch (error) {
            return baseState(rootPath);
        }
    },

    /**
     * @function save
     * @param {object} state Desktop state.
     * @returns {void}
     */
    save(state) {
        const healed = healState(state, state?.rootPath || '/');
        localStorage.setItem(keyFor(healed.rootPath), JSON.stringify(healed));
    },

    /**
     * @function launchProcess
     * @param {object} state Desktop state.
     * @param {string} appId App id.
     * @param {string} title App title.
     * @returns {object} Process record.
     */
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

    /**
     * @function addWindow
     * @param {object} state Desktop state.
     * @param {object} config Window config.
     * @returns {object} Window record.
     */
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
            isMinimized: Boolean(config.isMinimized),
            isMaximized: Boolean(config.isMaximized),
            zIndex: ++state.nextZ,
            payload: config.payload || {}
        };

        state.windows.push(windowState);
        return windowState;
    },

    /**
     * @function focusWindow
     * @param {object} state Desktop state.
     * @param {string} windowId Window id.
     * @returns {void}
     */
    focusWindow(state, windowId) {
        const windowState = state.windows.find((entry) => entry.id === windowId);
        if (!windowState) return;

        windowState.isMinimized = false;
        windowState.zIndex = ++state.nextZ;
    },

    /**
     * @function closeWindow
     * @param {object} state Desktop state.
     * @param {string} windowId Window id.
     * @returns {void}
     */
    closeWindow(state, windowId) {
        const closed = state.windows.find((entry) => entry.id === windowId);

        state.windows = state.windows.filter((entry) => entry.id !== windowId);

        if (closed?.processId) {
            state.processes = state.processes.filter((proc) => proc.id !== closed.processId);
        }
    }
};
