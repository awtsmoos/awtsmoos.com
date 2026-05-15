
// B"H
/**
 * @file teethBuilder.js
 * @brief
 *   THE DENTAL THRONE — Two Rows, One Occlusion Plane
 *   ===================================================
 *   Both arches are constructed so their occlusal surfaces meet at local Y=0
 *   in arch-local space. The attachment offset then places the arch inside the
 *   mouth at the correct world position.
 *
 * @module teethBuilder
 */

import { ARCH, TEETH_OFFSET_TOP, TEETH_OFFSET_BOTTOM } from './mouthConstants.js';

// ─────────────────────────────────────────────────────────────────────────────
// §1  ARCH CURVE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function _archZ(t) {
    const x = t * (ARCH.WIDTH / 2);
    return -(x * x) * ARCH.CURVE;
}

function _archAngle(t) {
    const x = t * (ARCH.WIDTH / 2);
    return Math.atan2(-2 * x * ARCH.CURVE, 1) * 0.45;
}

// ─────────────────────────────────────────────────────────────────────────────
// §2  GUM TUBE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function _buildGums(id, isUpper) {
    const steps = 16;
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t  = (i / steps) * 2.0 - 1.0;
        const x  = t * (ARCH.WIDTH / 2);
        const z  = _archZ(t);
        points.push([x, 0, z]);
    }

    // B"H - Gums sit at the roots of the teeth to cap them perfectly
    const gumY = isUpper ? ARCH.TOOTH_H * 0.8 : -ARCH.TOOTH_H * 0.8;

    return {
        id:        `${id}_gums`,
        primitive: 'tube',
        parameters: {
            path:           { type: 'points', points },
            radius:         ARCH.GUM_RADIUS,
            radialSegments: ARCH.GUM_SEGS,
            color:          ARCH.GUM_COLOR,
            closed:         false,
            smooth:         true
        },
        keyframes: [{ time: 0, position: [0, gumY, 0], rotation: [0,0,0], scale: [1,1,1] }]
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// §3  TOOTH ARRAY BUILDER
// ─────────────────────────────────────────────────────────────────────────────

function _buildToothArray(id, isUpper) {
    const count  = ARCH.TOOTH_COUNT;
    const halfH  = ARCH.TOOTH_H / 2;
    const centerY = isUpper ? halfH : -halfH;

    const teeth = [];
    for (let i = 0; i < count; i++) {
        const t     = count > 1 ? (i / (count - 1)) * 2.0 - 1.0 : 0;
        const x     = t * (ARCH.WIDTH / 2);
        const z     = _archZ(t);
        const angle = _archAngle(t);

        teeth.push({
            id:        `${id}_tooth_${i}`,
            primitive: 'cube',
            parameters: { size: 1.0, color: ARCH.TOOTH_COLOR },
            modifiers: [{
                type:  'scaleMesh',
                scale: [ARCH.TOOTH_W, ARCH.TOOTH_H, ARCH.TOOTH_D]
            }],
            keyframes: [{
                time:     0,
                position: [x, centerY, z],
                rotation: [0, angle, 0],
                scale:    [1, 1, 1]
            }]
        });
    }
    return teeth;
}

// ─────────────────────────────────────────────────────────────────────────────
// §4  PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export function createDentalArch(id, isUpper) {
    const gums   = _buildGums(id, isUpper);
    const teeth  = _buildToothArray(id, isUpper);
    const offset = isUpper ? TEETH_OFFSET_TOP : TEETH_OFFSET_BOTTOM;

    // B"H - THE TIKKUN: Attach to the mouth opening, not the deep cavity center
    return {
        id,
        primitive: 'none',
        children:  [gums, ...teeth],
        attachment: {
            bone:             isUpper ? 'head' : 'jaw',
            useExportedPoint: 'mouth_opening_center', 
            offset:           [...offset]
        }
    };
}
