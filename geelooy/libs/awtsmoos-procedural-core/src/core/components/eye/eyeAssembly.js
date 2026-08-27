
// B"H
/**
 * @file eyeAssembly.js
 * @brief Manifests the Ocular System as an independent entity to be parented to the skull.
 */
import { getQuadrantLidMesh } from './eyelids.js';

export function createEyeAssembly(id) {
    const irisColor = [0.1, 0.4, 0.8];
    const lidShader = { uMaterialType: 'skin', uBaseColor: [0.94, 0.76, 0.64] };
    const eyeWhiteShader = { uMaterialType: 'reflective', uBaseColor: [0.98, 0.98, 1.0], uRoughness: 0.1 };
    
    // B"H - Increased radius for clear visibility
    const EYE_RADIUS = 0.35;

    // Standard Eye Sphere
    const eyeball = {
        id: `${id}_eyeball`,
        primitive: 'sphere',
        parameters: { radius: EYE_RADIUS, widthSegments: 24, heightSegments: 16, smooth: true },
        shaderVars: eyeWhiteShader,
        children: [
            {
                id: `${id}_iris`,
                primitive: 'sphere',
                parameters: { radius: EYE_RADIUS * 0.55, color: [...irisColor, 1.0], smooth: true },
                keyframes: [{ time: 0, position: [0, 0, EYE_RADIUS * 0.85] }] 
            }
        ]
    };

    // Scale lids to match the new eye radius
    const lidScale = EYE_RADIUS / 1.15; // Lid mesh base radius is ~1.15
    
    const topLid = {
        id: `${id}_lid_top`,
        primitive: 'none',
        ...getQuadrantLidMesh(true),
        shaderVars: lidShader,
        keyframes: [{ time: 0, scale: [lidScale, lidScale, lidScale] }]
    };
    
    const bottomLid = {
        id: `${id}_lid_bottom`,
        primitive: 'none',
        ...getQuadrantLidMesh(false),
        shaderVars: lidShader,
        keyframes: [{ time: 0, scale: [lidScale, lidScale, lidScale] }]
    };

    return {
        id: id,
        primitive: 'none',
        children: [eyeball, topLid, bottomLid],
        keyframes: [{ time: 0, position: }]
    };
}
