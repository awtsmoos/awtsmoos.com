
// B"H
/**
 * @file payload.js
 * @description
 * Heals stale terminal memory from older broken sessions.
 */

export function healTerminalPayload(windowState, desktopState) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = typeof payload.cwd === 'string' && payload.cwd ? payload.cwd : (desktopState.rootPath || '/');
    payload.lines = Array.isArray(payload.lines) ? payload.lines : [];

    windowState.payload = payload;
    return payload;
}
