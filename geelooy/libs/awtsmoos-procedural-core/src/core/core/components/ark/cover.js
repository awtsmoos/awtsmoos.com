//B"H

/**
 * @file cover.js
 * @brief Provides functions to generate the Ark's cover, cherubim, and crown.
 */

export function createCherub(id, position, rotationY, h) {
    // B"H - This function is currently not used, kept for future revelation.
    return {
        id: id, primitive: 'cube', parameters: { size: 0.1, color: [0.9, 0.8, 0.5, 1.0] },
        modifiers: [
            { type: 'scaleMesh', scale: [2, 5, 2] },
            { type: 'extrude', face: 4, amount: 0.8 }, { type: 'scaleFace', face: 4, amount: 2.0 }, { type: 'rotateFace', face: 4, axis: 'x', angle: -0.8 },
            { type: 'extrude', face: 5, amount: 0.8 }, { type: 'scaleFace', face: 5, amount: 2.0 }, { type: 'rotateFace', face: 5, axis: 'x', angle: -0.8 },
        ],
        keyframes: [{ time: 0, position: position, rotation: [0, rotationY, 0], scale: [h * 0.15, h * 0.15, h * 0.15] }]
    };
}

export function createCrown(h, l, w) {
    // B"H - This function is currently not used, kept for future revelation.
    const goldMaterial = { uMaterialType: 'reflective', uBaseColor: [0.83, 0.68, 0.21], uMetallic: 1.0, uRoughness: 0.2 };
    const segW = 0.05 * h, segH = 0.1 * h;
    const segDef = {
        primitive: 'cube', parameters: { size: 1.0 },
        modifiers: [ { type: 'scaleMesh', scale: [segW, segH, segW] }, { type: 'translateVertex', face: 2, vertex: 0, translation: [0, segH, 0]}, { type: 'translateVertex', face: 2, vertex: 1, translation: [0, segH, 0]} ]
    };
    const countL = Math.floor(l / segW), countW = Math.floor(w / segW);
    const arrL = { type: 'array', params: { count: countL, offset: [segW, 0, 0] } };
    const arrW = { type: 'array', params: { count: countW, offset: [segW, 0, 0] } };
    return {
        id: 'zer_crown', primitive: 'none', shaderVars: goldMaterial,
        children: [
            { id: 'zer_front', ...segDef, modifiers: [...segDef.modifiers, arrL], keyframes: [{ time: 0, position: [-l/2, 0, w/2] }] },
            { id: 'zer_back', ...segDef, modifiers: [...segDef.modifiers, arrL], keyframes: [{ time: 0, position: [-l/2, 0, -w/2] }] },
            { id: 'zer_left', ...segDef, modifiers: [...segDef.modifiers, arrW], keyframes: [{ time: 0, position: [-l/2, 0, w/2], rotation: [0, -Math.PI/2, 0] }] },
            { id: 'zer_right', ...segDef, modifiers: [...segDef.modifiers, arrW], keyframes: [{ time: 0, position: [l/2, 0, w/2], rotation: [0, -Math.PI/2, 0] }] }
        ]
    };
}

export function createCoverAssembly(h, l, w) {
    const goldMaterial = { uMaterialType: 'reflective', uBaseColor: [0.83, 0.68, 0.21], uMetallic: 1.0, uRoughness: 0.05 };
    const coverHeight = 0.4 * h; // B"H - Increased thickness to give visible substance.

    const coverSlab = {
        id: 'kapporet_slab',
        primitive: 'cube',
        parameters: { size: 1.0 },
        modifiers: [{ type: 'scaleMesh', scale: [l, coverHeight, w] }],
        shaderVars: goldMaterial,
        // B"H - Translate slab up so its bottom is at the assembly's origin.
        keyframes: [{ time: 0, position: [0, coverHeight / 2, 0] }]
    };

    return {
        id: 'kapporet_assembly',
        primitive: 'none',
        children: [
            coverSlab
            // B"H - Cherubim and Crown removed as per divine instruction for simplicity.
        ]
    };
}