// B"H
/**
 * @file tablets.js
 * @brief This module manifests the two sacred Tablets of the Covenant.
 */

// B"H - A helper to create a single tablet block.
function createTablet(id, dims, material, position) {
    return {
        id: id,
        primitive: 'cube',
        parameters: { size: 1.0 },
        shaderVars: material,
        modifiers: [
            { type: 'scaleMesh', scale: dims }
        ],
        keyframes: [{ time: 0, position: position }]
    };
}

/**
 * B"H - Assembles the two Tablets, positioned to lie side-by-side.
 * @param {object} dims - The inner dimensions of the Ark {l, w, h}.
 * @returns {object} A scene object containing both tablets.
 */
export function createTablets({ l, w, h, thickness }) {
    const tabletMaterial = { 
        uMaterialType: 'reflective', 
        uBaseColor: [0.2, 0.3, 0.9], // Sapphire Blue
        uMetallic: 0.1, 
        uRoughness: 0.6 
    };

    const innerL = l - thickness * 4;
    const innerW = w - thickness * 4;
    const tabletH = 0.2 * h;
    const gap = 0.05 * h;

    const tabletW = (innerW / 2) - gap;
    const tabletL = innerL - (gap * 2);

    const tablet1 = createTablet(
        'luchot_tablet_1',
        [tabletL, tabletH, tabletW],
        tabletMaterial,
        [0, 0, -innerW/4] // Positioned on the left side
    );

    const tablet2 = createTablet(
        'luchot_tablet_2',
        [tabletL, tabletH, tabletW],
        tabletMaterial,
        [0, 0, innerW/4]  // Positioned on the right side
    );

    return {
        id: 'luchot_tablets',
        primitive: 'none',
        children: [tablet1, tablet2],
        // Positioned at the bottom of the Ark's interior
        keyframes: [{ time: 0, position: [0, -h/2 + tabletH/2 + thickness*2, 0] }]
    };
}
