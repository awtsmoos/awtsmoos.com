// B"H
/**
 * @file RuntimeProviderIO.js
 * @brief Reads virtual filesystem providers without caring where bytes live.
 */
import { FileSystemProvider } from '../../fs-provider.js';
import { joinVirtualPath } from './RuntimePath.js';

export async function readTextIfExists(ws, coreType, path) {
    try {
        const raw = await FileSystemProvider.read({ ...ws, type: coreType, path, kind: 'file' });
        return raw instanceof Blob ? await raw.text() : String(raw);
    } catch (e) {
        return null;
    }
}

export async function readJsonIfExists(ws, coreType, path) {
    const text = await readTextIfExists(ws, coreType, path);
    if (!text) return null;
    try { return JSON.parse(text); } catch (e) { return null; }
}

export async function findFirstExisting(ws, coreType, base, names) {
    for (const name of names) {
        const path = joinVirtualPath(base, name);
        const text = await readTextIfExists(ws, coreType, path);
        if (text !== null) return { path, text };
    }
    return null;
}
