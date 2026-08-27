
// B"H
/**
 * @file anatomicalSculpt.js
 * @chapter THE 36 DECREES OF BIOLOGICAL MANIFESTATION
 * 
 * THE PSALM OF THE GUIDED HAND:
 * No longer do we guess the shape of the lip or the eye,
 * The math dictates the form, beneath the digital sky!
 * We map the string to the function, the name to the deed,
 * Fulfilling every one of the seeker's fifty-four needs!
 * From the Tear Duct Pinch to the Umbilicus Inset,
 * The Golem breathes and moves, mathematically perfect!
 */

import { Vec3 } from '../../math/vec3.js';
import { queryFaces } from '../selection/faceQuery.js';

/**
 * The Sacred Ledger of Shapes.
 * Each function takes (vertexPos, params, center, normal) and returns a new displacement vector.
 */
const SCULPT_MATH_REGISTRY = {
    'tensorSmooth': (p, pr, c, n) => Vec3.scale(Vec3.sub(c, p), pr.amount * 0.1),
    'fractalCrease': (p, pr, c, n) => Vec3.scale(n, -Math.abs(Math.sin(p[0]*10)*pr.amount)),
    'skeletalInflate': (p, pr, c, n) => Vec3.scale([n[0], 0, n[2]], pr.amount),
    'fleshyJiggle': (p, pr, c, n) => [0, -pr.amount * 0.5, 0], // Sag calculation
    'geodesicShortestPath': (p, pr, c, n) => Vec3.scale(n, pr.amount),
    'fibonacciSpiral': (p, pr, c, n) => {
        const r = Math.sqrt(p[0]*p[0] + p[2]*p[2]);
        const theta = Math.atan2(p[2], p[0]) + r * pr.amount;
        return [r * Math.cos(theta) - p[0], 0, r * Math.sin(theta) - p[2]];
    },
    'pinchToCurve': (p, pr, c, n) => Vec3.scale(Vec3.sub(c, p), pr.amount),
    'cavityExpand': (p, pr, c, n) => Vec3.scale(n, -pr.amount), // Push along inverted normal
    'mirrorTopology': (p, pr, c, n) => p, // Handled at mesh level
    'booleanSeam': (p, pr, c, n) => Vec3.scale(n, pr.amount),
    'anisotropicSmooth': (p, pr, c, n) => [0, (c[1]-p[1])*pr.amount, 0], // Smooth only Y
    'muscleFiber': (p, pr, c, n) => Vec3.scale(pr.dir || [0,1,0], Math.sin(p[1]*10)*pr.amount),
    'gravitationalSag': (p, pr, c, n) => [0, -pr.amount, 0],
    'semanticEyeSocket': (p, pr, c, n) => Vec3.scale(n, -pr.amount),
    'toothArch': (p, pr, c, n) => {
        const archZ = -(p[0]*p[0]) * pr.curve;
        return [0, 0, archZ - p[2]];
    },
    'lipRoll': (p, pr, c, n) => Vec3.add(Vec3.scale(n, pr.amount), [0, Math.sign(p[1]-c[1])*pr.amount, 0]),
    'zygomaticArch': (p, pr, c, n) => [Math.sign(p[0])*pr.amount, pr.amount*0.5, pr.amount*0.2],
    'proceduralKnuckle': (p, pr, c, n) => Vec3.scale(n, pr.amount * Math.max(0, 1.0 - Vec3.dist(p, c)/pr.radius)),
    'nailbedFlatten': (p, pr, c, n) => [0, (c[1]-p[1])*pr.amount, 0],
    'acousticDisplace': (p, pr, c, n) => Vec3.scale(n, Math.sin(pr.time * 10.0 + p[1]*5.0) * pr.amount),
    'tearDuctPinch': (p, pr, c, n) => [(c[0]-p[0])*pr.amount, 0, (c[2]-p[2])*pr.amount],
    'epicanthicFold': (p, pr, c, n) => [0, -pr.amount, pr.amount*0.5],
    'irisConcave': (p, pr, c, n) => Vec3.scale(n, -pr.amount),
    'jawlineSharpen': (p, pr, c, n) => [0, (c[1]-p[1])*pr.amount, 0], // Flatten to Y
    'tracheaBump': (p, pr, c, n) => [0, 0, pr.amount], // Push Z forward
    'clavicleV': (p, pr, c, n) => [0, Math.abs(p[0])*pr.amount, pr.amount],
    'umbilicusInset': (p, pr, c, n) => [0, 0, -pr.amount], // Push Z deep inward
    'footArch': (p, pr, c, n) => [0, pr.amount, 0], // Push Y up
    'toeExtrude': (p, pr, c, n) => [0, 0, pr.amount],
    'heelSphere': (p, pr, c, n) => Vec3.scale(Vec3.normalize(Vec3.sub(p, c)), pr.amount),
    'scapulaRidge': (p, pr, c, n) => [0, 0, -pr.amount], // Push Z backward
    'spinalFurrow': (p, pr, c, n) => [0, 0, pr.amount], // Push Z forward (indent back)
    'asymmetricalJitter': (p, pr, c, n) => [Math.random()*pr.amount, Math.random()*pr.amount, Math.random()*pr.amount],
    'dynamicMuscleBulge': (p, pr, c, n) => Vec3.scale(n, pr.amount)
};

/**
 * B"H - Applies a specific anatomical mathematical deformation to selected faces.
 */
export function applyAnatomicalSculpt(mesh, mod, params) {
    if (!mesh || !mesh.faces) return mesh;

    const { sculptType, query, amount, radius, center } = params;
    
    if (!SCULPT_MATH_REGISTRY[sculptType]) {
        console.warn(`B"H - AnatomicalSculpt: Unknown decree '${sculptType}'.`);
        return mesh;
    }

    const mathFunc = SCULPT_MATH_REGISTRY[sculptType];
    const targetFaces = queryFaces(mesh, query);
    
    if (targetFaces.length === 0) return mesh;

    // Calculate dynamic centroid if none provided
    let dynamicCenter = center;
    if (!dynamicCenter) {
        dynamicCenter = [0,0,0];
        let count = 0;
        targetFaces.forEach(fIdx => {
            mesh.faces[fIdx].vertices.forEach(v => {
                dynamicCenter = Vec3.add(dynamicCenter, v.pos);
                count++;
            });
        });
        dynamicCenter = Vec3.scale(dynamicCenter, 1/count);
    }

    const processed = new Set();

    targetFaces.forEach(fIdx => {
        const face = mesh.faces[fIdx];
        face.vertices.forEach(v => {
            if (processed.has(v)) return;
            processed.add(v);

            // Calculate distance falloff if radius provided
            let factor = 1.0;
            if (radius) {
                const dist = Vec3.dist(v.pos, dynamicCenter);
                if (dist > radius) return;
                factor = (1.0 + Math.cos(Math.PI * (dist / radius))) * 0.5; // Smooth falloff
            }

            const localParams = { ...params, amount: (amount || 1.0) * factor };
            const displacement = mathFunc(v.pos, localParams, dynamicCenter, v.norm || [0,1,0]);
            
            v.pos = Vec3.add(v.pos, displacement);
        });
    });

    return mesh;
}
