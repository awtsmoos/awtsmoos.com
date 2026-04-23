
// B"H
import { FileSystemProvider } from '../../../fs-provider.js';

export const VibeLoopStructuralBridge = {
    _memo: new Set(),
    async ensureDir(workspace, filePath, type) {
        const segments = filePath.split('/').filter(Boolean);
        if (segments.length <= 1) return;
        segments.pop(); 
        
        let accum = "";
        for (const s of segments) {
            accum += "/" + s;
            const key = `${workspace.id}::${accum}`;
            if (this._memo.has(key)) continue;
            try {
                const parent = { ...workspace, path: accum.substring(0, accum.lastIndexOf('/')) || "/", kind: 'directory', type };
                await FileSystemProvider.create(parent, s, 'directory');
            } catch (e) {}
            this._memo.add(key);
        }
    }
};
