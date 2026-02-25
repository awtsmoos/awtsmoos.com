
// B"H
import { FileSystemProvider } from '../fs-provider.js';
import { PreviewTransformer } from './transformer.js';
import { PathResolver } from './resolver.js';
import { CycleShield } from './cycle-shield.js';

/**
 * @class VirtualBundler
 * @description The master weaver that manifests the dependency web.
 */
export const VirtualBundler = {
    cache: new Map(),

    reset() {
        console.log(`[VirtualBundler] Resetting cache vessels.`);
        this.cache.forEach(url => URL.revokeObjectURL(url));
        this.cache.clear();
        CycleShield.reset();
    },

    async build(absPath, baseItem, sourceOverride = null) {
        if (this.cache.has(absPath)) return this.cache.get(absPath);
        if (!CycleShield.enter(absPath)) return this._circular(absPath);

        console.group(`[VirtualBundler] Building: ${absPath}`);
        let code = sourceOverride;
        try {
            if (code === null) {
                // System Realm Check
                if (absPath.startsWith('/scripts/') || absPath === '/register.js' || absPath.includes('merkava')) {
                    const res = await fetch(absPath);
                    if (!res.ok) throw new Error("System Asset Missing");
                    code = await res.text();
                } else {
                    const raw = await FileSystemProvider.read({ ...baseItem, path: absPath, kind: 'file' });
                    code = (raw instanceof Blob) ? await raw.text() : (raw.base64Content ? atob(raw.base64Content) : String(raw));
                }
            }

            // Transmutations
            if (absPath.endsWith('.css')) code = `const s = document.createElement('style'); s.textContent = ${JSON.stringify(code)}; document.head.appendChild(s); export default s;`;
            else if (absPath.endsWith('.json')) code = `export default ${code};`;

            const resolver = async (rel) => {
                const resolved = PathResolver.resolve(absPath, rel);
                if (resolved.startsWith('/') || rel.startsWith('.')) return await this.build(resolved, baseItem, null);
                return `https://esm.sh/${rel}`;
            };

            const transformed = await PreviewTransformer.transform(code, resolver);
            const url = URL.createObjectURL(new Blob([transformed], { type: 'application/javascript' }));
            this.cache.set(absPath, url);
            CycleShield.exit(absPath);
            console.groupEnd();
            return url;
        } catch (e) {
            console.error(`[VirtualBundler] Shevirah: ${absPath}`, e);
            CycleShield.exit(absPath);
            console.groupEnd();
            return this._error(e.message, absPath);
        }
    },

    _circular(path) { return URL.createObjectURL(new Blob([`// B"H Circular Loop Broken: ${path}\nexport default {};`], { type: 'application/javascript' })); },
    _error(msg, path) {
        const code = `console.error(${JSON.stringify('B"H - Module Error: ' + path + ' -> ' + msg)}); export default {};`;
        return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
    },
    resolvePath: PathResolver.resolve
};
