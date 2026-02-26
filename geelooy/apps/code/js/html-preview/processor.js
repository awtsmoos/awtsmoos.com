
// B"H
// FILE: js/html-preview/processor.js

import { VirtualBundler } from './bundler.js';
import { FileSystemProvider } from '../fs-provider.js';
import { AssetProcessor } from './asset-processor.js';
import { ScriptExtractor } from './script-extractor.js';
import { IframeInjector } from './iframe-injector.js';
import { State } from '../state.js'; // B"H - Added State for fallback lookup

export const HTMLPreviewProcessor = {
    async orchestrate(baseItem, iframe, contentOverride = null, tabId = null) {
        if (!iframe || !iframe.parentNode) return;

        const identity = {
            workspaceId: baseItem.workspaceId || baseItem.id,
            type: baseItem.originalType || baseItem.type,
            path: baseItem.path
        };

        // B"H - The Ultimate Safeguard: Ensure we never query the file system for a virtual tab type.
        if (identity.type === 'html-preview-file' || identity.type === 'html-preview') {
            const ws = State.workspaces.find(w => String(w.id) === String(identity.workspaceId));
            if (ws) {
                identity.type = ws.originalType || ws.type;
            } else {
                identity.type = 'local'; // Final fallback to prevent Sentinel blockage
            }
        }

        console.log(`%c[PreviewProcessor] B"H - Commencing Vision: ${identity.path}[Physical Type: ${identity.type}]`, "color: #a8ff00; font-weight: bold;");
        VirtualBundler.reset();

        let rawHtml = contentOverride;
        if (rawHtml === null) {
            try {
                const raw = await FileSystemProvider.read(identity);
                rawHtml = raw;
            } catch (e) { 
                return IframeInjector.writeError(iframe, `Vessel Retrieval Failed: ${e.message}`); 
            }
        }
        
        // Unwrap the Blob before parsing
        if (rawHtml instanceof Blob) {
            rawHtml = await rawHtml.text();
        } else if (rawHtml && rawHtml.base64Content) {
            rawHtml = atob(rawHtml.base64Content);
        } else if (typeof rawHtml !== 'string') {
            rawHtml = String(rawHtml);
        }

        if (!rawHtml) return IframeInjector.writeError(iframe, "The HTML vessel is void.");

        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

        await AssetProcessor.process(doc, identity);
        await ScriptExtractor.process(doc, identity);

        IframeInjector.inject(doc, iframe, identity, tabId);
    }
};
