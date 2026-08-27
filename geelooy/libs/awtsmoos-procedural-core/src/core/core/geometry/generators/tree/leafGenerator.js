
// B"H
/**
 * @file leafGenerator.js
 * @brief The Decorator. Spawns foliage along branch spines.
 */
import { Vec3 } from '../../../math/vec3.js';

export class LeafGenerator {
    constructor(context) {
        this.ctx = context;
        this.baseColor = this.ctx.options.leaves.color || [1, 1, 1, 1];
    }

    /**
     * B"H - Colonizes a branch spine with leaves.
     */
    populateBranch(spine, level, maxLevels) {
        const count = this.ctx.options.leaves ? this.ctx.options.leaves.count : 0;
        if (count <= 0) return;
        
        // Massive density increase for "TWIGS" (last level)
        const isTerminal = level === maxLevels;
        const multiplier = isTerminal ? 3.0 : 1.0; 
        
        // Populate the top 70% of the branch
        const startIdx = Math.floor(spine.length * 0.3); 
        
        for (let i = startIdx; i < spine.length; i++) {
            // High probability spawn
            if (this.ctx.rng.rand() > (0.4 / multiplier)) continue;

            const node = spine[i];
            const sizeBase = this.ctx.options.leaves.size || 0.5;
            
            // Smaller leaves at the very tip
            const t = i / spine.length;
            const size = sizeBase * (0.6 + this.ctx.rng.rand() * 0.6) * (isTerminal ? 0.8 : 1.0);

            // Create a cluster
            const clusterSize = Math.floor(this.ctx.rng.range(2, 5));
            
            for(let k=0; k<clusterSize; k++) {
                const angle = this.ctx.rng.rand() * Math.PI * 2;
                const r = node.radius * 1.5; // Offset slightly off branch
                
                const offset = [
                    Math.cos(angle) * r,
                    (this.ctx.rng.rand()-0.5) * r,
                    Math.sin(angle) * r
                ];
                
                const leafPos = Vec3.add(node.pos, offset);
                
                // Random Orientation
                const orientation = [
                    (this.ctx.rng.rand() - 0.5) * 2.0,
                    Math.abs(this.ctx.rng.rand()) + 0.5, // Bias Up
                    (this.ctx.rng.rand() - 0.5) * 2.0
                ];
                
                // Slight color variation
                const tint = [
                    this.baseColor[0] * (0.9 + this.ctx.rng.rand() * 0.2),
                    this.baseColor[1] * (0.9 + this.ctx.rng.rand() * 0.2),
                    this.baseColor[2] * (0.9 + this.ctx.rng.rand() * 0.2),
                    this.baseColor[3]
                ];

                this.addLeafQuad(leafPos, size, orientation, tint);
            }
        }
    }

    addLeafQuad(pos, s, dir, color) {
        const half = s/2;
        
        const angle = this.ctx.rng.rand() * Math.PI * 2;
        const c = Math.cos(angle), si = Math.sin(angle);
        
        const tilt = (this.ctx.rng.rand() - 0.5) * 1.0;
        
        const idx = this.ctx.leafOffset;
        
        const addVert = (ox, oy, oz, u, v) => {
            this.ctx.leafVerts.push(pos[0] + ox, pos[1] + oy, pos[2] + oz);
            this.ctx.leafNorms.push(0, 1, 0); 
            this.ctx.leafUVs.push(u, v);
            this.ctx.leafColors.push(...color);
        };

        // Simple Billboard logic with tilt
        // V0: BL
        addVert(-half*c, -half + half*tilt, -half*si, 0, 0);
        // V1: BR
        addVert(half*c, -half - half*tilt, half*si, 1, 0);
        // V2: TR
        addVert(half*c, half - half*tilt, half*si, 1, 1);
        // V3: TL
        addVert(-half*c, half + half*tilt, -half*si, 0, 1);
        
        this.ctx.leafInds.push(idx, idx+1, idx+2, idx, idx+2, idx+3);
        this.ctx.leafOffset += 4;
    }
}
