
/**
 * B"H
 * THE TZIMTZUM OF SPACE (SPACE BENDER)
 * 
 * Chapter: Bending the Light
 * Instead of rotating the box, we rotate the universe. 
 * By multiplying the Ray Origin (as a point, w=1) and the Ray Direction 
 * (as a vector, w=0) by the Inverse World Matrix, the Ray enters the 
 * subjective reality of the Object, where it sits perfectly at [0,0,0] 
 * facing straight forward.
 * 
 * @class SpaceBender
 */
import { RayMath } from '../math/rayMath.js';

export class SpaceBender {
    /**
     * B"H
     * Transforms the Infinite Ray into the Local Constraints of the Vessel.
     */
    static toLocalRay(worldRay, worldMatrix) {
        const invWorld = RayMath.invert4x4(worldMatrix);
        if (!invWorld) return null; // Object is crushed to 0 scale

        // Origin is a point (w=1)
        const origin4 = [worldRay.origin[0], worldRay.origin[1], worldRay.origin[2], 1.0];
        const localOrigin4 = RayMath.transformVec4(invWorld, origin4);
        
        // Direction is a vector (w=0) - Translation ignores it!
        const dir4 = [worldRay.direction[0], worldRay.direction[1], worldRay.direction[2], 0.0];
        const localDir4 = RayMath.transformVec4(invWorld, dir4);

        const localOrigin = [localOrigin4[0], localOrigin4[1], localOrigin4[2]];
        const localDir = RayMath.normalize([localDir4[0], localDir4[1], localDir4[2]]);

        return { origin: localOrigin, direction: localDir };
    }

    /**
     * B"H
     * Brings a humble local hit point back out into the Grand Reality.
     */
    static toWorldPoint(localPoint, worldMatrix) {
        const pt4 = [localPoint[0], localPoint[1], localPoint[2], 1.0];
        const worldPt4 = RayMath.transformVec4(worldMatrix, pt4);
        return [worldPt4[0], worldPt4[1], worldPt4[2]];
    }

    /**
     * B"H - Helper to dynamically build a World Matrix from pos/rot/scale
     */
    static buildWorldMatrix(pos, rot, scl) {
        const cx = Math.cos(rot[0]), sx = Math.sin(rot[0]);
        const cy = Math.cos(rot[1]), sy = Math.sin(rot[1]);
        const cz = Math.cos(rot[2]), sz = Math.sin(rot[2]);

        const m = new Float32Array(16);
        m[0] = (cy * cz) * scl[0]; m[1] = (cy * sz) * scl[0]; m[2] = (-sy) * scl[0]; m[3] = 0;
        m[4] = (sx * sy * cz - cx * sz) * scl[1]; m[5] = (sx * sy * sz + cx * cz) * scl[1]; m[6] = (sx * cy) * scl[1]; m[7] = 0;
        m[8] = (cx * sy * cz + sx * sz) * scl[2]; m[9] = (cx * sy * sz - sx * cz) * scl[2]; m[10] = (cx * cy) * scl[2]; m[11] = 0;
        m[12] = pos[0]; m[13] = pos[1]; m[14] = pos[2]; m[15] = 1;
        return m;
    }
}
