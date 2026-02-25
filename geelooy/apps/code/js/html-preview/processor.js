
// B"H
// FILE: js/html-preview/processor.js

import { VirtualBundler } from './bundler.js';
import { FileSystemProvider } from '../fs-provider.js';
import { AssetProcessor } from './asset-processor.js';
import { ScriptExtractor } from './script-extractor.js';
import { IframeInjector } from './iframe-injector.js';

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
            } catch (e) { 
                return IframeInjector.writeError(iframe, `Vessel Retrieval Failed: ${e.message}`); 
            }
        }
        if (!rawHtml) return IframeInjector.writeError(iframe, "The HTML vessel is void.");

        const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

        // 1. Resolve physical assets (img, link css)
        await AssetProcessor.process(doc, identity);

        // 2. Resolve Scripts (Virtual Bundler handles deep nesting)
        await ScriptExtractor.process(doc, identity);

        // 3. Inject Final Transfigured HTML into the Iframe
        IframeInjector.inject(doc, iframe, identity);
    }
};
