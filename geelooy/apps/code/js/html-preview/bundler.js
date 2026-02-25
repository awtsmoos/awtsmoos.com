
// B"H
// FILE: js/html-preview/bundler.js

import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';
import { PreviewTransformer } from './transformer.js';

/**
 * @class VirtualBundler
 * @description The Weaver of the Web. 
 * It gathers all modules, following the threads of 'import' 
 * and 'export', until every dependency is a live Blob.
 */
export const VirtualBundler = {
    moduleCache: new Map(), 
    activeWalk: new Set(), 

    reset() {
        this.moduleCache.forEach(url => URL.revokeObjectURL(url));
        this.moduleCache.clear();
        this.activeWalk.clear();
    },

    /**
     * @async
     * @function build
     * @description Recursively builds the module tree.
     */
    async build(absPath, baseItem, sourceOverride = null) {
        if (this.moduleCache.has(absPath)) return this.moduleCache.get(absPath);
        
        // Break infinite loops in the abyss
        if (this.activeWalk.has(absPath)) {
            return this._circularFallback(absPath);
        }

        this.activeWalk.add(absPath);

        try {
            let code = sourceOverride;
            if (code === null) {
                const item = { ...baseItem, path: absPath, kind: 'file' };
                const raw = await FileSystemProvider.read(item);
                code = (raw instanceof Blob) ? await raw.text() : String(raw);
            }

            // Handle non-JS types by wrapping them in JS Module light
            if (absPath.endsWith('.css')) {
                code = `const s = document.createElement('style'); s.textContent = ${JSON.stringify(code)}; document.head.appendChild(s); export default s;`;
            } else if (absPath.endsWith('.json')) {
                code = `export default ${code};`;
            }

            // Recursive Resolver
            const resolver = async (rel) => {
                const resolvedAbs = PathResolver.resolve(absPath, rel);
                if (resolvedAbs.startsWith('/') || rel.startsWith('.')) {
                    return await this.build(resolvedAbs, baseItem, null);
                }
                return `https://esm.sh/${rel}`; // External library gate
            };

            const transformed = await PreviewTransformer.transform(code, resolver);
            const blobUrl = URL.createObjectURL(new Blob([transformed], { type: 'application/javascript' }));
            
            this.moduleCache.set(absPath, blobUrl);
            return blobUrl;
        } finally {
            this.activeWalk.delete(absPath);
        }
    },

    _circularFallback(path) {
        const code = `console.warn('B"H: Circularity detected at ${path}'); export default {};`;
        return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
    }
};
