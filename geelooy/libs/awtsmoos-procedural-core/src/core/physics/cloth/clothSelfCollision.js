// B"H
/**
 * @file clothSelfCollision.js
 * @brief Grants the cloth a sense of self, preventing its particles from interpenetrating,
 *        now with hyper-efficient spatial awareness.
 */
import { Vec3 } from '../../math/vec3.js';
import { SpatialGrid } from '../spatial/spatialGrid.js';

// B"H - A global grid to avoid reallocation every frame. Cell size tuned to particle radius.
const grid = new SpatialGrid(0.4); // Cell size slightly larger than 2 * PARTICLE_RADIUS

export function handleSelfCollision(cloth) {
    const particles = cloth.particles;
    
    // 1. Build the spatial grid for this frame
    grid.build(particles);

    const PARTICLE_RADIUS = 0.15;
    const MIN_DIST_SQ = (PARTICLE_RADIUS * 2.0) * (PARTICLE_RADIUS * 2.0);

    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.pinned) continue;

        // 2. Get potential colliders from the grid
        const neighbors = grid.getNeighbors(p1);

        // 3. Check against neighbors
        for (let j = 0; j < neighbors.length; j++) {
            const p2 = neighbors[j];
            
            // Don't check against self or in reverse order (since we process i->j and j->i)
            if (p1 === p2 || particles.indexOf(p2) < i) continue;

            const diff = Vec3.sub(p1.pos, p2.pos);
            const distSq = diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2];

            if (distSq < MIN_DIST_SQ && distSq > 1e-9) {
                const dist = Math.sqrt(distSq);
                const normal = Vec3.scale(diff, 1.0 / dist);
                
                // B"H - The correction is shared, each particle moving half the required distance.
                const penetration = ((PARTICLE_RADIUS * 2.0) - dist) * 0.5;

                p1.pos = Vec3.add(p1.pos, Vec3.scale(normal, penetration));
                if (!p2.pinned) {
                    p2.pos = Vec3.sub(p2.pos, Vec3.scale(normal, penetration));
                }
            }
        }
    }
}