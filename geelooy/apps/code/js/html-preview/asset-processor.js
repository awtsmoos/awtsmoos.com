
// B"H
// FILE: js/html-preview/asset-processor.js

import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';

export const AssetProcessor = {
    async process(doc, identity) {
        const list = Array.from(doc.querySelectorAll('img[src], video[src], audio[src], link[rel="stylesheet"]'));
        
        await Promise.all(list.map(async (el) => {
            const attr = el.tagName === 'LINK' ? 'href' : 'src';
            const rawLabel = el.getAttribute(attr);
            if (!rawLabel || rawLabel.startsWith('http') || rawLabel.startsWith('data:') || rawLabel.startsWith('blob:')) return;

            try {
                const abs = PathResolver.resolve(identity.path, rawLabel);
                const rawEssence = await FileSystemProvider.read({ ...identity, path: abs, kind: 'file' });
                const blob = (rawEssence instanceof Blob) ? rawEssence : new Blob([rawEssence]);
                el.setAttribute(attr, URL.createObjectURL(blob));
            } catch (e) {
                console.warn(`[AssetProcessor] Failed to gather spark: ${rawLabel}`, e);
            }
        }));
    }
};
