
// B"H
/**
 * @file utils.js
 * @brief Precision utilities for Marching Cubes, manifesting the order of the Awtsmoos.
 */
import { getAnalyticalNormal } from '../../physics/metaballs/field.js';

export function vertexInterp(isoLevel, p1, p2, val1, val2) {
    const diff = val2 - val1;
    // B"H - Epsilon check against zero-gradient edges.
    if (Math.abs(diff) < 1e-8) return p1;
    
    // B"H - The sacred ratio of transition.
    const t = (isoLevel - val1) / diff;
    // B"H - Clamping prevents vertices from leaving the voxel cell.
    const ct = Math.max(0.001, Math.min(0.999, t));
    
    return [
        p1[0] + (p2[0] - p1[0]) * ct,
        p1[1] + (p2[1] - p1[1]) * ct,
        p1[2] + (p2[2] - p1[2]) * ct
    ];
}

export function getFieldNormal(p, metaballs) {
    return getAnalyticalNormal(p, metaballs);
}
