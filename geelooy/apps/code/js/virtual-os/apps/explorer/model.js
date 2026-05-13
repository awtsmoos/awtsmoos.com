
// B"H
import { FileSystemProvider } from '../../../fs-provider.js';
import { makeProviderItem } from '../../lib/providerItem.js';
import { joinPath, normalizePath } from '../../lib/path.js';

export function healExplorerPayload(windowState, desktopState) {
    const payload = windowState.payload && typeof windowState.payload === 'object'
        ? windowState.payload
        : {};

    payload.cwd = normalizePath(payload.cwd || desktopState?.rootPath || '/');
    payload.view = payload.view === 'grid' ? 'grid' : 'list';

    windowState.payload = payload;
    return payload;
}

export async function listExplorerEntries(env, cwd) {
    const result = await FileSystemProvider.list(makeProviderItem(env, cwd, 'directory'));
    const entries = Array.isArray(result) ? result : (result.entries || []);

    return entries.map((entry) => ({
        ...entry,
        name: entry.name || entry.path?.split('/').filter(Boolean).pop() || 'Untitled',
        kind: entry.kind || entry.type || 'file',
        path: normalizePath(entry.path || joinPath(cwd, entry.name || 'Untitled'))
    }));
}

export async function readExplorerFile(env, path) {
    const raw = await FileSystemProvider.read(makeProviderItem(env, path, 'file'));
    return raw instanceof Blob ? raw.text() : String(raw ?? '');
}

export async function writeExplorerFile(env, path, content) {
    return FileSystemProvider.write(makeProviderItem(env, path, 'file'), content);
}
