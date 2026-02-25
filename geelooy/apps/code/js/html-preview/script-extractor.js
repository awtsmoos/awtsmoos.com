
// B"H
// FILE: js/html-preview/script-extractor.js

import { VirtualBundler } from './bundler.js';
import { PathResolver } from './resolver.js';

/**
 * @class ScriptExtractor
 * @description A dedicated vessel to iterate over HTML `<script>` tags, 
 * pass them to the bundler, and re-inject the Blob URLs.
 */
export const ScriptExtractor = {
    async process(doc, identity) {
        const allScripts = Array.from(doc.querySelectorAll('script'));
        const siblingPath = identity.path.substring(0, identity.path.lastIndexOf('/') + 1);

        for (let i = 0; i < allScripts.length; i++) {
            const script = allScripts[i];
            if (script.hasAttribute('data-merkava-internal')) continue;
            
            // Force all scripts to be modules to support internal ES imports
            script.setAttribute('type', 'module');
            
            try {
                const srcLabel = script.getAttribute('src');
                if (srcLabel) {
                    console.log(`\n%c[ScriptExtractor] B"H - Found HTML <script src="${srcLabel}">`, "color: #ff00ff; font-weight:bold;");
                    const absCoord = PathResolver.resolve(identity.path, srcLabel);
                    const blobUrl = await VirtualBundler.build(absCoord, identity, null);
                    console.log(`[ScriptExtractor] B"H - HTML <script> Replaced: ${srcLabel} -> ${blobUrl}`);
                    script.setAttribute('src', blobUrl);
                } else if (script.textContent.trim()) {
                    const virtual = `${siblingPath}__manifested_script_${i}_${Math.random().toString(36).substr(2, 5)}.js`;
                    console.log(`\n%c[ScriptExtractor] B"H - Manifesting Inline HTML Script at virtual sibling: ${virtual}`, "color: #ff00ff; font-weight:bold;");
                    script.setAttribute('src', await VirtualBundler.build(virtual, identity, script.textContent));
                    script.textContent = ""; 
                }
            } catch (e) { 
                console.error(`[ScriptExtractor] Script ${i} Transmutation Shevirah`, e); 
            }
        }
    }
};
