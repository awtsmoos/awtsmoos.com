
// B"H
/**
 * @file grass.js
 * @module GrassMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE MANIFESTATION OF THE HAIR OF THE EARTH — Grass Material Factory             ║
 * ║                                                                                  ║
 * ║  Now replete with diagnostic vision. If the Divine Light (texture)               ║
 * ║  cannot be drawn down, we log it and proceed with pure color.                    ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

// B"H: The 5 levels of ascent to the root of the shaders!
import { GRASS_SNIPPETS } from '../../../../../shaders/GrassShader.js';

export default async function createGrass(olam) {
    console.log("B\"H - 🌱 [Grass Factory] Initiated. Drawing down texture...");
    let grassTex = null;

    if (olam && typeof olam.loadTexture === 'function') {
        try {
            grassTex = await olam.loadTexture({ 
                url: 'awtsmoostex://safegrass', 
                shouldRepeat: true, 
                repeatX: 2, 
                repeatY: 2 
            });
            console.log("B\"H - 🌱 [Grass Factory] Texture mapped successfully.");
        } catch (e) {
            console.warn("B\"H - ⚠️ [Grass Factory] Failed to load texture awtsmoostex://safegrass:", e);
        }
    } else {
        console.warn("B\"H - ⚠️ [Grass Factory] Missing Olam context! Proceeding without texture.");
    }

    return {
        type: 'Lambert',
        properties: { 
            color: 0xffffff, // White base to let snippets/texture drive color
            map: grassTex,
            side: 2,
            alphaTest: 0.5,
            transparent: true
        },
        snippets: GRASS_SNIPPETS
    };
}
