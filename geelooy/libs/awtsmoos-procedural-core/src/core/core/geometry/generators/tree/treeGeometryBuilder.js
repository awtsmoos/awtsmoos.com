
// B"H
import { Vec3 } from '../../../math/vec3.js';

export class TreeGeometryBuilder {
    constructor() {
        this.verts = [];
        this.normals = [];
        this.uvs = [];
        this.indices = [];
        
        this.leafVerts = [];
        this.leafNorms = [];
        this.leafUVs = [];
        this.leafIndices = [];
        this.leafColors = [];
        
        this.vertOffset = 0;
        this.leafOffset = 0;
    }

    addBranchSection(center, orientation, radius, segments, vCoord, isTerminal) {
        const startIdx = this.vertOffset;
        
        // Quat to Basis Vectors
        // Our identity maps (0,1,0) to UP.
        // So we need to transform (1,0,0) [Right] and (0,0,1) [Forward] by orientation.
        
        const x = orientation[0], y = orientation[1], z = orientation[2], w = orientation[3];
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        // Basis: Right (1,0,0) transformed
        const rx = 1 - (yy + zz);
        const ry = xy + wz;
        const rz = xz - wy;
        
        // Basis: Forward (0,0,1) transformed
        const fx = xz + wy;
        const fy = yz - wx;
        const fz = 1 - (xx + yy);

        for (let i = 0; i <= segments; i++) {
            const u = i / segments;
            const theta = u * Math.PI * 2;
            const c = Math.cos(theta);
            const s = Math.sin(theta);

            // Radial vector = Right * cos + Forward * sin
            const nx = rx * c + fx * s;
            const ny = ry * c + fy * s;
            const nz = rz * c + fz * s;

            this.verts.push(
                center[0] + nx * radius,
                center[1] + ny * radius,
                center[2] + nz * radius
            );
            
            this.normals.push(nx, ny, nz);
            this.uvs.push(u, vCoord);
            
            this.vertOffset++;
        }
        return startIdx;
    }

    stitch(startA, startB, segments) {
        for (let i = 0; i < segments; i++) {
            const a1 = startA + i;
            const a2 = startA + i + 1;
            const b1 = startB + i;
            const b2 = startB + i + 1;
            
            this.indices.push(a1, b1, a2);
            this.indices.push(b1, b2, a2);
        }
    }
    
    addCap(center, orientation, ringStart, segments, vCoord) {
        const tipIdx = this.vertOffset;
        
        // Direction is Y (0,1,0) transformed by orientation
        const x = orientation[0], y = orientation[1], z = orientation[2], w = orientation[3];
        const dx = 2 * (x * y - w * z);
        const dy = 1 - 2 * (x * x + z * z);
        const dz = 2 * (y * z + w * x);
        
        this.verts.push(center[0], center[1], center[2]);
        this.normals.push(dx, dy, dz);
        this.uvs.push(0.5, vCoord + 0.1);
        this.vertOffset++;
        
        for(let i=0; i<segments; i++) {
            this.indices.push(ringStart + i, ringStart + i + 1, tipIdx);
        }
    }

    addLeaf(pos, size, rotation, color) {
        const half = size / 2;
        const cx = Math.cos(rotation[0]), sx = Math.sin(rotation[0]);
        const cy = Math.cos(rotation[1]), sy = Math.sin(rotation[1]);
        const cz = Math.cos(rotation[2]), sz = Math.sin(rotation[2]);

        const rot = (vx, vy, vz) => {
            // Z rot
            let x = vx*cz - vy*sz;
            let y = vx*sz + vy*cz;
            let z = vz;
            // Y rot
            let tx = x*cy + z*sy;
            z = -x*sy + z*cy;
            x = tx;
            // X rot
            let ty = y*cx - z*sx;
            z = y*sx + z*cx;
            y = ty;
            return [x, y, z];
        };

        const v0 = rot(-half, 0, 0); // Bottom left
        const v1 = rot(half, 0, 0);  // Bottom right
        const v2 = rot(half, size, 0);   // Top right
        const v3 = rot(-half, size, 0);  // Top left

        const idx = this.leafOffset;
        
        const pushV = (v, u, v_uv) => {
            this.leafVerts.push(pos[0]+v[0], pos[1]+v[1], pos[2]+v[2]);
            this.leafNorms.push(0, 1, 0); // Billboard normal up-ish
            this.leafUVs.push(u, v_uv);
            this.leafColors.push(...color);
        };

        pushV(v0, 0, 0);
        pushV(v1, 1, 0);
        pushV(v2, 1, 1);
        pushV(v3, 0, 1);

        this.leafIndices.push(idx, idx+1, idx+2, idx, idx+2, idx+3);
        this.leafOffset += 4;
    }
}
