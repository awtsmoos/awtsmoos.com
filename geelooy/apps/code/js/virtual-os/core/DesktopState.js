
// B"H
/**
 * @file DesktopState.js
 * @description
 * Per-root desktop memory for windows, icons, settings, and processes.
 */

const PREFIX = 'awtsmoos_virtual_os_state_v4';

/**
 * @function nextId
 * @param {string} prefix Prefix.
 * @returns {string} Id.
 */
function nextId(prefix = 'id') {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @function keyFor
 * @param {string} rootPath Root path.
 * @returns {string} Storage key.
 */
function keyFor(rootPath = '/') {
    return `${PREFIX}:${String(rootPath || '/').replaceAll('\\', '/')}`;
}

/**
 * @function baseState
 * @param {string} rootPath Root path.
 * @returns {object} State.
 */
function baseState(rootPath = '/') {
    return {
        rootPath,
        nextZ: 10,
        focusedWindowId: null,
        selectedIconId: null,
        startMenuOpen: false,
        windows: [],
        processes: [],
        icons: {},
        settings: {
            debug: localStorage.getItem('awtsmoos.virtualOS.debug') === 'true',
            autoGitMode: localStorage.getItem('awtsmoos.vibe.git.mode') || 'off'
        }
    };
}

/**
 * @function heal
 * @param {object} state Possible state.
 * @param {string} rootPath Root path.
 * @returns {object} Healed state.
 */
function heal(state, rootPath) {
    const healed = { ...baseState(rootPath), ...(state || {}), rootPath };
    healed.windows = Array.isArray(healed.windows) ? healed.windows : [];
    healed.processes = Array.isArray(healed.processes) ? healed.processes : [];
    healed.icons = healed.icons && typeof healed.icons === 'object' ? healed.icons : {};
    healed.settings = { ...baseState(rootPath).settings, ...(healed.settings || {}) };
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

    reset(rootPath = '/') {
        localStorage.removeItem(keyFor(rootPath));
        return baseState(rootPath);
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
        state.focusedWindowId = win.id;
        return win;
    },

    focusWindow(state, windowId) {
        const win = state.windows.find((entry) => entry.id === windowId);
        if (!win) return;
        win.isMinimized = false;
        win.zIndex = ++state.nextZ;
        state.focusedWindowId = win.id;
    },

    closeWindow(state, windowId) {
        const closed = state.windows.find((entry) => entry.id === windowId);
        state.windows = state.windows.filter((entry) => entry.id !== windowId);
        if (closed?.processId) state.processes = state.processes.filter((proc) => proc.id !== closed.processId);
        if (state.focusedWindowId === windowId) {
            const top = [...state.windows].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
            state.focusedWindowId = top?.id || null;
        }
    }
};
