// B"H
// FILE: js/html-preview/bundler.js

import { FileSystemProvider } from '../fs-provider.js';
import { PreviewTransformer } from './transformer.js';

export const VirtualBundler = {
    moduleCache: new Map(), // absPath -> blobUrl

    reset() {
        this.moduleCache.forEach(url => URL.revokeObjectURL(url));
        this.moduleCache.clear();
    },

    resolvePath(base, rel) {
        if (!rel || rel.startsWith('http') || rel.startsWith('data:') || rel.startsWith('blob:')) return rel;
        if (rel.startsWith('/')) return rel;
        
        let basePath = base.substring(0, base.lastIndexOf('/'));
        const stack = basePath ? basePath.split('/').filter(Boolean) : [];
        const parts = rel.split('/');
        
        for (const p of parts) {
            if (p === '..') stack.pop();
            else if (p !== '.') stack.push(p);
        }
        return '/' + stack.join('/');
    },

    _generateErrorModule(msg, absPath) {
        const safeMsg = JSON.stringify(`Awtsmoos Error: ${msg}`);
        const errCode = `
            console.error(${safeMsg});
            const proxyMock = new Proxy({}, {
                get: function(target, prop) {
                    return function() { console.warn('Called missing module property:', prop); };
                }
            });
            export default proxyMock;
        `;
        const errBlob = new Blob([errCode], { type: 'application/javascript' });
        const errUrl = URL.createObjectURL(errBlob);
        this.moduleCache.set(absPath, errUrl);
        return errUrl;
    },

    async build(absPath, baseItem, sourceOverride = null) {
        if (this.moduleCache.has(absPath)) return this.moduleCache.get(absPath);

        let code = sourceOverride;
        if (code === null) {
            try {
                // console.log(`[Bundler] Fetching module vessel: ${absPath}`);
                const item = { ...baseItem, path: absPath, kind: 'file' };
                const raw = await FileSystemProvider.read(item);
                code = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
            } catch(e) {
                console.error(`[Bundler] Failed to load vessel '${absPath}':`, e);
                return this._generateErrorModule(`Module missing at path: ${absPath}`, absPath);
            }
        }

        // B"H - Transmutations
        if (absPath.endsWith('.css')) {
            code = `const style = document.createElement('style'); style.textContent = ${JSON.stringify(code)}; document.head.appendChild(style); export default style;`;
        } else if (absPath.endsWith('.json') || absPath.endsWith('.awtsmoosJSON')) {
            code = `export default ${code};`;
        } else if (absPath.endsWith('.html')) {
            code = `export default ${JSON.stringify(code)};`;
        }

        const resolver = async (relPath) => {
            if (relPath.startsWith('.') || relPath.startsWith('/')) {
                const nextAbs = this.resolvePath(absPath, relPath);
                return await this.build(nextAbs, baseItem, null);
            }
            return `https://esm.sh/${relPath}`;
        };

        try {
            const transformedCode = await PreviewTransformer.transform(code, resolver);
            const blob = new Blob([transformedCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            this.moduleCache.set(absPath, url);
            return url;
        } catch (transformError) {
            console.error(`[Bundler] Syntax Error in '${absPath}':`, transformError);
            return this._generateErrorModule(`Syntax Error in ${absPath}: ${transformError.message}`, absPath);
        }
    }
};