
// B"H
/**
 * @file leaf.js
 * @module LeafMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE RADIANCE OF THE BRANCH — Leaf Material Factory                             ║
 * ║                                                                                  ║
 * ║  Safely loads the leaf essence with verbose tracking.                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

// B"H: The 5 levels of ascent
import { LEAF_SNIPPETS } from '../../../../../shaders/LeafShader.js';

export default async function createLeaf(olam) {
    console.log("B\"H - 🍃 [Leaf Factory] Initiated. Drawing down chlorophyll nitzotzos...");
    let leafTex = null;

    if (olam && typeof olam.loadTexture === 'function') {
        try {
            leafTex = await olam.loadTexture({ 
                url: 'awtsmoostex://leaf', 
                shouldRepeat: true,
                repeatX: 1,
                repeatY: 1
            });
            console.log("B\"H - 🍃 [Leaf Factory] Texture mapped successfully.");
        } catch(e) {
            console.warn("B\"H - ⚠️ [Leaf Factory] Failed to load texture awtsmoostex://leaf:", e);
        }
    } else {
         console.warn("B\"H - ⚠️ [Leaf Factory] Missing Olam context! Proceeding with pure color.");
    }

    return {
        type: 'Lambert',
        properties: { 
            color: 0xffffff, // B"H: Pure white base so the shader uniform colors don't multiply to black!
            side: 2, // DoubleSide
            map: leafTex,
            alphaTest: 0.5,
            transparent: true
        },
        snippets: LEAF_SNIPPETS
    };
}
