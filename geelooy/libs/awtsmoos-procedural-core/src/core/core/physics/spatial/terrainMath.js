
// B"H
/**
 * @file terrainMath.js
 * @brief Evaluates the exact mathematical height of procedurally sculpted terrain.
 */

export class TerrainMath {
    /**
     * B"H - Calculates the true physical height of the ground at a given (x, z) coordinate.
     * Evaluates the same mathematical sculpts used by the geometry generator.
     */
    static getHeightAt(x, z, baseY, sculpts) {
        let currentH = baseY;
        
        for (const s of sculpts) {
            if (!s.center || !s.amount) continue;
            
            const dx = x - s.center[0];
            const dz = z - s.center[2];
            // The modifier uses 3D distance, so we must calculate dy based on the CURRENT height
            const dy = currentH - s.center[1]; 
            
            const distSq = dx*dx + dy*dy + dz*dz;
            const rSq = s.radius * s.radius;

            if (distSq < rSq) {
                const dist = Math.sqrt(distSq);
                const t = dist / s.radius;
                let factor = 0;
                
                if (s.falloff === 'smooth') factor = (1.0 + Math.cos(Math.PI * t)) * 0.5;
                else if (s.falloff === 'dome') factor = Math.sqrt(Math.max(0, 1.0 - t * t));
                else if (s.falloff === 'sharp') factor = Math.max(0, (1.0 - t) * (1.0 - t));
                else if (s.falloff === 'linear') factor = Math.max(0, 1.0 - t);
                else if (s.falloff === 'flatten') factor = Math.max(0, 1.0 - t * t);

                const amt = Array.isArray(s.amount) ? s.amount[1] : (s.amount.value !== undefined ? s.amount.value : s.amount);
                
                // We ignore noise for structural placement to ensure a flat foundation,
                // or we take the average. Since buildings shouldn't bounce on pebbles, we ignore noise.
                currentH += amt * factor;
            }
        }
        
        return currentH;
    }
}
