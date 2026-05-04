// B"H
/**
 * @file rock.js
 * @module RockMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE FOUNDATION OF THE DWELLING — Rock Material Factory                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { ROCK_SNIPPETS, getRockUniforms } from '../../../../shaders/RockShader.js';

export default async function createRock(olam, type) {
    const rockSubtype = type.includes('granite')   ? 'granite'
                      : type.includes('sandstone') ? 'sandstone'
                      : type.includes('basalt')    ? 'basalt'
                      : 'granite';

    const rockTex = await olam.loadTexture({ 
        url: 'awtsmoostex://stone', 
        shouldRepeat: true, 
        repeatX: 2, 
        repeatY: 2 
    });

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
