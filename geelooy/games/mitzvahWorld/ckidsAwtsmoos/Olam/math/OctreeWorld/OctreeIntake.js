
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

import QueueProcessor from "./intake/QueueProcessor.js";
import LODManager from "./intake/LODManager.js";
import ObjectManager from "./intake/ObjectManager.js";
import Traversal from "./intake/Traversal.js";
import Distribution from "./intake/Distribution.js";

export default class OctreeIntake {
    constructor(world) {
        this.world = world;
        this.intakeQueue = [];
        this.buildQueue = new Set();
        this.subdivisionQueue = new Set();
        this.mergeQueue = new Set();
        
        this.baseBuildRadius = 60;
        this.mergeRadius = 120;
        this.velocityLookaheadFactor = 2.0;
        
        this.lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
    }
    
    get isProcessing() {
        return this.intakeQueue.length > 0 || this.buildQueue.size > 0 || this.subdivisionQueue.size > 0;
    }

    addToQueue(group) {
        this.intakeQueue.push({ group, isStaticWorld: true });
    }
    
    processQueues(frameBudget = 5) {
        const startTime = performance.now();

        while (this.intakeQueue.length > 0) {
            if (performance.now() - startTime > frameBudget) return;
            this.processIntakeQueue();
        }

        if (this.buildQueue.size > 0) {
            const iterator = this.buildQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this.buildQueue.delete(node);
                this.world.builder.buildNodePhysics(node);
                result = iterator.next();
            }
        }

        if (this.subdivisionQueue.size > 0) {
            const iterator = this.subdivisionQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this.subdivisionQueue.delete(node);
                this.subdivide(node);
                result = iterator.next();
            }
        }

        if (this.mergeQueue.size > 0) {
             const iterator = this.mergeQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this.mergeQueue.delete(node);
                this.merge(node);
                result = iterator.next();
            }
        }
        
        if (this.world.builder.activeJob || this.world.builder.conversionQueue.length > 0) {
             const remainingTime = frameBudget - (performance.now() - startTime);
             if (remainingTime > 0) {
                 this.world.builder.processActiveJob(remainingTime, this.distributeTriangleToNodes.bind(this));
             }
        }
    }
}

// B"H - Mixin Logic
Object.assign(OctreeIntake.prototype, QueueProcessor);
Object.assign(OctreeIntake.prototype, LODManager);
Object.assign(OctreeIntake.prototype, ObjectManager);
Object.assign(OctreeIntake.prototype, Traversal);
Object.assign(OctreeIntake.prototype, Distribution);
