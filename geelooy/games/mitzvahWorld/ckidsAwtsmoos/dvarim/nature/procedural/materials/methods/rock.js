
// B"H
/**
 * @file rock.js
 * @module RockMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE FOUNDATION OF THE DWELLING — Rock Material Factory                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

// B"H: The 5 levels of ascent
import { ROCK_SNIPPETS, getRockUniforms } from '../../../../../shaders/RockShader.js';

export default async function createRock(olam, type = 'granite') {
    console.log("B\"H - 🪨 [Rock Factory] Initiated. Drawing down stone essence...");
    
    const rockSubtype = type.includes('granite')   ? 'granite' 
                      : type.includes('sandstone') ? 'sandstone' 
                      : type.includes('basalt')    ? 'basalt' 
                      : 'granite';

    let rockTex = null;
    if (olam && typeof olam.loadTexture === 'function') {
        try {
            rockTex = await olam.loadTexture({ 
                url: 'awtsmoostex://stone', 
                shouldRepeat: true, 
                repeatX: 2, 
                repeatY: 2 
            });
            console.log("B\"H - 🪨 [Rock Factory] Texture mapped successfully.");
        } catch(e) {
            console.warn("B\"H - ⚠️ [Rock Factory] Failed to load texture awtsmoostex://stone:", e);
        }
    } else {
        console.warn("B\"H - ⚠️ [Rock Factory] Missing Olam context! Proceeding with pure color.");
    }

    const uniforms = getRockUniforms(rockSubtype);

    return {
        type: 'Lambert',
        properties: { 
            color: 0x888888, 
            map: rockTex 
        },
        snippets: ROCK_SNIPPETS,
        customUniforms: {
            uColorBase: uniforms.uColorBase.value,
            uColorMoss: uniforms.uColorMoss.value
        }
    };
}
