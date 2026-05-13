
// B"H
import { normalizePath } from '../../lib/path.js';

export function healTerminalPayload(windowState, desktopState) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = normalizePath(payload.cwd || desktopState?.rootPath || '/');
    payload.lines = Array.isArray(payload.lines) ? payload.lines : [];

    windowState.payload = payload;
    return payload;
}
