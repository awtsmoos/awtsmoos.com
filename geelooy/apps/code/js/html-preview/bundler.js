
// B"H
// FILE: js/html-preview/bundler.js

import { FileSystemProvider } from '../fs-provider.js';
import { PreviewTransformer } from './transformer.js';
import { PathResolver } from './resolver.js';
import { CycleShield } from './cycle-shield.js';

export const VirtualBundler = {
    cache: new Map(),

    reset() {
        console.log(`[VirtualBundler] B"H - Resetting Module Vessels.`);
        this.cache.forEach(url => URL.revokeObjectURL(url));
        this.cache.clear();
        CycleShield.reset();
    },

    async build(absPath, identity, sourceOverride = null) {
        if (this.cache.has(absPath)) {
            console.log(`[Bundler] B"H - Hit cache for: ${absPath}`);
            return this.cache.get(absPath);
        }
        
        if (!CycleShield.enter(absPath)) {
            console.warn(`[Bundler] B"H - Circular dependency perceived: ${absPath}. Breaking recursion.`);
            return this._circularManifest(absPath);
        }

        console.log(`%c[Bundler] B"H - Weaving: ${absPath}`, "color: #00f6ff;");

        try {
            let code = sourceOverride;
            if (code === null) {
                if (absPath.startsWith('/scripts/') || absPath === '/register.js' || absPath.includes('merkava')) {
                    const res = await fetch(absPath);
                    if (!res.ok) throw new Error(`Heavens missing the vessel: ${absPath}`);
                    code = await res.text();
                } else {
                    const raw = await FileSystemProvider.read({ ...identity, path: absPath, kind: 'file' });
                    code = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
                }
            }

            if (absPath.endsWith('.css')) {
                code = `const style = document.createElement('style'); style.textContent = ${JSON.stringify(code)}; document.head.appendChild(style); export default style;`;
            } else if (absPath.endsWith('.json')) {
                code = `export default ${code};`;
            }

            const resolver = async (relLabel) => {
                const resolvedAbs = PathResolver.resolve(absPath, relLabel);
                console.log(`[Bundler->Resolve] From: ${absPath} -> Seek: ${relLabel} -> Absolute Truth: ${resolvedAbs}`);
                
                if (resolvedAbs.startsWith('/') || relLabel.startsWith('.')) {
                    return await this.build(resolvedAbs, identity, null);
                }
                
                return `https://esm.sh/${relLabel}`;
            };

            // B"H - Passing absPath for logging
            const transmutedSource = await PreviewTransformer.transform(code, resolver, absPath);
            const blobUrl = URL.createObjectURL(new Blob([transmutedSource], { type: 'application/javascript' }));
            
            this.cache.set(absPath, blobUrl);
            CycleShield.exit(absPath);
            return blobUrl;
            
        } catch (e) {
            console.error(`%c[Bundler] B"H - Manifestation Error at ${absPath}`, "color: #f75d65; font-weight: bold;", e);
            CycleShield.exit(absPath);
            return this._errorManifest(e.message, absPath);
        }
    },

    _circularManifest(path) {
        const script = `console.warn(${JSON.stringify('B"H - Loop at ' + path)}); export default {};`;
        return URL.createObjectURL(new Blob([script], { type: 'application/javascript' }));
    },

    _errorManifest(msg, path) {
        const script = `console.error(${JSON.stringify('B"H - Module Error at ' + path + ': ' + msg)}); export default {};`;
        return URL.createObjectURL(new Blob([script], { type: 'application/javascript' }));
    }
};
