
// B"H
/**
 * @file tongueBuilder.js
 * @brief
 *   THE TONGUE — The Primary Organ of Divine Articulation
 *   ======================================================
 *   Anchored to the 'jaw' bone via 'mouth_opening_center' so it descends
 *   naturally when the jaw opens, perfectly positioned behind the teeth.
 *
 * @module tongueBuilder
 */

import { TONGUE } from './mouthConstants.js';

export function createTongue(id) {
    return {
        id,
        primitive: 'uvSphere',
        parameters: {
            radius:   1.0,
            rings:    10,
            segments: 16,
            smooth:   true
        },
        modifiers: [
            { type: 'scaleMesh',    scale: [TONGUE.SCALE_X, TONGUE.SCALE_Y, TONGUE.SCALE_Z] },
            { type: 'smoothNormals' }
        ],
        shaderVars: {
            uMaterialType: 'lambert',
            uBaseColor:    [TONGUE.COLOR[0], TONGUE.COLOR[1], TONGUE.COLOR[2]]
        },
        doubleSided: false,
        attachment: {
            bone:             'jaw',
            useExportedPoint: 'mouth_opening_center', // B"H - TIKKUN: Perfect frontal origin
            offset:           [0, TONGUE.OFFSET_Y, TONGUE.OFFSET_Z]
        }
    };
}
