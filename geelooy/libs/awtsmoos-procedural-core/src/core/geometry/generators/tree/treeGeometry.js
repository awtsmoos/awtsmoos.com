
// B"H
/**
 * @file treeGeometry.js
 * @brief The Mason. Constructs the physical mesh from abstract rings.
 *        Fixed winding order to ensure normals point OUTWARDS.
 */
import { Vec3 } from '../../../math/vec3.js';

export class TreeGeometry {
    constructor(context) {
        this.ctx = context;
    }

    /**
     * Adds a ring of vertices at a specific position and orientation.
     * @returns {number} The starting index of this ring in the vertex buffer.
     */
    addRing(center, frameNormal, frameBinormal, radius, segments, vCoord) {
        const startIdx = this.ctx.indexOffset;
        
        for (let i = 0; i <= segments; i++) {
            const u = i / segments;
            const theta = u * Math.PI * 2;
            
            const cos = Math.cos(theta);
            const sin = Math.sin(theta);

            // P = C + N*cos*r + B*sin*r
            const x = center[0] + radius * (frameNormal[0] * cos + frameBinormal[0] * sin);
            const y = center[1] + radius * (frameNormal[1] * cos + frameBinormal[1] * sin);
            const z = center[2] + radius * (frameNormal[2] * cos + frameBinormal[2] * sin);

            // Normal is just the radial vector (normalized)
            const nx = frameNormal[0] * cos + frameBinormal[0] * sin;
            const ny = frameNormal[1] * cos + frameBinormal[1] * sin;
            const nz = frameNormal[2] * cos + frameBinormal[2] * sin;

            this.ctx.verts.push(x, y, z);
            this.ctx.norms.push(nx, ny, nz);
            this.ctx.uvs.push(u, vCoord);
            
            this.ctx.indexOffset++;
        }
        
        return startIdx;
    }

    /**
     * Stitches two rings together with triangles.
     * CORRECTED WINDING ORDER: Counter-Clockwise.
     */
    stitchRings(startA, startB, segments) {
        for (let i = 0; i < segments; i++) {
            const a1 = startA + i;
            const a2 = startA + i + 1;
            const b1 = startB + i;
            const b2 = startB + i + 1;

            // Quad: a1 (BL) -> a2 (BR) -> b2 (TR) -> b1 (TL)
            // Tri 1: a1 -> a2 -> b1
            this.ctx.inds.push(a1, a2, b1);
            
            // Tri 2: b1 -> a2 -> b2
            this.ctx.inds.push(b1, a2, b2);
        }
    }

    capTip(ringStart, segments, center, dir, v) {
        const tipIdx = this.ctx.indexOffset;
        
        // Tip Vertex
        this.ctx.verts.push(center[0], center[1], center[2]);
        this.ctx.norms.push(dir[0], dir[1], dir[2]);
        this.ctx.uvs.push(0.5, v + 0.1);
        this.ctx.indexOffset++;

        // Fan triangles
        for (let i = 0; i < segments; i++) {
            const curr = ringStart + i;
            const next = ringStart + i + 1;
            
            // Winding: curr -> next -> tip
            this.ctx.inds.push(curr, next, tipIdx);
        }
    }
}
