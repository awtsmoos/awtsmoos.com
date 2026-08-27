
// B"H
import { Vec3 } from '../../math/vec3.js';

/**
 * @file sculpt.js
 * @brief Deforms the mesh using a "Proportional Editing" brush.
 *        Refined to 3D distance for anatomical precision.
 */
export function sculptMeshModifier(mesh, center, radius, amount, falloff = 'smooth', noise = 0.0) {
    if (!center || !radius) return mesh;
    
    const visited = new Set();
    const radiusSq = radius * radius;
    
    const rand = (x, y, z) => {
        const d = dot([x, y, z], [12.9898, 78.233, 37.719]);
        return fract(Math.sin(d) * 43758.5453);
    };
    
    const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const fract = (x) => x - Math.floor(x);

    let targetVal = 0;
    // B"H - Default flattening axis is Y (1). Can be X (0) or Z (2).
    let flattenAxis = 1; 

    if (falloff === 'flatten') {
        if (typeof amount === 'object' && !Array.isArray(amount)) {
            targetVal = amount.value !== undefined ? amount.value : 0;
            flattenAxis = amount.axis !== undefined ? amount.axis : 1;
        } else if (Array.isArray(amount)) {
            targetVal = amount[1]; // Legacy support for [0, val, 0]
        } else if (typeof amount === 'number') {
            targetVal = amount;
        }
    }

    for (const face of mesh.faces) {
        for (const v of face.vertices) {
            if (visited.has(v)) continue;
            
            const dx = v.pos[0] - center[0];
            const dy = v.pos[1] - center[1];
            const dz = v.pos[2] - center[2];
            
            // B"H - Use 3D distance for spherical influence (Localized Sockets)
            const distSq = dx*dx + dy*dy + dz*dz; 

            if (distSq < radiusSq) {
                const dist = Math.sqrt(distSq);
                const t = dist / radius;
                let factor = 0;

                switch (falloff) {
                    case 'linear': factor = Math.max(0, 1.0 - t); break;
                    case 'sharp': factor = Math.max(0, (1.0 - t) * (1.0 - t)); break;
                    case 'dome': factor = Math.sqrt(Math.max(0, 1.0 - t*t)); break;
                    case 'flatten': factor = Math.max(0, (1.0 - t*t)); break;
                    case 'smooth': 
                    default: factor = (1.0 + Math.cos(Math.PI * t)) * 0.5; break;
                }
                
                let noiseFactor = 1.0;
                if (noise > 0.0) {
                    const r = rand(v.pos[0], v.pos[1], v.pos[2]);
                    noiseFactor = 1.0 + (r - 0.5) * noise; 
                }

                if (falloff === 'flatten') {
                    const axis = Math.min(2, Math.max(0, flattenAxis));
                    v.pos[axis] = v.pos[axis] + (targetVal - v.pos[axis]) * factor * 0.8; 
                } else {
                    const finalFactor = factor * noiseFactor;
                    if (Array.isArray(amount)) {
                        v.pos[0] += amount[0] * finalFactor;
                        v.pos[1] += amount[1] * finalFactor;
                        v.pos[2] += amount[2] * finalFactor;
                    }
                }
            }
            visited.add(v);
        }
    }
    return mesh;
}
