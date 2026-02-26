
// B"H
// FILE: js/html-preview/asset-processor.js

import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';

export const AssetProcessor = {
    /**
     * @async
     * @function process
     * @description Hunts down every physical media link in the HTML and transfigures it into a local Blob URL.
     */
    async process(doc, identity) {
        const selectors = [
            { sel: 'img[src]', attr: 'src' },
            { sel: 'video[src]', attr: 'src' },
            { sel: 'audio[src]', attr: 'src' },
            { sel: 'source[src]', attr: 'src' },
            { sel: 'track[src]', attr: 'src' },
            { sel: 'iframe[src]', attr: 'src' },
            { sel: 'embed[src]', attr: 'src' },
            { sel: 'object[data]', attr: 'data' },
            { sel: 'link[rel="stylesheet"]', attr: 'href' },
            { sel: 'link[rel="icon"]', attr: 'href' }
        ];

        const promises =[];
        
        selectors.forEach(({ sel, attr }) => {
            const els = Array.from(doc.querySelectorAll(sel));
            els.forEach(el => {
                const rawLabel = el.getAttribute(attr);
                // Skip external networks, data URIs, anchors, or existing blobs
                if (!rawLabel || rawLabel.startsWith('http') || rawLabel.startsWith('data:') || rawLabel.startsWith('blob:') || rawLabel.startsWith('#')) return;

                promises.push((async () => {
                    try {
                        const abs = PathResolver.resolve(identity.path, rawLabel);
                        const rawEssence = await FileSystemProvider.read({ ...identity, path: abs, kind: 'file' });
                        const blob = (rawEssence instanceof Blob) ? rawEssence : new Blob([rawEssence]);
                        el.setAttribute(attr, URL.createObjectURL(blob));
                    } catch (e) {
                        console.warn(`[AssetProcessor] B"H - Failed to gather spark for: ${rawLabel}`);
                    }
                })());
            });
        });
        
        await Promise.all(promises);
    }
};
