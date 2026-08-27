
// B"H
/**
 * @file script-extractor.js
 * @brief The Manifestor of Module Logic.
 */

import { VirtualBundler } from './bundler.js';
import { PathResolver } from './resolver.js';

export const ScriptExtractor = {
    async process(doc, identity) {
        const allScripts = Array.from(doc.querySelectorAll('script'));
        const siblingPath = identity.path.substring(0, identity.path.lastIndexOf('/') + 1);

        for (let i = 0; i < allScripts.length; i++) {
            const script = allScripts[i];
            if (script.hasAttribute('data-merkava-internal')) continue;
            
            script.setAttribute('type', 'module');
            
            try {
                const srcLabel = script.getAttribute('src');
                
                if (srcLabel) {
                    console.log("%c[ScriptExtractor] B\"H - Found <script src=\"" + srcLabel + "\">", "color: #ff00ff; font-weight:bold;");
                    
                    const absCoord = PathResolver.resolve(identity.path, srcLabel);
                    const blobUrl = await VirtualBundler.build(absCoord, identity, null);
                    
                    if (blobUrl) {
                        script.setAttribute('src', blobUrl);
                        console.log("[ScriptExtractor] B\"H - Replaced script conduit with Blob: " + blobUrl);
                    }
                } 
                else if (script.textContent.trim()) {
                    const randomSpark = Math.random().toString(36).substr(2, 5);
                    const virtualName = "__manifested_inline_" + i + "_" + randomSpark + ".js";
                    const virtualPath = siblingPath + virtualName;
                    
                    console.log("%c[ScriptExtractor] B\"H - Manifesting Inline Script at: " + virtualPath, "color: #ff00ff; font-weight:bold;");
                    
                    const manifestedBlob = await VirtualBundler.build(virtualPath, identity, script.textContent);
                    
                    if (manifestedBlob) {
                        script.setAttribute('src', manifestedBlob);
                        script.textContent = ""; 
                        console.log("[ScriptExtractor] B\"H - Inline script transfigured to Module Blob.");
                    }
                }
            } catch (shevirah) { 
                console.error("[ScriptExtractor] B\"H - Script " + i + " shattering event:", shevirah); 
                script.insertAdjacentHTML('beforebegin', "<!-- B\"H - Script Manifestation Failure: " + shevirah.message + " -->");
            }
        }
    }
};
