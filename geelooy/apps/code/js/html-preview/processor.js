
// B"H
// FILE: js/html-preview/processor.js

import { VirtualBundler } from './bundler.js';
import { getNetworkInterceptorScript } from './html-preview-templates.js';
import { FileSystemProvider } from '../fs-provider.js';
import { PathResolver } from './resolver.js';

export const HTMLPreviewProcessor = {
    async orchestrate(baseItem, iframe, contentOverride = null) {
        if (!iframe || !iframe.parentNode) return;

        const identity = {
            workspaceId: baseItem.workspaceId || baseItem.id,
            type: baseItem.originalType || baseItem.type,
            path: baseItem.path
        };

        console.log(`%c[PreviewProcessor] B"H - Commencing Vision Orchestration: ${identity.path}`, "color: #a8ff00; font-weight: bold;");
        VirtualBundler.reset();

        let rawHtml = contentOverride;
        if (rawHtml === null) {
            try {
                const raw = await FileSystemProvider.read(identity);
                rawHtml = (raw instanceof Blob) ? await raw.text() : String(raw);
            } catch (e) { return this._err(iframe, `Vessel Retrieval Failed: ${e.message}`); }
        }
        if (!rawHtml) return this._err(iframe, "The HTML vessel is void.");

        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

        await this._processPhysicalAssets(doc, identity);

        const allScripts = Array.from(doc.querySelectorAll('script'));
        const siblingPath = identity.path.substring(0, identity.path.lastIndexOf('/') + 1);

        for (let i = 0; i < allScripts.length; i++) {
            const script = allScripts[i];
            if (script.hasAttribute('data-merkava-internal')) continue;
            
            script.setAttribute('type', 'module');
            
            try {
                const srcLabel = script.getAttribute('src');
                if (srcLabel) {
                    console.log(`\n%c[PreviewProcessor] B"H - Found HTML <script src="${srcLabel}">`, "color: #ff00ff; font-weight:bold;");
                    const absCoord = PathResolver.resolve(identity.path, srcLabel);
                    const blobUrl = await VirtualBundler.build(absCoord, identity, null);
                    console.log(`[PreviewProcessor] B"H - HTML <script> Replaced: ${srcLabel} -> ${blobUrl}`);
                    script.setAttribute('src', blobUrl);
                } else if (script.textContent.trim()) {
                    const virtual = `${siblingPath}__manifested_script_${i}_${Math.random().toString(36).substr(2, 5)}.js`;
                    console.log(`\n%c[PreviewProcessor] B"H - Manifesting Inline HTML Script at virtual sibling: ${virtual}`, "color: #ff00ff; font-weight:bold;");
                    script.setAttribute('src', await VirtualBundler.build(virtual, identity, script.textContent));
                    script.textContent = ""; 
                }
            } catch (e) { console.error(`[Preview] Script ${i} Transmutation Shevirah`, e); }
        }

        this._finalizeVision(doc, iframe, identity);
    },

    async _processPhysicalAssets(doc, identity) {
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
                console.warn(`[Preview-Assets] Failed to gather spark: ${rawLabel}`, e);
            }
        }));
    },

    _finalizeVision(doc, iframe, identity) {
        try {
            const shield = `<script data-merkava-internal="true">${getNetworkInterceptorScript(identity.workspaceId, identity.path)}</script>`;
            let htmlText = doc.documentElement.outerHTML;
            
            htmlText = htmlText.includes('<head>') ? htmlText.replace('<head>', `<head>${shield}`) : shield + htmlText;
            
            const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
            frameDoc.open(); 
            frameDoc.write("<!DOCTYPE html>\n" + htmlText); 
            frameDoc.close();
            console.log(`%c[PreviewProcessor] B"H - VISION ESTABLISHED.`, "color: #a8ff00; font-weight: bold;");
        } catch (e) { this._err(iframe, `Final Manifestation failed: ${e.message}`); }
    },

    _err(iframe, msg) {
        const d = iframe.contentDocument || iframe.contentWindow.document;
        d.open(); 
        d.write(`<body style="background:#050505;color:#f75d65;padding:40px;font-family:monospace;line-height:1.8;">
            <h3 style="border-bottom:1px solid #f75d65;padding-bottom:12px;">B"H - Preview Failed</h3>
            <p>${msg}</p>
        </body>`); 
        d.close();
    }
};
