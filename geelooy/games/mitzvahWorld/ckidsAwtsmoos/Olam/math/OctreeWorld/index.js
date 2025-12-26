
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import OctreeIntake from './OctreeIntake.js';
import OctreeQuery from './OctreeQuery.js';
import OctreeBuilder from './OctreeBuilder.js';

export class OctreeWorld {
    root = null;
    pendingOctrees = [];
    
    safeRadiusSq = 400;
    lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);

    constructor() {
        this.builder = new OctreeBuilder(this);
        this.intake = new OctreeIntake(this);
        this.query = new OctreeQuery(this);
    }
    
    get isProcessing() {
        return this.intake.isProcessing;
    }

    update(focus, velocity) {
        // 1. Process new additions regardless of player position
        this.intake.processQueues(); 

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;
        
        // 2. Check if we moved far enough to trigger a rebuild shift
        const needsUpdate = foci.some(f => f.position.distanceToSquared(this.lastUpdateCenter) > this.safeRadiusSq);

        if (!needsUpdate) {
            // Just continue processing existing background jobs
            this.intake.processQueues();
            return;
        }

        // 3. Re-center update bubble
        this.lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this.lastUpdateCenter.add(f.position));
        this.lastUpdateCenter.divideScalar(foci.length);

        // 4. Critical Path (Fast objects entering empty nodes)
        this.intake.enforceCriticalPath(foci);

        // 5. Level of Detail Analysis (Subdivide close, merge far)
        this.intake.assessAndQueueWork(foci);

        // 6. Execute background work (again to ensure throughput)
        this.intake.processQueues();
        
        // 7. Cleanup Satellite Physics (Temporary objects created instantly on load)
        if (this.pendingOctrees.length > 0) {
            const now = performance.now();
            this.pendingOctrees = this.pendingOctrees.filter(sat => {
                 // Keep satellites alive for at least 3 seconds to cover load times
                 if (now - sat.creationTime < 3000) return true;
                 
                 // If the main OctreeWorld node at this position is READY, we can drop the satellite
                 const center = sat.box.getCenter(new THREE.Vector3());
                 const mainNode = this.intake.findLeafNodeAtPoint(this.root, center);
                 if (mainNode && mainNode.state === 'READY') {
                     return false; 
                 }
                 return true; 
            });
        }
    }

    // Proxy Methods
    rayIntersect(ray) { return this.query.rayIntersect(ray); }
    capsuleIntersect(capsule) { return this.query.capsuleIntersect(capsule); }
    addObject(mesh) { return this.intake.addObject(mesh); }
    removeMesh(mesh) { return this.intake.removeMesh(mesh); }
    fromGraphNode(group) { return this.intake.fromGraphNode(group); }
}
