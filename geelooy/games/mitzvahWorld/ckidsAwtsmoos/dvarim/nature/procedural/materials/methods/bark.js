// B"H
/**
 * @file bark.js
 * @module BarkMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE CRUST OF THE TREE — Bark Material Factory                                  ║
 * ║                                                                                  ║
 * ║  Just as the skin protects the flesh, the bark protects the sap.                 ║
 * ║  This module creates the Lambertian garment for the tree's physical form.        ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { BARK_SNIPPETS } from '../../../../shaders/BarkShader.js';

export default async function createBark(olam) {
    const barkTex = await olam.loadTexture({ 
        url: 'awtsmoostex://bark', 
        shouldRepeat: true, 
        repeatX: 4, 
        repeatY: 4 
    });

    return {
        type: 'Lambert',
        properties: { 
            color: 0x4b3621, 
            map: barkTex 
        },
        snippets: BARK_SNIPPETS
    };
}
