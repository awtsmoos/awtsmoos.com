
// B"H
import { buildFromScene } from './worldBuilder.js';
import { stepPhysicsSimulation } from './simulationStep.js';
import { Vec3 } from '../../math/vec3.js';

export class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.gravity = [0, -250.0, 0]; 
        this.staticColliders = []; 
        // B"H - 8 sub-steps is a good balance for fast fluid splitting
        this.subSteps = 8; 
        this.frameCount = 0;
    }
    
    clear() {
        this.bodies = [];
        this.staticColliders = [];
    }

    buildFromScene(rootObjects) {
        buildFromScene(this, rootObjects);
    }

    update(dt) {
        this.frameCount++;
        const clampedDt = 0.016; 
        const stepDt = clampedDt / this.subSteps;

        for (let i = 0; i < this.subSteps; i++) {
            stepPhysicsSimulation(this, stepDt);
            this._applyFluidRepulsion();
        }
        
        this.bodies.forEach(b => b.syncVisuals());
    }

    _applyFluidRepulsion() {
        // B"H - Particles push apart strongly to simulate fluid pressure and splitting
        const drivers = this.bodies.filter(b => !b.isStatic && !b.isSleeping);
        for (let i = 0; i < drivers.length; i++) {
            const b1 = drivers[i];
            for (let j = i + 1; j < drivers.length; j++) {
                const b2 = drivers[j];
                const diff = Vec3.sub(b1.pos, b2.pos);
                const distSq = Vec3.dot(diff, diff);
                const combinedRadius = b1.radius + b2.radius;
                const minRange = combinedRadius * 1.8; 
                
                if (distSq < minRange * minRange && distSq > 1e-4) {
                    const dist = Math.sqrt(distSq);
                    // B"H - Stronger repulsion forces the water to split more aggressively
                    const forceMag = (minRange - dist) * 180.0;
                    const normal = Vec3.scale(diff, 1.0 / dist);
                    const forceVec = Vec3.scale(normal, forceMag);
                    
                    b1.applyForce(forceVec);
                    b2.applyForce(Vec3.scale(forceVec, -1));
                }
            }
        }
    }
}
