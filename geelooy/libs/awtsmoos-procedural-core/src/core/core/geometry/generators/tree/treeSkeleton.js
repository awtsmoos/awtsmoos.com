
// B"H
/**
 * @file treeSkeleton.js
 * @brief The Architect. Determines the path, thickness, and structure of the tree.
 *        Uses Golden Angle Phyllotaxis for perfect 360-degree branch distribution.
 */
import { Vec3 } from '../../../math/vec3.js';
import { Quat } from '../../../math/quat.js';

export class TreeSkeleton {
    constructor(context, geometry, leafGen) {
        this.ctx = context;
        this.geo = geometry;
        this.leafGen = leafGen;
    }

    grow(startPos, startDir, length, radius, level) {
        // B"H - Optimization: Reduce segments for tiny twigs to save triangles
        let segMult = level > 2 ? 0.5 : 1.0;
        const segments = Math.max(2, Math.floor(this.ctx.getParam('segments', level, 6) * (length / 5) * segMult));
        
        const segLen = length / segments;
        const radialSegs = Math.max(3, Math.floor(this.ctx.getParam('sections', level, 6)));
        const taper = this.ctx.getParam('taper', level, 0.7);
        const gnarl = this.ctx.getParam('gnarliness', level, 0.1);
        
        let pos = [...startPos];
        let dir = Vec3.normalize([...startDir]);
        let currentRadius = radius;
        let vCoord = 0;

        let frameNormal = Math.abs(dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
        let frameBinormal = Vec3.normalize(Vec3.cross(dir, frameNormal));
        frameNormal = Vec3.normalize(Vec3.cross(frameBinormal, dir)); 

        let prevRingStart = -1;
        const spine = [];
        spine.push({ pos: [...pos], dir: [...dir], radius: currentRadius });

        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            currentRadius = radius * (1.0 - taper * progress);
            if (currentRadius < 0.005) currentRadius = 0.005;

            const ringStartIdx = this.geo.addRing(pos, frameNormal, frameBinormal, currentRadius, radialSegs, vCoord);
            if (prevRingStart !== -1) this.geo.stitchRings(prevRingStart, ringStartIdx, radialSegs);
            prevRingStart = ringStartIdx;

            if (i < segments) {
                let nextDir = [...dir];
                
                // Forces
                const force = this.ctx.options.branch.force;
                if (force) {
                    const fStr = force.strength || 0;
                    const fDir = [force.direction.x, force.direction.y, force.direction.z];
                    nextDir = Vec3.add(nextDir, Vec3.scale(fDir, fStr));
                }

                // Gnarliness & Twist
                const twist = level * 0.2; 
                const noise = [
                    this.ctx.rng.range(-gnarl, gnarl) + Math.sin(i * 0.8) * twist * 0.15,
                    this.ctx.rng.range(-gnarl, gnarl),
                    this.ctx.rng.range(-gnarl, gnarl) + Math.cos(i * 0.8) * twist * 0.15
                ];
                nextDir = Vec3.add(nextDir, noise);
                nextDir = Vec3.normalize(nextDir);

                // Transport Frame
                const rotQuat = Quat.setFromUnitVectors(dir, nextDir);
                frameNormal = Quat.applyToVec3(frameNormal, rotQuat);
                frameBinormal = Quat.applyToVec3(frameBinormal, rotQuat);
                
                dir = nextDir;
                pos = Vec3.add(pos, Vec3.scale(dir, segLen));
                vCoord += segLen * 0.5; 

                spine.push({ pos: [...pos], dir: [...dir], radius: currentRadius });
            }
        }

        this.geo.capTip(prevRingStart, radialSegs, pos, dir, vCoord);

        const maxLevels = this.ctx.options.branch.levels;
        if (level < maxLevels) {
            this.spawnChildren(spine, length, level);
        }
        
        // Spawn leaves on terminal branches AND sub-terminal high branches
        if (level >= maxLevels - 1) {
            this.leafGen.populateBranch(spine, level, maxLevels);
        }
    }

    spawnChildren(spine, parentLen, level) {
        const childCount = this.ctx.getParam('children', level, 0);
        if (childCount === 0) return;

        const startRatio = this.ctx.getParam('start', level, 0.1);
        const startIdx = Math.floor(spine.length * startRatio);
        const safeStartIdx = Math.max(0, Math.min(startIdx, spine.length - 2));
        const availableSegments = spine.length - 1 - safeStartIdx;
        if (availableSegments <= 0) return;

        const zoneSize = availableSegments / childCount;
        const goldenAngle = 2.39996; // Radians (~137.5 deg)

        // B"H - Randomize initial spiral offset per branch to avoid identical trees
        let spiralOffset = this.ctx.rng.rand() * Math.PI * 2; 

        for (let c = 0; c < childCount; c++) {
            const zoneStart = safeStartIdx + (c * zoneSize);
            const zoneEnd = zoneStart + zoneSize;
            let idx = Math.floor(this.ctx.rng.range(zoneStart, zoneEnd));
            idx = Math.max(0, Math.min(idx, spine.length - 1));

            const parentNode = spine[idx];
            
            // B"H - Golden Angle Distribution
            // Construct a local basis frame relative to the parent branch direction
            let up = [0, 1, 0];
            if (Math.abs(Vec3.dot(parentNode.dir, up)) > 0.9) up = [1, 0, 0];
            let right = Vec3.normalize(Vec3.cross(parentNode.dir, up));
            let forward = Vec3.normalize(Vec3.cross(right, parentNode.dir));

            // Rotate around the parent direction by the spiral angle
            const theta = spiralOffset + (c * goldenAngle);
            const sinT = Math.sin(theta);
            const cosT = Math.cos(theta);
            
            // Radial vector in the plane perpendicular to parentDir
            // radial = right * cos(theta) + forward * sin(theta)
            let radial = Vec3.add(
                Vec3.scale(right, cosT),
                Vec3.scale(forward, sinT)
            );
            
            // Branch Angle (angle away from parent dir)
            const angleDeg = this.ctx.getParam('angle', level, 45);
            const angleRad = (angleDeg * Math.PI) / 180;
            
            // Final Child Direction: Mix ParentDir and Radial Vector
            // dir = parentDir * cos(branchAngle) + radial * sin(branchAngle)
            let childDir = Vec3.add(
                Vec3.scale(parentNode.dir, Math.cos(angleRad)),
                Vec3.scale(radial, Math.sin(angleRad))
            );
            childDir = Vec3.normalize(childDir);

            // Twig Scaling
            let lenMult = 0.6 + this.ctx.rng.range(-0.1, 0.1);
            if (c > childCount * 0.7) lenMult *= 0.6; // Smaller at tip

            const childLen = this.ctx.getParam('length', level+1, parentLen * lenMult);
            const childRad = parentNode.radius * 0.75; 

            this.grow(parentNode.pos, childDir, childLen, childRad, level + 1);
        }
    }
}
