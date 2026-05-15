// B"H
import { Vec3 } from '../../math/vec3.js';

export const ForceUtils = {
    applyGravity: (particles, gravityVec) => {
        particles.forEach(p => {
            if (!p.pinned) {
                p.addForce(Vec3.scale(gravityVec, p.mass)); 
            }
        });
    },

    applyWind: (particles, windVelocity, windDensity, time) => {
        // Aerodynamic Model
        const dragCoeff = 1.8; 
        const liftCoeff = 1.2; 
        
        particles.forEach(p => {
             if (p.pinned) return;
             
             const vel = Vec3.scale(Vec3.sub(p.pos, p.oldPos), 60.0);
             
             // B"H - Enhanced Turbulence
             // Spatially varying noise
             const tx = p.pos[0] * 2.0 + time * 3.0;
             const ty = p.pos[1] * 1.5 + time * 2.0;
             const tz = p.pos[2] * 2.0;

             // Multi-octave "Noise"
             const noiseX = Math.sin(tx) * 0.5 + Math.sin(ty * 0.5) * 0.25;
             const noiseY = Math.cos(ty) * 0.5 + Math.cos(tx * 0.5) * 0.25;
             const noiseZ = Math.sin(tx + ty) * 1.0; // Stronger Z flutter

             const localWind = [
                 windVelocity[0] * (1.0 + noiseX * 0.4),
                 windVelocity[1] * (1.0 + noiseY * 0.4), 
                 windVelocity[2] + noiseZ * 10.0 // Add explicit flutter side-to-side
             ];

             const vRel = Vec3.sub(localWind, vel);
             const vRelMagSq = Vec3.dot(vRel, vRel);
             
             if (vRelMagSq < 0.0001) return;
             
             const vRelMag = Math.sqrt(vRelMagSq);
             const vRelDir = Vec3.scale(vRel, 1.0 / vRelMag);

             // Normal Interaction
             let normal = p.accumulatedNormal;
             if (Vec3.dot(normal, normal) < 0.001) normal = [0, 1, 0];
             normal = Vec3.normalize(normal);

             let effectiveNormal = normal;
             const dot = Vec3.dot(vRelDir, normal);
             if (dot < 0) effectiveNormal = Vec3.scale(normal, -1);

             // Aerodynamic Forces
             const dragMag = 0.5 * windDensity * vRelMagSq * dragCoeff * Math.abs(dot);
             const fDrag = Vec3.scale(vRelDir, dragMag);
             
             const liftMag = 0.5 * windDensity * vRelMagSq * liftCoeff * (1.0 - Math.abs(dot));
             const fLift = Vec3.scale(effectiveNormal, liftMag);

             p.addForce(Vec3.add(fDrag, fLift));
        });
    },

    applyGust: (particles, gustVector) => {
        // A simpler, more direct application of force for a sudden impact.
        particles.forEach(p => {
            if (!p.pinned) {
                p.addForce(gustVector);
            }
        });
    }
};