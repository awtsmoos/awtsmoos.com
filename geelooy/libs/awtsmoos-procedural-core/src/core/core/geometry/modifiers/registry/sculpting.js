
// B"H
/**
 * @file sculpting.js
 * @brief The Dictionary of Organic Deformation.
 */

import { sculptMeshModifier } from '../sculpt.js';
import { headSculptModifier } from '../headSculpt.js';
import { adaptiveSpherizeModifier } from '../adaptiveSubdivideSpherize.js';
import { nodeSculptModifier } from '../nodeSculpt.js';
import { applyAnatomicalSculpt } from '../anatomicalSculpt.js';
import {
    scaleRingsModifier,
    translateRingsModifier,
    frontalDisplaceRingsModifier,
    rotateRingsModifier,
    colorRingsModifier,
    weightRingsModifier,
    subdivideRingsModifier
} from '../ringModifiers.js';

export const SCULPTING_MODIFIERS = {
    'sculpt': (mesh, mod, params) => sculptMeshModifier(mesh, params.center, params.radius, params.amount, params.falloff, params.noise),
    'headSculpt': (mesh, mod, params) => headSculptModifier(mesh, params),
    'adaptiveSpherize': (mesh, mod, params) => adaptiveSpherizeModifier(mesh, params),
    
    // B"H - The ultimate procedural displacement engine!
    'nodeSculpt': (mesh, mod, params) => nodeSculptModifier(mesh, params),
    
    // B"H - The 36 Decrees of Anatomical Math
    'anatomicalSculpt': (mesh, mod, params) => applyAnatomicalSculpt(mesh, mod, params),

    // --- Ring Modifiers (for UV Spheres / Cylinders) ---
    'scaleRings': (mesh, mod, params) => scaleRingsModifier(mesh, params),
    'translateRings': (mesh, mod, params) => translateRingsModifier(mesh, params),
    'frontalDisplaceRings': (mesh, mod, params) => frontalDisplaceRingsModifier(mesh, params),
    'rotateRings': (mesh, mod, params) => rotateRingsModifier(mesh, params),
    'colorRings': (mesh, mod, params) => colorRingsModifier(mesh, params),
    'weightRings': (mesh, mod, params) => weightRingsModifier(mesh, params),
    'subdivideRings': (mesh, mod, params) => subdivideRingsModifier(mesh, params)
};
