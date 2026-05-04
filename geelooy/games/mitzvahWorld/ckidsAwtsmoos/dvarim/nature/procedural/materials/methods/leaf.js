// B"H
/**
 * @file leaf.js
 * @module LeafMaterialGenerator
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE RADIANCE OF THE BRANCH — Leaf Material Factory                             ║
 * ║                                                                                  ║
 * ║  Leaves that capture the light of the sun and turn it into life.                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { LEAF_SNIPPETS } from '../../../../shaders/LeafShader.js';

export default async function createLeaf(olam) {
    const leafTex = await olam.loadTexture({ 
        url: 'awtsmoostex://leaf', 
        shouldRepeat: true,
        repeatX: 1,
        repeatY: 1
    });

    return {
        type: 'Lambert',
        properties: { 
            color: 0x228b22, 
            side: 2, // DoubleSide
            map: leafTex,
            alphaTest: 0.5,
            transparent: true
        },
        snippets: LEAF_SNIPPETS
    };
}
