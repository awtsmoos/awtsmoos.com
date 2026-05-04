// B"H
/**
 * collisions.js
 * 
 * Wall collision resolution with smooth sliding.
 * 
 * Two key techniques to prevent jitter:
 * 1. Push-out uses raw normal XZ components (not normalized), preventing overshoot.
 * 2. Caches wall normals into `_frameWallNormals` so index.js can pre-filter
 *    next frame's input velocity — preventing the "push into wall then push out" cycle.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    collisions() {
        if (!this.olam || !this.olam.worldOctree || !this.collider || !this.velocity) return;

        const WALL_STEP_HEIGHT = 0.2; 
        
        // Lift for wall check to ignore the floor we are currently snapped to.
        this.collider.start.y += WALL_STEP_HEIGHT;
        this.collider.end.y   += WALL_STEP_HEIGHT;

        // Up to 5 iterations for convergence (XZ-only pushes may not fully resolve in one pass)
        for (let i = 0; i < 5; i++) {
            const result = this.olam.worldOctree.capsuleIntersect(this.collider);
            if (!result) break;

            const isFloor = result.normal.y >= 0.15;
            
            if (!isFloor && result.depth >= 1e-10) {
                const nx = result.normal.x;
                const nz = result.normal.z;
                const horizontalLenSq = nx * nx + nz * nz;
                
                if (horizontalLenSq > 1e-5) {
                    const horizontalLen = Math.sqrt(horizontalLenSq);
                    // Normalized XZ direction (unit vector along wall normal in XZ plane)
                    const dirX = nx / horizontalLen;
                    const dirZ = nz / horizontalLen;
                    
                    // Cache this wall's unit normal for pre-filtering input velocity next frame
                    if (!this._frameWallNormals) this._frameWallNormals = [];
                    this._frameWallNormals.push({ x: dirX, z: dirZ });
                    
                    // 1. WALL SLIDE: Remove velocity component pointing INTO the wall.
                    //    Uses normalized direction so we project velocity onto a unit vector.
                    const dot = this.velocity.x * dirX + this.velocity.z * dirZ;
                    if (dot < 0) {
                        this.velocity.x -= dirX * dot;
                        this.velocity.z -= dirZ * dot;
                    }

                    // 2. PUSH OUT: Use raw normal components × depth.
                    //    The 3D resolution vector is (normal * depth). Its XZ projection is
                    //    (nx * depth, 0, nz * depth). This has magnitude = depth * horizontalLen.
                    //    
                    //    OLD BUG: Using (dirX * depth) pushed by magnitude = depth (too far!),
                    //    overshooting by factor 1/horizontalLen → aggressive "push away" jitter.
                    //    
                    //    The iteration loop converges any remaining penetration from ignoring Y.
                    this.collider.translate({
                        x: nx * result.depth,
                        y: 0,
                        z: nz * result.depth
                    });
                    
                    // Detailed debug logging - includes rotation and velocity before/after
                    const rotDeg = this.rotation ? (this.rotation.y * 180 / Math.PI).toFixed(1) : '?';
                    // B"H: silent

                }
            }
        }

        // Lower back to true position.
        this.collider.start.y -= WALL_STEP_HEIGHT;
        this.collider.end.y   -= WALL_STEP_HEIGHT;
    }
};
