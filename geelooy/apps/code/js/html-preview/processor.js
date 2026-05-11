
// B"H
/**
 * @file processor.js
 * @brief The Master of HTML Transmutation.
 * 
 * POEM OF THE DIVINE IMAGE:
 * A project is a thought in the mind of the soul,
 * But here it manifests, making it whole.
 * We resolve every script, we transmute every link,
 * Creating the world in the blink of a blink.
 * If a shattering happens, if a letter is missed,
 * The injector reports it, and the error's dismissed.
 */

import { VirtualBundler } from './bundler.js';
import { FileSystemProvider } from '../fs-provider.js';
import { AssetProcessor } from './asset-processor.js';
import { ScriptExtractor } from './script-extractor.js';
import { IframeInjector } from './iframe-injector.js';
import { DevToolsBridge } from '../devtools/bridge.js';

export const HTMLPreviewProcessor = {
    /**
     * B"H - Solidifies a file or string into a living iframe vision.
     * @param {Object} baseItem - Metadata for the project world.
     * @param {HTMLIFrameElement} iframe - The physical portal.
     * @param {string|null} contentOverride - Custom HTML to manifest.
     * @param {string|number|null} tabId - Unique session identity.
     */
    async orchestrate(baseItem, iframe, contentOverride = null, tabId = null) {
        // B"H - Check if the vessel is anchored
        if (!iframe) {
            console.error("[PreviewProcessor] B\"H - The portal is a nullity.");
            return;
        }

        const id = String(tabId || baseItem.id);
        const identity = {
            workspaceId: baseItem.workspaceId || baseItem.id,
            type: baseItem.originalType || baseItem.type,
            path: baseItem.path
        };

        // 1. SPIRITUAL ALIGNMENT
        // Awaken the bridge and register our presence
        DevToolsBridge.init();
        DevToolsBridge.getPersistentState(id);

        console.log(`B"H [PreviewProcessor] Initiating Vision for: ${baseItem.name} [ID: ${id}]`);
        
        // Purify the bundler's memory to start fresh
        VirtualBundler.reset();

        // 2. RETRIEVAL OF THE ESSENCE
        let rawHtml = contentOverride;
        
        if (!rawHtml || rawHtml === "") {
            try {
                const raw = await FileSystemProvider.read(identity);
                rawHtml = (raw instanceof Blob) ? await raw.text() : String(raw);
            } catch (e) { 
                console.error("[PreviewProcessor] B\"H - Retrieval Failure:", e);
                // Report to the iframe if it's currently attached
                return IframeInjector.writeError(iframe, "The physical vessel was unyielding: " + e.message); 
            }
        }
        
        if (!rawHtml || rawHtml.trim() === "") {
            return IframeInjector.writeError(iframe, "The vessel is void. No essence found at coordinates.");
        }

        try {
            // 3. STRUCTURAL ANALYSIS
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawHtml, 'text/html');

            // 4. TRANSMUTATION
            // Parallel ascent of assets and scripts
            await Promise.all([
                AssetProcessor.process(doc, identity),
                ScriptExtractor.process(doc, identity)
            ]);

            // 5. THE FINAL BREATH
            // Inject the transmuted truth into the sandbox
            await IframeInjector.inject(doc, iframe, identity, id);
            
        } catch (err) {
            console.error("B\"H [PreviewProcessor] Manifestation Shattered:", err);
            // Robust error reporting with null-safe injector
            IframeInjector.writeError(iframe, "A divine error occurred during manifestation: " + err.message);
        }
    }
};
