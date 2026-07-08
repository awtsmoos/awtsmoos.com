
// B"H
/**
 * @file bark.js
 * @module BarkMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE CRUST OF THE TREE — Bark Material Factory                                  ║
 * ║                                                                                  ║
 * ║  With deep logs to track the descent of the bark texture.                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

// B"H: The 5 levels of ascent
import { BARK_SNIPPETS } from '../../../../../shaders/BarkShader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default async function createBark(olam) {
    console.log("B\"H - 🪵 [Bark Factory] Initiated. Extracting bark essence...");
    let barkTex = null;

    if (olam && typeof olam.loadTexture === 'function') {
        try {
            barkTex = await olam.loadTexture({ 
                url: 'awtsmoostex://bark', 
                shouldRepeat: true, 
                repeatX: 6,   // B"H: Wraps 6x around the cylinder circumference
                repeatY: 3    // B"H: 3 vertical repeats for reasonable grain density
            });

            console.log("B\"H - 🪵 [Bark Factory] Texture mapped successfully.");
        } catch(e) {
            console.warn("B\"H - ⚠️ [Bark Factory] Failed to load texture awtsmoostex://bark:", e);
        }
    } else {
        console.warn("B\"H - ⚠️ [Bark Factory] Missing Olam context! Proceeding with pure color.");
    }

    return {
        type: 'Lambert',
        properties: { 
            color: 0xffffff, // B"H: Pure white base prevents void-black multiplication!
            map: barkTex 
        },
        snippets: BARK_SNIPPETS
    };
}
