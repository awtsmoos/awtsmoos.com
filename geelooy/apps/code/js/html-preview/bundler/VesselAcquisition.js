
// B"H
/**
 * @file VesselAcquisition.js
 * @brief Retrieves the raw light from the physical disk for the Bundler.
 */

import { FileSystemProvider } from '../../fs-provider.js';

export const VesselAcquisition = {
    async fetch(absPath, identity) {
        console.log("[Acquisition] B\"H - Attempting to gather essence for: " + absPath);

        // 1. CELESTIAL CHECK
        if (absPath.startsWith('/scripts/') || absPath === '/register.js') {
            const res = await fetch(absPath);
            if (!res.ok) {
                console.error("[Acquisition] B\"H - Celestial script absent: " + absPath);
                throw new Error("System script missing: " + absPath);
            }
            const text = await res.text();
            console.log("[Acquisition] B\"H - Celestial script gathered. Measure: " + text.length + " chars.");
            return text;
        }

        // 2. EARTHLY PHYSICAL STRIKE
        try {
            const raw = await FileSystemProvider.read({ 
                ...identity, 
                path: absPath, 
                kind: 'file' 
            });

            if (raw === undefined || raw === null) {
                console.warn("[Acquisition] B\"H - Vessel " + absPath + " yielded the Void (null/undefined).");
                throw new Error("The physical anchor for " + absPath + " returned nothingness.");
            }

            let essence = "";
            if (raw instanceof Blob) {
                essence = await raw.text();
            } else if (typeof raw === 'string') {
                essence = raw;
            } else if (raw.base64Content) {
                essence = atob(raw.base64Content);
            } else {
                essence = String(raw);
            }

            console.log("[Acquisition] B\"H - Physical essence secured for " + absPath + ". Measure: " + essence.length + " characters.");
            
            if (essence.length === 0) {
                console.warn("[Acquisition] B\"H - WARNING: Manifested essence is EMPTY for " + absPath + ".");
            }

            return essence;

        } catch (shevirah) {
            console.error("[Acquisition] B\"H - Shattering during retrieval of " + absPath + ":", shevirah);
            throw shevirah;
        }
    }
};
