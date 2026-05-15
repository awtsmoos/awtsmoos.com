
// B"H
/**
 * @file headSculpt.js
 * @brief A divine sculptor that reshapes a primitive sphere into a noble head 
 *        with a pronounced, undeniable lower jaw.
 */
import { Vec3 } from '../../math/vec3.js';

export function headSculptModifier(mesh, params = {}) {
    if (!mesh.faces) return mesh;
    
    const visited = new Set();
    const rings = mesh.rings || 48;
    const segments = mesh.segments || 32;

    mesh.faces.forEach(face => {
        face.vertices.forEach(v => {
            if (visited.has(v)) return;
            visited.add(v);

            // t goes from 0 (top) to 1 (bottom)
            const t = v.ringIdx / rings;
            
            // Normalized azimuthal angle for symmetry
            // 0 at front (Z+), 0.25 at side (X+), 0.5 at back (Z-)
            // Standard UV sphere usually maps s=0 to z+, but let's derive from position to be robust
            // or rely on sIdx. Let's rely on segIdx assuming standard unrotated UV sphere.
            // sPct: 0.0 -> Front, 0.25 -> Right, 0.5 -> Back, 0.75 -> Left
            // Wait, standard ThreeJS/WebGL sphere might vary.
            // Let's use geometric position for weights to be sure.
            const lenXZ = Math.sqrt(v.pos[0]*v.pos[0] + v.pos[2]*v.pos[2]) + 0.0001;
            const dirX = v.pos[0] / lenXZ;
            const dirZ = v.pos[2] / lenXZ;
            
            // Front weight: 1.0 at Z+, 0.0 at Z- (clamped)
            const frontFactor = Math.max(0, dirZ); 
            // Side weight: 1.0 at X+/-
            const sideFactor = Math.abs(dirX);

            // --- 1. CRANIUM (Top 60%) ---
            if (t < 0.6) {
                // flatten sides of head slightly
                v.pos[0] *= 0.85;
                // elongate cranium back
                if (dirZ < 0) v.pos[2] *= 1.1; 
                // make forehead vertical
                if (t > 0.2 && frontFactor > 0.5) v.pos[2] *= 0.95;
            }

            // --- 2. THE JAW (Bottom 40%) ---
            if (t >= 0.6) {
                // k goes from 0.0 (start of jaw) to 1.0 (bottom of chin)
                const k = (t - 0.6) / 0.4;
                
                // A. VERTICAL DROP
                // Drop vertices down to create height for the jaw
                v.pos[1] -= k * 3.0;

                // B. VOLUMETRIC EXPANSION (The Fix)
                // The sphere naturally tapers to a point at the bottom (radius -> 0).
                // We must forcibly widen it to create a jawbone.
                // We blend the natural sphere radius towards a target cylinder radius.
                
                const targetWidth = 3.2; // Width of jaw at back
                const targetChin = 2.5;  // Width of chin at front
                
                // Interpolate width based on whether we are front (chin) or back (mandible)
                const targetRadius = (frontFactor * targetChin) + ((1.0 - frontFactor) * targetWidth);
                
                // Current natural radius of the sphere slice
                const currentRadius = lenXZ;
                
                // As we get closer to the bottom (k -> 1), we enforce the target radius more strongly
                // to prevent the "pointy beard" look.
                const blend = k * k; // Smooth transition
                const newRadius = currentRadius * (1.0 - blend) + targetRadius * blend;
                
                // Apply new radius
                v.pos[0] = dirX * newRadius;
                v.pos[2] = dirZ * newRadius;

                // C. SHAPING THE JAW
                
                // 1. Mandible Angle (Widen the back-sides)
                // Push X out around the "corners" of the jaw
                const cornerWeight = Math.max(0, 1.0 - Math.abs(Math.abs(dirX) - 0.707)); // Peaks at 45 degrees
                v.pos[0] *= 1.0 + (cornerWeight * 0.3 * k);

                // 2. Chin Projection (Push front Z forward)
                if (frontFactor > 0) {
                    v.pos[2] += frontFactor * k * 2.5; 
                    // Sharpen the chin slightly in X
                    v.pos[0] *= 1.0 - (frontFactor * 0.3 * k);
                }

                // 3. Flatten the Underside
                // Instead of a round bottom, create a defined jawline
                // If we are at the very bottom, pull Y up slightly to flatten, 
                // but we already dropped it, so this effectively creates a flat plane.
                if (k > 0.9) {
                    v.pos[1] += (k - 0.9) * 2.0; 
                    // And pull it back slightly to avoid a super sharp point
                    v.pos[2] *= 0.95;
                }
            }
        });
    });

    return mesh;
}
