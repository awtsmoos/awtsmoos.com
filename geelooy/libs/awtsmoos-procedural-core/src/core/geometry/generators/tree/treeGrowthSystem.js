
// B"H
import { Vec3 } from '../../../math/vec3.js';
import { Quat } from '../../../math/quat.js';

export class TreeGrowthSystem {
    constructor(config, rng, geometry) {
        this.config = config;
        this.rng = rng;
        this.geo = geometry;
        this.queue = [];
    }

    generate() {
        // Root Branch (Trunk)
        this.growBranch(
            [0,0,0], 
            [0,0,0,1], // Identity Quaternion (Up) assuming Y is up and we rotate to it? 
            // Wait, Quat.applyToVec3([0,1,0], q) -> Dir.
            // Identity Q maps (0,1,0) to (0,1,0). So trunk grows UP.
            this.config.branch.length[0],
            this.config.branch.radius[0],
            0
        );
        
        // Process queue (Breadth-first generation)
        while(this.queue.length > 0) {
            const task = this.queue.shift();
            this.growBranch(task.pos, task.rot, task.len, task.rad, task.level);
        }
    }

    growBranch(startPos, startRot, length, radius, level) {
        const conf = this.config.branch;
        const sections = conf.sections[level] || 6;
        const segments = conf.segments[level] || 6;
        const taper = conf.taper[level] || 0.7;
        const gnarl = conf.gnarliness[level] || 0;
        const force = conf.force;
        
        let pos = [...startPos];
        let rot = [...startRot]; // Quaternion
        let rad = radius;
        
        const segLen = length / segments;
        let vCoord = 0;
        
        // Track spine for leaves
        const spine = [];
        
        let prevRingIdx = -1;

        // Current Direction vector from rotation
        let dir = Quat.applyToVec3([0, 1, 0], rot); 

        for(let i=0; i<=segments; i++) {
            const t = i / segments;
            rad = radius * (1.0 - taper * t);
            if (rad < 0.01) rad = 0.01;

            const ringIdx = this.geo.addBranchSection(pos, rot, rad, sections, vCoord, i===segments);
            if (prevRingIdx !== -1) this.geo.stitch(prevRingIdx, ringIdx, sections);
            prevRingIdx = ringIdx;
            
            spine.push({ pos: [...pos], rot: [...rot], rad });

            if (i < segments) {
                // 1. Gnarliness (Random Rotation)
                if (gnarl > 0) {
                    const rx = this.rng.random(-gnarl, gnarl);
                    const rz = this.rng.random(-gnarl, gnarl);
                    // Perturb direction
                    // Ideally we perturb the Quaternion, but perturbing vector + lookAt is easier for "Forces"
                    dir = Vec3.normalize(Vec3.add(dir, [rx, 0, rz]));
                }

                // 2. Force (Gravity/Wind)
                if (force && force.strength !== 0) {
                    const f = [force.direction.x, force.direction.y, force.direction.z];
                    dir = Vec3.add(dir, Vec3.scale(f, force.strength));
                    dir = Vec3.normalize(dir);
                }

                // Re-orient Quaternion to new Dir
                const up = [0, 1, 0];
                const targetRot = Quat.setFromUnitVectors(up, dir);
                // Smoothly blend rotation to avoid snapping
                rot = Quat.slerp(rot, targetRot, 0.2); 

                pos = Vec3.add(pos, Vec3.scale(dir, segLen));
                vCoord += segLen; // Tile texture
            }
        }
        
        this.geo.addCap(pos, rot, prevRingIdx, sections, vCoord);

        // Spawn Children
        if (level < conf.levels) {
            this.spawnChildren(spine, length, level);
        }
        
        // Spawn Leaves
        if (level >= conf.levels - 1 || (this.config.type === 'evergreen' && level > 0)) {
            this.spawnLeaves(spine);
        }
    }

    spawnChildren(spine, parentLen, level) {
        const conf = this.config.branch;
        const count = conf.children[level] || 0;
        if (count === 0) return;
        
        const startRatio = conf.start[level+1] || 0; 
        const startIndex = Math.floor(spine.length * startRatio);
        const available = spine.length - startIndex;
        
        if (available <= 0) return;

        for(let i=0; i<count; i++) {
            // Distribute along available spine
            const idx = startIndex + Math.floor(this.rng.random(0, available));
            if (idx >= spine.length) continue;
            
            const node = spine[idx];
            
            // Branch Angle (Pitch down/up from parent vector)
            const branchAngleDeg = conf.angle[level+1] || 45;
            const branchAngle = (branchAngleDeg * Math.PI) / 180;
            
            // Roll (Spin around parent vector)
            const roll = this.rng.random(0, Math.PI * 2);
            
            // Create Child Rotation:
            // 1. Start with Parent Rotation (node.rot)
            // 2. Roll around Y (which maps to Local Up/Dir)
            // 3. Pitch around X (to branch out)
            
            // Note: Our base orientation maps Y to Dir.
            // So Roll is around Y. Pitch is around X.
            
            const rollQ = Quat.setFromAxisAngle([0, 1, 0], roll);
            const pitchQ = Quat.setFromAxisAngle([1, 0, 0], branchAngle);
            
            // Combine: Parent * Roll * Pitch
            let childRot = Quat.multiply(node.rot, rollQ);
            childRot = Quat.multiply(childRot, pitchQ);
            
            const childLen = (conf.length[level+1] || parentLen * 0.5) * this.rng.random(0.8, 1.2);
            const childRad = node.rad * 0.8; // Smaller than parent point
            
            this.queue.push({ pos: node.pos, rot: childRot, len: childLen, rad: childRad, level: level + 1 });
        }
    }

    spawnLeaves(spine) {
        const lConf = this.config.leaves;
        if (!lConf || lConf.count === 0) return;
        
        const count = lConf.count;
        const sizeBase = lConf.size;
        
        for(let i=0; i<count; i++) {
            const idx = Math.floor(this.rng.random(0, spine.length));
            const node = spine[idx];
            
            // Jitter position
            const pos = Vec3.add(node.pos, [
                this.rng.random(-0.2, 0.2), 
                this.rng.random(-0.2, 0.2), 
                this.rng.random(-0.2, 0.2)
            ]);
            
            // Random Rotation Euler for Billboard
            const rot = [
                this.rng.random(0, Math.PI), 
                this.rng.random(0, Math.PI * 2), 
                this.rng.random(-0.5, 0.5)
            ];
            
            const size = sizeBase * this.rng.random(1.0 - (lConf.sizeVariance||0), 1.0 + (lConf.sizeVariance||0));
            
            this.geo.addLeaf(pos, size, rot, lConf.tint || lConf.color || [0.2, 0.65, 0.18, 1]);
        }
    }
}
