// B"H
import { createHollowBox } from './box.js';
import { createCoverAssembly } from './cover.js';
import { createPolesAndRings } from './transport.js';
import { createTablets } from './tablets.js';

/**
 * @file arkGenerator.js
 * @brief This module contains the master function to assemble the Ark of the Covenant,
 *        defining its structure, hierarchy, and self-contained animation.
 */

/**
 * B"H - Assembles the complete Ark of the Covenant, including geometry and animation tracks.
 * @param {object} config - Configuration object, e.g., { h: base_unit, position: [x,y,z] }.
 * @returns {object} An object containing the root scene object and its animation tracks.
 */
export function createArkAssembly({ h = 1.0, position = [0,0,0] }) {
    const l = 1.25 * h; // B"H - Reduced by half from 2.5
    const w = 0.75 * h; // B"H - Reduced by half from 1.5
    const height = 1.5 * h;
    const thickness = 0.05 * h;

    // B"H - Corrected Materials for shininess
    const goldMaterial = { uMaterialType: 'reflective', uBaseColor: [0.83, 0.68, 0.21], uMetallic: 1.0, uRoughness: 0.05 };
    const woodMaterial = { uMaterialType: 'reflective', uBaseColor: [0.3, 0.15, 0.05], uRoughness: 0.9, uTexture: 'oak', uTextureScale: 0.5 };

    const outerBox = createHollowBox([l, height, w], goldMaterial, 'aron_outer_gold', thickness);
    const woodBox = createHollowBox([l - thickness*2, height, w - thickness*2], woodMaterial, 'aron_wood', thickness);
    const innerBox = createHollowBox([l - thickness*4, height, w - thickness*4], goldMaterial, 'aron_inner_gold', thickness);
    
    // B"H - Tablets temporarily removed for testing
    // const tablets = createTablets({ l, w, h, thickness });

    const [rings, poles] = createPolesAndRings(h, l, w, height);
    const cover = createCoverAssembly(h, l, w);

    // B"H - Corrected cover position to be exactly the top of the Ark body.
    const tracks = {
        'ark_cover_explode': { keyframes: [ 
            { time: 0, position: [0, height/2, 0] }, { time: 2, position: [0, height/2, 0] }, 
            { time: 5, position: [0, 5, 0] }, { time: 7, position: [0, 5, 0] }, { time: 10, position: [0, height/2, 0] } 
        ] },
        'ark_poles_left_explode': { keyframes: [ 
            { time: 0, position: [0, -height/4, -w/2] }, { time: 2, position: [0, -height/4, -w/2] }, 
            { time: 5, position: [-8, -height/4, -w/2] }, { time: 7, position: [-8, -height/4, -w/2] }, { time: 10, position: [0, -height/4, -w/2] } 
        ] },
        'ark_poles_right_explode': { keyframes: [ 
            { time: 0, position: [0, -height/4, w/2] }, { time: 2, position: [0, -height/4, w/2] }, 
            { time: 5, position: [8, -height/4, w/2] }, { time: 7, position: [8, -height/4, w/2] }, { time: 10, position: [0, -height/4, w/2] } 
        ] },
        'ark_tablets_explode': { keyframes: [
            { time: 0, position: [0, 0, 0] }, { time: 2, position: [0, 0, 0] },
            { time: 5, position: [0, 2.5, 0] }, { time: 7, position: [0, 2.5, 0] }, { time: 10, position: [0, 0, 0] }
        ] },
        'ark_inner_explode': { keyframes: [ 
            { time: 0, position: [0, 0, 0] }, { time: 2, position: [0, 0, 0] }, 
            { time: 5, position: [0, 2, 0] }, { time: 7, position: [0, 2, 0] }, { time: 10, position: [0, 0, 0] } 
        ] },
        'ark_wood_explode': { keyframes: [ 
            { time: 0, position: [0, 0, 0] }, { time: 2, position: [0, 0, 0] }, 
            { time: 5, position: [0, 1, 0] }, { time: 7, position: [0, 1, 0] }, { time: 10, position: [0, 0, 0] } 
        ] }
    };
    
    // B"H - Re-enable cover animation
    cover.animations = [{ track: 'ark_cover_explode' }];
    // poles.children[0].animations = [{ track: 'ark_poles_left_explode' }];
    // poles.children[1].animations = [{ track: 'ark_poles_right_explode' }];
    // tablets.animations = [{ track: 'ark_tablets_explode' }];
    
    innerBox.animations = [{ track: 'ark_inner_explode' }];
    woodBox.animations = [{ track: 'ark_wood_explode' }];

    
    const root = {
        id: 'ark_assembly',
        primitive: 'none',
        children: [ 
            outerBox,
            woodBox,
            innerBox,
            rings,
            cover
            // B"H - All extra components removed to isolate the core form.
            // poles, 
            // tablets,
        ],
        keyframes: [{ time: 0, position }]
    };

    return { root, tracks };
}