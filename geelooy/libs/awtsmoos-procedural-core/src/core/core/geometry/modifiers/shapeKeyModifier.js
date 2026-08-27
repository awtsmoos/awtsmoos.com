
// B"H
/**
 * @file shapeKeyModifier.js
 * @chapter THE DISCIPLINED POTENTIAL
 * 
 * THE PSALM OF THE AUTHORIZED SPARK:
 * Not every spark shall be moved by the Sculptor's hand!
 * Only those that carry the holy Authority of the Name.
 * We have rewritten the Decree: the Radius provides the Field,
 * but the Query provides the command. 
 * Even if a vertex is within the radius, if it is not selected, 
 * it shall remain steadfast and unmoved!
 * 
 * @module shapeKeyModifier
 */

import { Vec3 } from '../../math/vec3.js';
import { queryVertices } from '../selection/vertexQuery.js';

export function defineShapeKeyModifier(mesh, params) {
    const { name, query, sculpt } = params;
    if (!name || !sculpt) return mesh;

    const { center, radius, amount, falloff = 'smooth' } = sculpt;
    const radiusSq = radius * radius;

    // B"H - THE AUTHORITATIVE TIKKUN
    // We strictly identify only the vertices matching the query.
    const authorizedVertices = queryVertices(mesh, query);
    
    console.log(`B"H - [ShapeKey::${name}]: Granting authority to ${authorizedVertices.size} sparks.`);

    if (authorizedVertices.size === 0) {
        console.warn(`B"H - [ShapeKey::${name}]: The Query returned a Void. No sparks to manifest.`);
        return mesh;
    }

    authorizedVertices.forEach(v => {
        const p = v.pos;
        const dx = p[0] - center[0];
        const dy = p[1] - center[1];
        const dz = p[2] - center[2];
        const distSq = dx*dx + dy*dy + dz*dz;

        if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const t = dist / radius;
            let factor = 0;

            if (falloff === 'smooth') factor = (1.0 + Math.cos(Math.PI * t)) * 0.5;
            else if (falloff === 'linear') factor = Math.max(0, 1.0 - t);
            else if (falloff === 'sharp') factor = Math.max(0, (1.0 - t) * (1.0 - t));
            else if (falloff === 'dome') factor = Math.sqrt(Math.max(0, 1.0 - t * t));
            else if (falloff === 'flatten') factor = (1.0 - t*t);

            let moveVec = [0, 0, 0];
            
            // B"H - Check if we are doing a coordinate flatten vs a vector move
            if (typeof amount === 'object' && !Array.isArray(amount)) {
                const axis = amount.axis !== undefined ? amount.axis : 1;
                const targetVal = amount.value !== undefined ? amount.value : 0;
                // Move vertex on the specific axis towards the target value
                moveVec[axis] = (targetVal - p[axis]) * factor;
            } else {
                moveVec = Vec3.scale(amount, factor);
            }

            if (!v.shapeKeyDeltas) v.shapeKeyDeltas = {};
            
            // If multiple keys with same name exist (like in mouth_open), add them up!
            if (v.shapeKeyDeltas[name]) {
                v.shapeKeyDeltas[name] = Vec3.add(v.shapeKeyDeltas[name], moveVec);
            } else {
                v.shapeKeyDeltas[name] = moveVec;
            }
        }
    });

    mesh.hasShapeKeys = true;
    return mesh;
}
