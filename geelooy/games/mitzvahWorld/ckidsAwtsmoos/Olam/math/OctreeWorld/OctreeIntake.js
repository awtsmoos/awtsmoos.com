
/**
 * @file OctreeIntake.js
 * @description
 * 🌊 CHAPTER 12: THE GATHERING OF FORMS 🌊
 * 
 * Manages the background ingestion of new world geometry. 
 * Corrected queue processing to prevent infinite building loops.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import QueueProcessor from "./intake/QueueProcessor.js";
import LODManager from "./intake/LODManager.js";
import ObjectManager from "./intake/ObjectManager.js";
import Traversal from "./intake/Traversal.js";

export default class OctreeIntake {
    constructor(world) {
        this.world = world;
        this.intakeQueue = [];
        this.buildQueue = new Set();
        this.subdivisionQueue = new Set();
        this.mergeQueue = new Set();
        this.baseBuildRadius = 75;
    }
    
    get isProcessing() {
        return this.intakeQueue.length > 0 || this.buildQueue.size > 0 || this.subdivisionQueue.size > 0;
    }

    processQueues(budgetMs = 8) {
        const start = performance.now();

        // 1. First Priority: Break down large meshes into chunks
        while (this.intakeQueue.length > 0 && (performance.now() - start < budgetMs)) {
            this.processIntakeQueue();
        }

        // 2. Second Priority: Build physics for chunks near the player
        if (this.buildQueue.size > 0) {
            const it = this.buildQueue.values();
            for (let node of it) {
                if (performance.now() - start > budgetMs) break;
                this.buildQueue.delete(node);
                this.world.builder.buildNodePhysics(node);
            }
        }

        // 3. Maintenance: Manage Detail density
        if (this.subdivisionQueue.size > 0) {
            const it = this.subdivisionQueue.values();
            for (let node of it) {
                if (performance.now() - start > budgetMs) break;
                this.subdivisionQueue.delete(node);
                this.subdivide(node);
            }
        }
    }

    assessAndQueueWork(foci) {
        LODManager.assessAndQueueWork.call(this, foci);
    }
}

import ChasveiAwtsmoos from "../../../utils/ChasveiAwtsmoos.js";

// B"H - Grafting the modular limbs onto the trunk with Divine Emanation
ChasveiAwtsmoos.emanate(OctreeIntake.prototype, [
    QueueProcessor,
    LODManager,
    ObjectManager,
    Traversal
]);
