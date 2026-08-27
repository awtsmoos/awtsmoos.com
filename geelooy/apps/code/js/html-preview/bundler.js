
// B"H
/**
 * @file bundler.js
 * @brief The Master of Module Transmutation (Modular Version).
 */

import { VesselAcquisition } from './bundler/VesselAcquisition.js';
import { BlobForge } from './bundler/BlobForge.js';
import { PreviewTransformer } from './transformer.js';
import { PathResolver } from './resolver.js';
import { CycleShield } from './cycle-shield.js';

export const VirtualBundler = {
    cache: new Map(),

    reset() {
        console.log("%c[VirtualBundler] B\"H - Purifying Memory... Revoking " + this.cache.size + " Blobs.", "color: #ffae57; font-weight: bold;");
        this.cache.forEach(url => URL.revokeObjectURL(url));
        this.cache.clear();
        CycleShield.reset();
    },

    async build(absPath, identity, sourceOverride = null) {
        if (this.cache.has(absPath)) {
            console.log("[Bundler] B\"H - Reconstituting cached vision for: " + absPath);
            return this.cache.get(absPath);
        }

        if (!CycleShield.enter(absPath)) {
            console.warn("[Bundler] B\"H - Infinite loop perceived at: " + absPath + ". Breaking recursion.");
            return this._circularManifest(absPath);
        }

        console.log("%c[Bundler] B\"H - WEAVING VESSEL: " + absPath, "color: #00f6ff; font-weight: bold;");

        try {
            let code = sourceOverride;
            if (code === null) {
                code = await VesselAcquisition.fetch(absPath, identity);
            } else {
                console.log("[Bundler] B\"H - Using source override for " + absPath + " (Measure: " + code.length + " chars)");
            }

            if (absPath.endsWith('.css')) {
                code = "const s = document.createElement('style'); s.textContent = " + JSON.stringify(code) + "; document.head.appendChild(s); export default s;";
            } else if (absPath.endsWith('.json')) {
                code = "export default " + code + ";";
            }

            const resolver = async (relLabel) => {
                const resolvedAbs = PathResolver.resolve(absPath, relLabel);
                if (resolvedAbs.startsWith('/') || relLabel.startsWith('.')) {
                    return await this.build(resolvedAbs, identity, null);
                }
                return "https://esm.sh/" + relLabel;
            };

            const transmuted = await PreviewTransformer.transform(code, resolver, absPath);
            const finalBlobUrl = BlobForge.solidify(transmuted, 'application/javascript');
            
            if (!finalBlobUrl) {
                throw new Error("The solidification of " + absPath + " resulted in nullity.");
            }

            this.cache.set(absPath, finalBlobUrl);
            CycleShield.exit(absPath);
            
            return finalBlobUrl;

        } catch (shevirah) {
            console.error("%c[Bundler] B\"H - Failure Manifested at " + absPath + ": " + shevirah.message, "color: #f75d65; font-weight: bold;");
            CycleShield.exit(absPath);
            return this._errorManifest(shevirah.message, absPath);
        }
    },

    _circularManifest(path) {
        const code = "console.warn(\"B\\\"H - Loop detected at " + path + ". Circular reference resolved to an empty object.\"); export default {};";
        return BlobForge.solidify(code);
    },

    _errorManifest(msg, path) {
        const code = "console.error(\"B\\\"H - [Manifestation Error] " + path + ": " + msg + "\"); export default {};";
        return BlobForge.solidify(code);
    }
};
