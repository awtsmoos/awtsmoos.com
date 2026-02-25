
// B"H
// FILE: js/html-preview/processor.js

import { VirtualBundler } from './bundler.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';
import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';

/**
 * @class HTMLPreviewProcessor
 * @description The Orchestrator of the Vision. 
 * 
 * THE POEM OF THE VISION:
 * An HTML file is a skeleton of reality.
 * To see it live, we must breathe the light of the workspace into it.
 * This vessel finds every image, every script, every style,
 * and converts their relative names into actual Blob URLs,
 * then injects a network interceptor so that the internal 
 * 'fetch' calls within the preview also perceive the local truth.
 */
export const HTMLPreviewProcessor = {
    /**
     * @async
     * @function orchestrate
     * @description B"H. Transmutes an HTML file into a live preview.
     */
    async orchestrate(baseItem, iframe, contentOverride = null) {
        VirtualBundler.reset();
        
        let html = contentOverride;
        if (html === null) {
            const raw = await FileSystemProvider.read(baseItem);
            html = (raw instanceof Blob) ? await raw.text() : String(raw);
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Process Static Assets (Images/Video/CSS)
        await this._processStaticAssets(doc, baseItem);

        // 2. Process Scripts via AST Bundler
        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const s of scripts) {
            if (s.hasAttribute('data-merkava-internal')) continue;
            
            s.setAttribute('type', 'module'); // All scripts become modules in this world
            const src = s.getAttribute('src');
            
            if (src) {
                const abs = PathResolver.resolve(baseItem.path, src);
                s.setAttribute('src', await VirtualBundler.build(abs, baseItem, null));
            } else if (s.textContent.trim()) {
                const virtualPath = `${baseItem.path}/__inline_${Math.random().toString(36).substr(2, 5)}.js`;
                s.setAttribute('src', await VirtualBundler.build(virtualPath, baseItem, s.textContent));
                s.textContent = "";
            }
        }

        // 3. Construct Final Vessel
        let finalHtml = doc.documentElement.outerHTML;
        const interceptor = `<script data-merkava-internal="true">${getNetworkInterceptorScript(baseItem.workspaceId, baseItem.path)}</script>`;
        
        if (finalHtml.includes('<head>')) {
            finalHtml = finalHtml.replace('<head>', `<head>${interceptor}`);
        } else {
            finalHtml = interceptor + finalHtml;
        }

        const ifDoc = iframe.contentDocument || iframe.contentWindow.document;
        ifDoc.open(); ifDoc.write(finalHtml); ifDoc.close();
    },

    async _processStaticAssets(doc, item) {
        const assets = Array.from(doc.querySelectorAll('img[src], video[src], audio[src], link[rel="stylesheet"]'));
        
        await Promise.all(assets.map(async (el) => {
            const attr = el.tagName === 'LINK' ? 'href' : 'src';
            const rawPath = el.getAttribute(attr);
            if (!rawPath || rawPath.startsWith('http') || rawPath.startsWith('data:')) return;

            try {
                const abs = PathResolver.resolve(item.path, rawPath);
                const content = await FileSystemProvider.read({ ...item, path: abs, kind: 'file' });
                const blob = (content instanceof Blob) ? content : new Blob([content]);
                el.setAttribute(attr, URL.createObjectURL(blob));
            } catch (e) {}
        }));
    }
};
