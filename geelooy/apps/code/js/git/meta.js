// B"H
// FILE: js/git/meta.js
import { FileSystemProvider } from '../fs-provider.js';

export const GitMetaProvider = {
    _cache: new Map(),

    async getGitInfoForFolder(item) {
        if (!item || item.type === 'github') return null;
        const wsId = item.workspaceId || item.id;
        let path = item.path;

        let limit = 20;
        while (limit-- > 0) {
            const cacheKey = `${wsId}::${path}`;
            if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

            try {
                const ikarItem = { ...item, workspaceId: wsId, path: `${path}/.awtsmoos-repo/ikar.js`, kind: 'file' };
                const raw = await FileSystemProvider.read(ikarItem);
                const text = (raw instanceof Blob ? await raw.text() : String(raw));
                const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
                const info = JSON.parse(json);
                
                if (info && info.isClone) {
                    this._cache.set(cacheKey, { ...info, path });
                    return { ...info, path };
                }
            } catch(e) {}

            if (path === '/' || path === '') break;
            const last = path.lastIndexOf('/');
            path = last <= 0 ? '/' : path.substring(0, last);
        }
        return null;
    }
};
