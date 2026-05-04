// B"H
/**
 * @file grass.js
 * @module GrassMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE MANIFESTATION OF THE HAIR OF THE EARTH — Grass Material Factory             ║
 * ║                                                                                  ║
 * ║  As the Awtsmoos commands the earth to bring forth grass,                        ║
 * ║  so too does this vessel arrange the letters of the Lambertian garment.          ║
 * ║  No direct reference to the "THREE" entity is found here;                        ║
 * ║  it is all pure data, destined to be compiled into a Divine Form.                ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { GRASS_SNIPPETS } from '../../../../shaders/GrassShader.js';

export default async function createGrass(olam) {
    // B"H: silent
    
    // B"H: Use the world context to load the texture via protocol
    const grassTex = await olam.loadTexture({ 
        url: 'awtsmoostex://safegrass', 
        shouldRepeat: true, 
        repeatX: 2, 
        repeatY: 2 
    });

    // B"H: silent

    // B"H: Return the pure data for material creation
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
