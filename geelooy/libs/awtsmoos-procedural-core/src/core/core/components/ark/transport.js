//B"H

/**
 * @file transport.js
 * @brief Provides functions for generating the Ark's carrying poles and rings.
 */
export function createPolesAndRings(h, l, w, height) {
    const goldMaterial = { uMaterialType: 'reflective', uBaseColor: [0.83, 0.68, 0.21], uMetallic: 1.0, uRoughness: 0.2 };
    const ring = { primitive: 'torus', parameters: { radius: 0.15 * h, tube: 0.05 * h, radialSegments: 12, tubularSegments: 24, smooth: true }, shaderVars: goldMaterial };
    const rings = { id: 'rings_group', primitive: 'none', children: [
        {...ring, id: 'ring_fl', keyframes: [{ time: 0, position: [-l/2, -height/4, w/2], rotation: [Math.PI/2, 0, 0]}] },
        {...ring, id: 'ring_fr', keyframes: [{ time: 0, position: [l/2, -height/4, w/2], rotation: [Math.PI/2, 0, 0]}] },
        {...ring, id: 'ring_bl', keyframes: [{ time: 0, position: [-l/2, -height/4, -w/2], rotation: [Math.PI/2, 0, 0]}] },
        {...ring, id: 'ring_br', keyframes: [{ time: 0, position: [l/2, -height/4, -w/2], rotation: [Math.PI/2, 0, 0]}] }
    ]};
    const pole = { primitive: 'cylinder', parameters: { radiusTop: 0.04 * h, radiusBottom: 0.04 * h, height: 10 * h, radialSegments: 16, smooth: true }, shaderVars: goldMaterial };
    const poles = { id: 'poles_group', primitive: 'none', children: [
        // B"H - CORRECTED ROTATION: Rotated around Z-axis to align with X-axis.
        {...pole, id: 'pole_left', keyframes: [{ time: 0, rotation: [0, 0, Math.PI/2]}] },
        {...pole, id: 'pole_right', keyframes: [{ time: 0, rotation: [0, 0, Math.PI/2]}] }
    ]};
    return [rings, poles];
}
