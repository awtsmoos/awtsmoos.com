
// B"H
import { Vec3 } from '../../math/vec3.js';
import { generatePrismStrand } from '../../geometry/generators/hairGeometry.js';
import { getFibonacciSpherePoints } from '../../math/sampling/fibonacci.js';

/**
 * @file hairBuilder.js
 * @brief Constructs a volume of instanced hair strands over a defined spherical cap.
 */

export function createHairPatch(id, config) {
    const { count, sphereRadius, direction, angleLimit, length, width, combStrength, combDir, colorBase, colorTip, attachment } = config;
    
    // 1. Base single strand geometry
    const { positions, indices } = generatePrismStrand(8, 0.5);
    
    // 2. Determine necessary samples to hit the target count within the angle limit
    const limit = Math.max(-0.99, Math.min(0.99, angleLimit));
    const ratio = (1.0 - limit) / 2.0;
    const totalPointsNeeded = Math.ceil(count / ratio);
    const spherePoints = getFibonacciSpherePoints(totalPointsNeeded);
    
    const iOffsets = [];
    const iNormals = [];
    const iRandoms =[];
    const dirNorm = Vec3.normalize(direction);
    let validCount = 0;
    
    const JITTER = 0.08; 

    // 3. Filter and perturb points
    for (let i = 0; i < spherePoints.length; i++) {
        if (validCount >= count) break;
        
        let p = [...spherePoints[i]];
        
        // Break up perfect mathematical alignment
        p[0] += (Math.random() - 0.5) * JITTER;
        p[1] += (Math.random() - 0.5) * JITTER;
        p[2] += (Math.random() - 0.5) * JITTER;
        
        const len = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
        p[0] /= len; p[1] /= len; p[2] /= len;
        
        const dot = p[0]*dirNorm[0] + p[1]*dirNorm[1] + p[2]*dirNorm[2];
        
        if (dot > limit) {
            iOffsets.push(p[0] * sphereRadius, p[1] * sphereRadius, p[2] * sphereRadius);
            iNormals.push(p[0], p[1], p[2]);
            iRandoms.push(Math.random());
            validCount++;
        }
    }

    console.log(`B"H - HairBuilder: Manifested ${validCount} strands for[${id}].`);

    return {
        id: id, 
        primitive: 'none', 
        positions: positions, 
        indices: indices,
        instanceCount: validCount, 
        instanceOffsets: new Float32Array(iOffsets), 
        instanceNormals: new Float32Array(iNormals), 
        instanceRandoms: new Float32Array(iRandoms),
        hairParams: { colorBase, colorTip, length, width, combStrength, combDir },
        shaderVars: { uMaterialType: 'hair' },
        attachment: attachment,
        keyframes:[{ time: 0, position:[0, 0, 0] }]
    };
}
