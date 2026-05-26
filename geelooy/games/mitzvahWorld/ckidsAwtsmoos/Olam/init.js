
// B"H
/**
 * @file init.js
 * @description
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *  CHAPTER 12: THE MERCY OF THE FALLBACK (CHESED)
 *  
 *  "A bruised reed He will not break..." (Yeshayahu 42:3)
 *  When the Olam awakens, it attempts to forge the great GLTFLoader.
 *  If the loader lacks the specific method `setDRACOLoader`, earlier 
 *  incarnations would shatter the world with a TypeError. Now, we wrap 
 *  the attachment in absolute grace, checking its existence before invoking.
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import { DRACOLoader } from "/games/scripts/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";

export default async function(olam) {
    // B"H: silent

    
    if (!olam.loader) {
        console.warn("B\"H - ⚠️ 'olam.loader' was absent from the void. Creating a new GLTFLoader sentinel.");
        olam.loader = new GLTFLoader();
    }

    try {
        const dracoLoader = new DRACOLoader();
        
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.170.0/examples/jsm/libs/draco/');
        
        if (typeof dracoLoader.preload === 'function') {
            dracoLoader.preload();
        }

        // B"H THE ULTIMATE SHIELD: Check if the method exists before calling!
        if (olam.loader && typeof olam.loader.setDRACOLoader === 'function') {
            olam.loader.setDRACOLoader(dracoLoader);
            // B"H: silent

        } else {
            console.warn("B\"H - ⚠️ Loader vessel rejected Draco attachment (method missing). Continuing with standard speech.");
        }

    } catch (e) {
        console.error("B\"H - 🚨 Draco manifestation shattered. Reality will proceed through standard GLB only.", e);
    }
    
    return true; 
}
