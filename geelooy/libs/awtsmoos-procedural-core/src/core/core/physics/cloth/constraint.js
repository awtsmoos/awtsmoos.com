// B"H
import { Vec3 } from '../../math/vec3.js';

export class Constraint {
    constructor(p1, p2, stiffness) {
        this.p1 = p1;
        this.p2 = p2;
        this.stiffness = stiffness;
        this.restLength = Vec3.dist(p1.pos, p2.pos);
    }

    resolve() {
        const p1 = this.p1;
        const p2 = this.p2;
        
        const delta = Vec3.sub(p2.pos, p1.pos);
        const currentLen = Math.sqrt(delta[0]*delta[0] + delta[1]*delta[1] + delta[2]*delta[2]);
        
        if (currentLen < 1e-6) return; 

        const diff = (currentLen - this.restLength) / currentLen;
        
        // Mass-weighted correction
        const w1 = p1.invMass;
        const w2 = p2.invMass;
        const wTotal = w1 + w2;
        
        if (wTotal === 0) return; // Both pinned

        // Calculate total correction vector
        const correctionMag = diff * this.stiffness;
        const correction = Vec3.scale(delta, correctionMag);

        // Apply to p1 (inverse weight)
        if (!p1.pinned) {
            const move1 = Vec3.scale(correction, w1 / wTotal);
            p1.pos = Vec3.add(p1.pos, move1);
        }
        
        // Apply to p2 (inverse weight, negative direction)
        if (!p2.pinned) {
            const move2 = Vec3.scale(correction, w2 / wTotal);
            p2.pos = Vec3.sub(p2.pos, move2);
        }
    }
}