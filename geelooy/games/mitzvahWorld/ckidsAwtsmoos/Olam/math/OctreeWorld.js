// B"H
// In file: /Olam/math/OctreeWorld.js

import * as THREE  from '/games/scripts/build/three.module.js';
import { Capsule } from './Capsule.js'
import { Octree as AwtsmoosOctree } from './AwtsmoosOctree.js';
var { Box3, Vector3, Group, Mesh, Sphere, Triangle, Matrix4} = THREE;
// --- Helper Cache (Module Level) ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _tempBox = new Box3();
const _tempTri = new Triangle();
const _inverseMat = new Matrix4();
const _localCapsule = new Capsule(); // Reused for transforming player to mesh space
const _triBox = new Box3();

const JOB_STEP = {
    CLONE: 0,
    BOUNDS: 1,
    SETUP_ITER: 2,
    PROCESS_TRIS: 3,
    FINALIZE: 4
};

// --- Constants for Readability ---
const MAX_DEPTH = 12;
const NODE_STATE = {
    EMPTY: 'EMPTY',             // Contains nothing, structural only.
    PENDING_BUILD: 'PENDING_BUILD', // Contains raw mesh data, needs processing.
    READY: 'READY'              // Contains a fully built AwtsmoosOctree, ready for collision.
};

class LODNode {
    box;
    children = [];
    type = 'LEAF';
    state = NODE_STATE.EMPTY;
    physics = null;
    physicsMeshGroup = new Group();
    constructor(box) { this.box = box; }
}

export class OctreeWorld {
    #root = null;
    #intakeQueue = [];
    #buildQueue = new Set();
    #subdivisionQueue = new Set();
    #mergeQueue = new Set();
	#pendingMeshLayer = new Set(); // B"H - Holds objects for INSTANT collision before Octree is ready
    // --- The Three Zones of Operation ---
    // 1. The player can move within this radius without triggering ANY update logic. This is the "idle zone".
    #safeRadiusSq = 400; // (20*20)

    // 2. The target radius for our bubble of "READY" physics. Adapts to velocity.
    #baseBuildRadius = 60;

    // 3. Any Branch node outside this radius for ALL players is a candidate for memory reclamation.
    #mergeRadius = 120;

    // The factor by which velocity increases the build radius, ensuring the bubble stays ahead of the player.
    #velocityLookaheadFactor = 2.0;
    
    // --- Throttling for Asynchronous Work ---
    // Controls how much work we do per update frame to prevent stutters.
    #buildsPerFrame = 6;
    #subdivisionsPerFrame = 2;
    #mergesPerFrame = 4; // Unloading is lower priority.
	#pendingOctrees = []; // B"H - Holds fully functional mini-octrees for new objects
    // Center point of the last update cycle. Used to check if an update is needed.
    #lastUpdateCenter = new Vector3(Infinity, Infinity, Infinity);
	#conversionQueue = []; 
    #pendingInsertionQueue = [];
	#activeJob = null; 
	#proxies = []; // Lightweight temporary collision barriers
    constructor() {}

    
    
    
    
    

    
    
    
   

    // Debounce timer for cleanup
    #cleanupTimer = null;

    scheduleStaticCleanup() {
        if (this.#cleanupTimer) clearTimeout(this.#cleanupTimer);
        
        // Wait 2 seconds of inactivity, then clean up in the background
        this.#cleanupTimer = setTimeout(() => {
            this.#performBackgroundCleanup();
        }, 2000);
    }

    #performBackgroundCleanup() {
        // B"H FIX: Use 'self' because we are in a Web Worker, not the main window
        if (self.requestIdleCallback) {
            self.requestIdleCallback(() => {
                if (this.#root.physics) {
                    console.log("B\"H - Running Background Octree Cleanup...");
                    this.#root.physics.pruneDeadTriangles();
                }
            });
        } else {
            // Fallback for environments without idle callback
            setTimeout(() => {
                if (this.#root.physics) this.#root.physics.pruneDeadTriangles();
            }, 50);
        }
    }
    
    
 #buildNodePhysics(node) {
        // B"H
        // The Lag Prevention Valve.
        
        // 1. Count potential triangles
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        // 2. SAFETY CHECK: If the node is a "Monster" (> 15,000 triangles),
        // DO NOT BUILD IT. 
        // Building a 15k+ node takes >10ms, which causes stutter.
        // We leave it as 'PENDING_BUILD'. The 'addObject' method already created a 
        // "Satellite Octree" for this object, so collision still works perfectly!
        // This effectively disables the background merge for massive objects, keeping FPS high.
        if (totalTriangles > 15000) {
            return; 
        }

        // 3. Normal Build (For small/medium chunks)
        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.physicsMeshGroup.userData.isPreTransformed = true;
            newPhysics.fromGraphNode(node.physicsMeshGroup);
            newPhysics.build();
        }
        
        // Transfer dynamic items
        if (node.physics && node.physics.dynamicTriangles.length > 0) {
            for(const tri of node.physics.dynamicTriangles) {
                if(tri.sourceMesh) newPhysics.addDynamicTriangle(tri);
            }
        }
        
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }
    
     /**
     * B"H
     * This new function ONLY handles synchronous rebuilds for dynamic objects.
     * It safely handles all cases: adding to an empty node, or adding to a node
     * that already contains the static world geometry.
     */
    /**
     * B"H
     * Safely injects temporary collision.
     * UPDATED: Includes a "Large Object" safeguard.
     * If the object is too complex, we don't freeze the thread analyzing it.
     * Instead, we throw a simple "Box" into the physics to catch the player.
     * The detailed physics will arrive when the background builder finishes.
     */
    #synchronouslyRebuildNode(node, newMesh) {
        const geometry = (newMesh.geometry.index) ? newMesh.geometry.toNonIndexed() : newMesh.geometry;
        const count = geometry.getAttribute('position').count;
        
        // LIMIT: If mesh has > 1500 vertices (approx 500 tris), it's too heavy to inject synchronously 
        // without lag. Use a Box Proxy instead.
        if (count > 1500) {
            // Create a temporary Box representation (12 triangles)
            if (!newMesh.geometry.boundingBox) newMesh.geometry.computeBoundingBox();
            const box = newMesh.geometry.boundingBox.clone().applyMatrix4(newMesh.matrixWorld);
            const size = box.getSize(new Vector3());
            const center = box.getCenter(new Vector3());
            
            // Create 12 triangles representing this box
            // (We construct a simple virtual box mesh for the physics engine)
            const boxGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
            boxGeo.translate(center.x, center.y, center.z); // Move to world position directly
            
            const pos = boxGeo.attributes.position;
            const v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();
            
            for (let i = 0; i < pos.count; i += 3) {
                 v1.fromBufferAttribute(pos, i);
                 v2.fromBufferAttribute(pos, i+1);
                 v3.fromBufferAttribute(pos, i+2);
                 const tri = new Triangle(v1.clone(), v2.clone(), v3.clone());
                 
                 if (node.box.intersectsTriangle(tri)) {
                     tri.sourceMesh = newMesh; // Link to real mesh for logic
                     node.physics.addDynamicTriangle(tri);
                 }
            }
            boxGeo.dispose();
            return;
        }

        // --- Standard Detailed Injection (For small objects) ---
        const positionAttribute = geometry.getAttribute('position');
        const v1 = new Vector3(), v2 = new Vector3(), v3 = new Vector3();

        if (positionAttribute) {
            for (let i = 0; i < positionAttribute.count; i += 3) {
                v1.fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
                v2.fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
                v3.fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
                
                const newTriangle = new Triangle(v1.clone(), v2.clone(), v3.clone());
                
                // Bounds check for optimization
                if(!node.box.intersectsTriangle(newTriangle)) continue;

                newTriangle.sourceMesh = newMesh; 
                node.physics.addDynamicTriangle(newTriangle);
            }
        }
        if(newMesh.geometry.index) geometry.dispose();
    }
    
    
    /**
     * B"H
     * Standard Raycast.
     * UPDATE: We now check 'node.physics' directly. 
     * Even if the state is 'PENDING_BUILD' (under construction), we rely on the 
     * existing (old) physics data to keep the player from falling into the void.
     */
    rayIntersect(ray) {
        let closestResult = false;
        
        const check = (octree) => {
            const res = octree.rayIntersect(ray);
            if (res && (!closestResult || res.distance < closestResult.distance)) {
                closestResult = res;
            }
        };

        // 1. Main World
        if (this.#root) {
            const candidates = this.#findLeafNodesInBox(this.#root, this.#root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }

        // 2. Satellites
        for (const sat of this.#pendingOctrees) {
            if (ray.intersectsBox(sat.box)) {
                check(sat);
            }
        }

        return closestResult;
    }


    /**
     * The main entry point. It's the "brain" of the system.
     * It's idle by default and only performs work if a focus point moves significantly.
     * This method correctly handles both single-player and multi-player (array of foci) scenarios.
     * @param {object|object[]} focus - The player(s) to track. E.g., { position: Vector3, velocity: Vector3 }.
     */
    update(focus, velocity) {
        if (!this.#root) return;
        
        // Always process the intake queue to add new world geometry.
        this.#processIntakeQueue();

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;

        // --- Gatekeeper Logic ---
        // Check if ANY player has moved outside the safe zone from the last update center.
        const needsUpdate = foci.some(f => f.position.distanceToSquared(this.#lastUpdateCenter) > this.#safeRadiusSq);
        
        // If no significant movement, we only process the existing background queues. The system is mostly idle.
        if (!needsUpdate) {
            // B"H FIX: Added '#' to call the private method correctly
            this.#processQueues(); 
            return;
        }

        // --- A SIGNIFICANT MOVEMENT HAS OCCURRED ---

        // 1. Re-center our bubble to the average position of all players.
        this.#lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this.#lastUpdateCenter.add(f.position));
        this.#lastUpdateCenter.divideScalar(foci.length);

        // --- EXECUTE WORK IN STRICT PRIORITY ORDER ---
        
        // ** PHASE 1 (HIGHEST PRIORITY): THE CRITICAL PATH GUARANTEE **
        // Synchronously build the ground immediately in front of each player to guarantee no fall-throughs.
        this.#enforceCriticalPath(foci);

        // ** PHASE 2 & 3: ASYNCHRONOUS BUBBLE MANAGEMENT **
        // Traverse the tree ONCE to decide what work needs to be done.
        this.#assessAndQueueWork(this.#root, foci);
        
        // Process a chunk of the queued work.
        this.#processQueues();
    }
    
    /**
     * B"H
     * Reverted to standard, reliable Octree collision.
     */
    /*capsuleIntersect(capsule) {
        if (!this.#root) return false;

        const testCapsule = capsule.clone();
        const capsuleBox = new Box3();
        
        // Standard Box setup
        capsuleBox.set(testCapsule.start, testCapsule.end);
        capsuleBox.expandByScalar(testCapsule.radius);
        
        let hit = false;

        const candidates = this.#findLeafNodesInBox(this.#root, capsuleBox);
        
        for (const node of candidates) {
            if (node.state === NODE_STATE.READY && node.physics) {
                const result = node.physics.capsuleIntersect(testCapsule);
                if (result) {
                    testCapsule.translate(result.normal.multiplyScalar(result.depth));
                    hit = true;
                }
            }
        }
        
        const correction = testCapsule.getCenter(new Vector3()).sub(capsule.getCenter(new Vector3()));
        const depth = correction.length();
        return (depth > 1e-9) ? { normal: correction.normalize(), depth } : false;
    }*/
    
    capsuleIntersect(capsule) {
        let hit = false;
        const testCapsule = capsule.clone();
        
        // Helper to run logic on any octree
        const checkOctree = (octree) => {
             const result = octree.capsuleIntersect(testCapsule);
             if (result) {
                 testCapsule.translate(result.normal.multiplyScalar(result.depth));
                 hit = true;
             }
        };

        // 1. CHECK MAIN WORLD
        if (this.#root) {
            const capsuleBox = new Box3();
            capsuleBox.min.copy(testCapsule.start).min(testCapsule.end).subScalar(testCapsule.radius);
            capsuleBox.max.copy(testCapsule.start).max(testCapsule.end).addScalar(testCapsule.radius);
            
            const candidates = this.#findLeafNodesInBox(this.#root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        // 2. CHECK SATELLITES (Pending/New Objects)
        // This is fast because we only check octrees that are actually near the player.
        for (const sat of this.#pendingOctrees) {
            if (sat.box.intersectsBox(_tempBox.setFromPoints([testCapsule.start, testCapsule.end]))) {
                checkOctree(sat);
            }
        }
        
        if (hit) {
            const correction = testCapsule.getCenter(new Vector3()).sub(capsule.getCenter(new Vector3()));
            const depth = correction.length();
            if (depth > 1e-9) return { normal: correction.normalize(), depth };
        }
        return false;
    }

    /**
     * B"H
     * Helper to collide a capsule with a raw THREE.Mesh (no octree).
     * Necessary for the "Pending Layer".
     */
    #intersectCapsuleWithMesh(capsule, mesh) {
        // Simple iteration over geometry position attribute
        // Optimized to use the mesh's World Matrix
        const geo = mesh.geometry;
        const pos = geo.attributes.position;
        const index = geo.index;
        const mw = mesh.matrixWorld;
        
        // Transform capsule to Mesh Local Space? 
        // No, faster to transform Triangle to World Space for accuracy.
        
        let closest = null;
        
        const vA = _v1, vB = _v2, vC = _v3;
        const tri = _tempTri;
        
        const count = index ? index.count : pos.count;
        
        for (let i = 0; i < count; i += 3) {
            let a, b, c;
            if (index) {
                a = index.getX(i); b = index.getX(i+1); c = index.getX(i+2);
            } else {
                a = i; b = i+1; c = i+2;
            }

            vA.fromBufferAttribute(pos, a).applyMatrix4(mw);
            vB.fromBufferAttribute(pos, b).applyMatrix4(mw);
            vC.fromBufferAttribute(pos, c).applyMatrix4(mw);

            tri.set(vA, vB, vC);
            
            // Bounds check
            if (!this.#checkTriangleCapsule(tri, capsule)) continue; // Fast reject

            const res = this.#checkTriangleCapsule(tri, capsule);
            if(res) {
                 if(!closest || res.depth > closest.depth) closest = res;
                 // Push out immediately to handle multiple triangles? 
                 // For pending layer, cumulative push is better.
                 capsule.translate(res.normal.multiplyScalar(res.depth));
            }
        }
        return null; // We translated the capsule in place, return val is symbolic here
    }
    
    /**
     * B"H
     * Resolves collision between a Triangle and Capsule.
     * Features "Face Biasing" to prevent jitter on staircases.
     */
    /**
     * B"H
     * Pure math: World Triangle vs World Capsule.
     * Features face prioritization to prevent jitter on stairs.
     */
    #checkTriangleCapsule(tri, cap) {
        const plane = new THREE.Plane();
        tri.getPlane(plane);
        
        const d1 = plane.distanceToPoint(cap.start) - cap.radius;
        const d2 = plane.distanceToPoint(cap.end) - cap.radius;
        
        // Separation Check (One sided or fully deep)
        if ((d1 > 0 && d2 > 0) || (d1 < -cap.radius && d2 < -cap.radius)) return false;

        const delta = Math.abs(d1 / (Math.abs(d1) + Math.abs(d2)));
        const intersectPoint = _v3.copy(cap.start).lerp(cap.end, delta);
        
        // 1. FACE COLLISION (Preferred for stability)
        if (tri.containsPoint(intersectPoint)) {
            return { normal: plane.normal.clone(), depth: Math.abs(Math.min(d1, d2)) };
        }
        
        // 2. EDGE COLLISION
        const target = new Vector3();
        tri.closestPointToPoint(intersectPoint, target);
        const distSq = target.distanceToSquared(intersectPoint);
        const r2 = cap.radius * cap.radius;

        if(distSq < r2) {
            const dist = Math.sqrt(distSq);
            const depth = cap.radius - dist;
            
            // Vector from geometry -> capsule axis
            const norm = new Vector3().subVectors(intersectPoint, target).normalize();
            
            // B"H STAIR SMOOTHING:
            // If the push vector is roughly UP (similar to face normal), assume it's a floor step 
            // and use the clean face normal to prevent sliding off the edge.
            if(norm.dot(plane.normal) > 0.5) {
                 return { normal: plane.normal.clone(), depth: depth };
            }

            return { normal: norm, depth: depth };
        }
        return false;
    }
    // --- PRIVATE METHODS ---

    /**
     * B"H
     * The Digestive System of the World.
     * Takes raw generic objects and distributes them into the spatial Tree (LODNodes).
     * CRUCIAL CHANGE: We do NOT trigger 'buildNodePhysics' here. 
     * We only plant the seeds (Meshes) into the soil (Nodes). They will sprout (Build)
     * only when the water (Player) comes near.
     */
    #processIntakeQueue() {
        const deadline = performance.now() + 4; // Give it a bit more time

        while (this.#intakeQueue.length > 0) {
            if (performance.now() > deadline) return;

            const job = this.#intakeQueue[0];
            
            if (job.group) {
                const meshes = [];
                job.group.traverse(obj => {
                    if (obj.isMesh && obj.geometry.getAttribute('position') && !obj.userData.notSolid) {
                        meshes.push(obj);
                    }
                });
                this.#intakeQueue.shift();
                for(const m of meshes) this.#intakeQueue.unshift({ mesh: m });
                continue;
            }

            const { mesh } = this.#intakeQueue.shift();
            
            // Clone for Octree
            const clone = new Mesh(mesh.geometry.clone()); // Clone geometry to be safe for threading
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            clone.userData = mesh.userData;

            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);

            this.#insertMeshOnly(this.#root, clone, worldBox);
        }
    }
    
    /**
     * B"H
     * Renamed from #insertAndBuildRecursive.
     * Places the mesh into the correct Leaf node(s).
     * CHANGE: Does NOT call this.#buildNodePhysics(node).
     * This leaves the node in PENDING_BUILD state. The `update()` loop
     * will detect the player's proximity and build it Just-In-Time.
     */
    /**
     * B"H
     * Places the mesh into the correct Leaf node(s).
     * 
     * STRATEGY: "Eaten and Yet Still Whole"
     * 1. We feed the mesh to the 'physicsMeshGroup' for the eventual, optimized static rebuild.
     * 2. We SIMULTANEOUSLY inject the raw triangles into the *current* running physics world.
     * 
     * Result: Immediate collision (0 lag) + Background optimization (High performance).
     */
    #insertMeshOnly(node, mesh, meshBox) {
        // If the light does not fit the vessel, return.
        if (!node.box.intersectsBox(meshBox)) return;

        if (node.type === 'LEAF') {
            // 1. Store for the "Perfect" Static Build (Background/Future)
            // This ensures that when the node eventually rebuilds, it includes this object
            // in the highly optimized Float32Array structure.
            node.physicsMeshGroup.add(mesh);
            node.state = NODE_STATE.PENDING_BUILD;

            // 2. B"H - INSTANT GRATIFICATION (Present)
            // Immediately inject into the CURRENT living physics so the player doesn't fall 
            // while waiting for the background builder.
            // This acts as a temporary bridge until #buildNodePhysics creates the new static world.
            if (node.physics) {
                this.#synchronouslyRebuildNode(node, mesh);
            } else {
                // If there is NO physics world yet (empty node), we must build it immediately
                // because there is nothing to inject into.
                this.#buildNodePhysics(node);
            }
        } else {
            // Pass the light down to the sub-sefiros (children)
            for (const child of node.children) {
                this.#insertMeshOnly(child, mesh, meshBox);
            }
        }
    }

    #distributeMeshes(node, mesh) {
        const meshWorldBox = new Box3().setFromObject(mesh);
        if (!node.box.intersectsBox(meshWorldBox)) return;

        if (node.type === 'LEAF') {
            node.physicsMeshGroup.add(mesh);
            node.state = NODE_STATE.PENDING_BUILD;
            return;
        }
        
        if (node.type === 'BRANCH') {
            const intersectingChildren = node.children.filter(child => child.box.intersectsBox(meshWorldBox));

            if (intersectingChildren.length === 1) {
                this.#distributeMeshes(intersectingChildren[0], mesh);
            } else if (intersectingChildren.length > 1) {
                intersectingChildren.forEach(child => {
                    this.#distributeMeshes(child, mesh.clone());
                });
            }
        }
    }

    #enforceCriticalPath(foci) {
        for (const focus of foci) {
            // Predict a critical point slightly ahead of the player.
            const criticalPoint = focus.position.clone().addScaledVector(focus.velocity, 0.25);
            let currentNode = this.#findLeafNodeAtPoint(this.#root, criticalPoint);

            // If the critical node directly under/ahead of the player isn't ready, build it NOW.
            if (currentNode && currentNode.state !== NODE_STATE.READY) {
                this.#buildNodePhysics(currentNode);
            }
        }
    }
    
    #assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new Vector3());
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        // Determine what this node's ideal state is based on the closest player.
        for (const focus of foci) {
            const dynamicBuildRadius = this.#baseBuildRadius + (focus.velocity.length() * this.#velocityLookaheadFactor);
            const distSq = center.distanceToSquared(focus.position);

            if (distSq < dynamicBuildRadius * dynamicBuildRadius) {
                highestPriority = 'BUILD';
                detailLevel = Math.min(detailLevel, distSq); // Closer players demand more detail.
                break; // If any player needs it built, we don't consider merging.
            }
        }

        // --- Take Action based on the assessment ---
        if (highestPriority === 'BUILD') {
            if (node.type === 'BRANCH') { // Recurse if we're a branch in the build zone
                node.children.forEach(child => this.#assessAndQueueWork(child, foci));
            } else { // We are a LEAF in the build zone
                const nodeSizeSq = node.box.getSize(new Vector3()).lengthSq();
                // If the leaf is too large for its proximity to a player, it needs subdivision.
                if (detailLevel < nodeSizeSq * 4 && this.#getNodeDepth(node) < MAX_DEPTH) {
                    this.#subdivisionQueue.add(node);
                }
                // If it needs to be built, queue it.
                else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this.#buildQueue.add(node);
                }
            }
        } else { // highestPriority is 'MERGE'
             // If this node is a branch and outside every player's sphere of influence, queue for merge.
            if (node.type === 'BRANCH' && center.distanceToSquared(this.#lastUpdateCenter) > this.#mergeRadius * this.#mergeRadius) {
                this.#mergeQueue.add(node);
            }
        }
    }

    /**
     * B"H
     * The Time Warden.
     * This ensures we NEVER exceed our frame budget, eliminating lag spikes.
     * It prioritizes work: Intake (New Objects) > Builds (Physics) > Subdivision > Merging.
     */
    #processQueues() {
        const frameBudget = 5; // Milliseconds allowed for physics updates per frame
        const startTime = performance.now();

        // 1. PROCESS INTAKE (Highest Priority - Raw objects waiting to enter the world)
        // We handle these first so new objects appear visually/logically immediately.
        while (this.#intakeQueue.length > 0) {
            if (performance.now() - startTime > frameBudget) return;
            this.#processIntakeQueue(); // (Modified to do one item at a time ideally, or break internal loop)
            // Note: If #processIntakeQueue handles the whole list, we rely on it being fast. 
            // Ideally, #processIntakeQueue should also respect a time limit, but for now we assume intake is fast.
        }

        // 2. PROCESS BUILDS (Critical - Generating collision for waiting nodes)
        // We use a manual iterator to handle the Set safely while time-slicing.
        if (this.#buildQueue.size > 0) {
            const iterator = this.#buildQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                
                const node = result.value;
                this.#buildQueue.delete(node);
                
                // Perform the heavy build
                this.#buildNodePhysics(node);
                
                result = iterator.next();
            }
        }

        // 3. PROCESS SUBDIVISIONS (Detailing)
        if (this.#subdivisionQueue.size > 0) {
            const iterator = this.#subdivisionQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                
                const node = result.value;
                this.#subdivisionQueue.delete(node);
                this.#subdivide(node);
                
                result = iterator.next();
            }
        }

        // 4. PROCESS MERGES (Cleanup - Lowest Priority)
        // Only do this if we have plenty of time left.
        if (this.#mergeQueue.size > 0) {
             const iterator = this.#mergeQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                
                const node = result.value;
                this.#mergeQueue.delete(node);
                this.#merge(node);
                
                result = iterator.next();
            }
        }
        
        // 5. PROCESS CONVERSIONS (The existing activeJob logic)
        // This handles the specialized tasks from the original code (if any exist).
        if (this.#activeJob || this.#conversionQueue.length > 0) {
             const remainingTime = frameBudget - (performance.now() - startTime);
             if (remainingTime > 0) {
                 this.#processActiveJob(remainingTime); // Refactored helper (see below)
             }
        }
        
        // 6. CLEANUP PENDING LAYER (Slowly release the raw objects)
        // If the build queue is empty, it means the Octree has likely caught up.
        // We can start removing items from the pending layer to save performance.
        if (this.#buildQueue.size === 0 && this.#intakeQueue.length === 0 && this.#pendingMeshLayer.size > 0) {
             const now = performance.now();
             for(const mesh of this.#pendingMeshLayer) {
                 // Keep them for at least 2 seconds to ensure the Octree is DEFINITELY ready
                 // and has swapped the pointers.
                 if (now - mesh.userData.creationTime > 2000) {
                     this.#pendingMeshLayer.delete(mesh);
                 }
             }
        }
    }

    // Helper to keep the existing job logic clean
    #processActiveJob(timeLimit) {
        const deadline = performance.now() + timeLimit;
        
        // Start new job if needed
        if (!this.#activeJob && this.#conversionQueue.length > 0) {
            const proxy = this.#conversionQueue.shift();
            this.#activeJob = {
                proxy: proxy, step: JOB_STEP.CLONE, clone: null,
                iter: { idx: 0, count: 0 }, attr: null, index: null, mw: null, affected: new Set()
            };
        }

        const job = this.#activeJob;
        if (!job) return;

        // Run the state machine until deadline
        while (performance.now() < deadline) {
             if (job.step === JOB_STEP.CLONE) {
                job.clone = job.proxy.mesh.clone();
                if(job.clone.parent) job.clone.parent = null;
                job.clone.updateMatrix();
                job.step = JOB_STEP.MATRICES;
                continue;
            }
            if (job.step === JOB_STEP.MATRICES) {
                job.clone.position.copy(job.proxy.mesh.position);
                job.clone.quaternion.copy(job.proxy.mesh.quaternion);
                job.clone.scale.copy(job.proxy.mesh.scale);
                job.clone.updateMatrix();
                job.clone.matrixWorld.copy(job.clone.matrix);
                
                if(!job.clone.geometry.boundingBox) job.clone.geometry.computeBoundingBox();
                const box = _tempBox.setFromObject(job.clone);
                if(this.#root.box.intersectsBox(box)) this.#root.box.union(box);

                job.step = JOB_STEP.SETUP_ITER;
                continue;
            }
            if (job.step === JOB_STEP.BOUNDS) { job.step++; continue; }
            if (job.step === JOB_STEP.SETUP_ITER) {
                const g = job.clone.geometry;
                job.attr = g.attributes.position;
                job.index = g.index;
                job.iter.count = job.index ? job.index.count : job.attr.count;
                job.mw = job.clone.matrixWorld;
                job.step = JOB_STEP.PROCESS_TRIS;
                continue;
            }
            if (job.step === JOB_STEP.PROCESS_TRIS) {
                const batch = 100;
                const target = Math.min(job.iter.idx + batch, job.iter.count);
                const pos=job.attr, idx=job.index, mw=job.mw;
                const v1=_v1, v2=_v2, v3=_v3, tri=_tempTri;

                for (; job.iter.idx < target; job.iter.idx += 3) {
                    let a, b, c;
                    if (idx) {
                        a = idx.getX(job.iter.idx); b = idx.getX(job.iter.idx+1); c = idx.getX(job.iter.idx+2);
                    } else {
                        a = job.iter.idx; b = a+1; c = a+2;
                    }
                    v1.fromBufferAttribute(pos, a).applyMatrix4(mw);
                    v2.fromBufferAttribute(pos, b).applyMatrix4(mw);
                    v3.fromBufferAttribute(pos, c).applyMatrix4(mw);
                    tri.set(v1, v2, v3);
                    tri.sourceMesh = job.clone;
                    this.#distributeTriangleToNodes(this.#root, tri, job.affected);
                }
                if (job.iter.idx >= job.iter.count) job.step = JOB_STEP.FINALIZE;
                continue;
            }
            if (job.step === JOB_STEP.FINALIZE) {
                job.affected.forEach(n => {
                    n.state = NODE_STATE.READY;
                    if (!n.physicsMeshGroup.children.includes(job.clone)) n.physicsMeshGroup.add(job.clone);
                });
                this.#activeJob = null;
                break;
            }
        }
    }
    
    #processQueueTimeSliced(queue, deadline, action) {
        const iterator = queue.values();
        let result = iterator.next();
        
        while (!result.done) {
            // STOP if we run out of time
            if (performance.now() > deadline) return;
            
            const node = result.value;
            queue.delete(node);
            
            // Perform the heavy action (Build/Subdivide)
            action(node);
            
            result = iterator.next();
        }
    }

    #processQueue(queue, limit, action) {
        const iterator = queue.values();
        for (let i = 0; i < limit; i++) {
            const next = iterator.next();
            if (next.done) break;
            const node = next.value;
            queue.delete(node); // Remove from queue before processing.
            action(node);
        }
    }

    

    #subdivide(node) {
        if (node.type === 'BRANCH') return;

        node.type = 'BRANCH';
        if (node.physics) node.physics.clear();
        node.physics = null;
        node.state = NODE_STATE.EMPTY;

        const halfSize = node.box.getSize(new Vector3()).multiplyScalar(0.5);
        for (let i = 0; i < 8; i++) {
            const min = new Vector3(
                node.box.min.x + (i & 1 ? halfSize.x : 0),
                node.box.min.y + (i & 2 ? halfSize.y : 0),
                node.box.min.z + (i & 4 ? halfSize.z : 0)
            );
            node.children.push(new LODNode(new Box3(min, min.clone().add(halfSize))));
        }
        
        const meshesToMove = [...node.physicsMeshGroup.children];
        node.physicsMeshGroup.clear();

        for(const meshToMove of meshesToMove) {
             this.#distributeMeshes(node, meshToMove);
        }

        // After subdividing, the new children might need to be built immediately.
        // Assess them right away.
        const foci = [{ position: this.#lastUpdateCenter, velocity: new Vector3() }];
        node.children.forEach(child => this.#assessAndQueueWork(child, foci));
    }

    #merge(node) {
        const meshesToCollect = [];

        // Traverse all descendants to clear them and collect their meshes.
        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') {
                currentNode.children.forEach(gather);
            }
            meshesToCollect.push(...currentNode.physicsMeshGroup.children);
            if (currentNode.physics) currentNode.physics.clear();
            
            // Clean up queues to prevent memory leaks on merged nodes
            this.#buildQueue.delete(currentNode);
            this.#subdivisionQueue.delete(currentNode);
            this.#mergeQueue.delete(currentNode);
        };
        
        node.children.forEach(gather);
        node.children.length = 0; // All children are gone.
        node.type = 'LEAF';

        // Add all collected meshes back to the new, single leaf node.
        meshesToCollect.forEach(mesh => node.physicsMeshGroup.add(mesh));
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.state = NODE_STATE.PENDING_BUILD;
            // The merged node may need to be built if it's still within range of a player.
            // Let the next update cycle's assessment handle this.
        } else {
            node.state = NODE_STATE.EMPTY;
        }
    }

    // --- UTILITY METHODS ---

    #findLeafNodesInBox(startNode, box, result = []) {
        if (!startNode.box.intersectsBox(box)) return result;
        if (startNode.type === 'LEAF') {
            result.push(startNode);
        } else if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                this.#findLeafNodesInBox(child, box, result);
            }
        }
        return result;
    }
    
    #findLeafNodeAtPoint(startNode, point) {
        if (!startNode.box.containsPoint(point)) return null;
        if (startNode.type === 'LEAF') return startNode;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                const result = this.#findLeafNodeAtPoint(child, point);
                if (result) return result;
            }
        }
        return null;
    }
    
     

    
    
    #distributeTriangleToNodes(node, triangle, affectedNodes) {
        // Check if triangle belongs in this node's vicinity
        if (!node.box.intersectsTriangle(triangle)) return;

        if (node.type === 'LEAF') {
            // Initialize physics container if missing
            if (!node.physics) {
                node.physics = new AwtsmoosOctree(node.box.clone());
                node.physics._isManaged = true;
            }
            
            // --- B"H: ELASTIC EXPANSION FIX ---
            // We must expand the node's boundary to include this specific triangle.
            // Without this, `capsuleIntersect` sees the old small box and ignores these stairs.
            _tempBox.setFromPoints([triangle.a, triangle.b, triangle.c]);
            node.box.union(_tempBox);
            node.physics.box.copy(node.box); 
            // ---------------------------------

            node.state = NODE_STATE.READY;

            const tClone = triangle.clone();
            tClone.sourceMesh = triangle.sourceMesh;
            
            node.physics.addDynamicTriangle(tClone);
            if (affectedNodes) affectedNodes.add(node);
        } else {
            // Recurse
            const len = node.children.length;
            for (let i = 0; i < len; i++) {
                this.#distributeTriangleToNodes(node.children[i], triangle, affectedNodes);
            }
        }
    }

    #getNodeDepth(nodeToFind, startNode = this.#root, depth = 0) {
        if (nodeToFind === startNode) return depth;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                if (child.box.containsBox(nodeToFind.box) || child.box.intersectsBox(nodeToFind.box)) {
                    const foundDepth = this.#getNodeDepth(nodeToFind, child, depth + 1);
                    if (foundDepth !== -1) return foundDepth;
                }
            }
        }
        return -1;
    }
    
    
    addObject(mesh) {
        if (!mesh) return false;

        // 1. Setup Transforms
        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        // 2. Expand World Root (The Kingdom)
        if (!this.#root) {
            this.#root = new LODNode(worldBox.clone());
        } else {
            this.#root.box.union(worldBox);
        }

        // 3. Create the Physics Clone
        const physicsClone = new Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        physicsClone.userData = mesh.userData;
        
        // --- B"H: SATELLITE OCTREE STRATEGY ---
        // Instead of raw brute force, we build a clean, isolated Octree for this object.
        // This solves the "Invisible Globe" because Octree collision math is robust.
        
        const satelliteOctree = new AwtsmoosOctree(worldBox);
        satelliteOctree._isManaged = true; // Tell it not to resize bounds automatically
        
        // We use a temporary group to feed the Octree
        const tempGroup = new Group();
        tempGroup.add(physicsClone);
        
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); // One-time synchronous build (Acceptable cost for instant stability)
        
        // Mark it with creation time so we can merge it later (if we want)
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh; 

        this.#pendingOctrees.push(satelliteOctree);

        // 4. Background Optimization (Optional)
        // We still queue it for the main world, but the Time Warden will handle it gently.
        // The player uses 'satelliteOctree' until the main world absorbs it.
        this.#insertMeshOnly(this.#root, physicsClone, worldBox);

        return true;
    }

    fromGraphNode(group) {
        if (!group) return;
        
        group.updateMatrixWorld(true);
        const groupBox = new Box3().setFromObject(group);
        if (groupBox.isEmpty()) return;

        if (!this.#root) {
            this.#root = new LODNode(groupBox.clone());
        } else {
            this.#root.box.union(groupBox);
        }

        // B"H - Build immediate physics for the static level chunks
        // We split the group into manageable chunks if needed, but for now, 
        // we create one satellite for the whole group to ensure ground exists.
        const satelliteOctree = new AwtsmoosOctree(groupBox);
        satelliteOctree.fromGraphNode(group);
        satelliteOctree.build();
        satelliteOctree.creationTime = performance.now();
        
        this.#pendingOctrees.push(satelliteOctree);

        // Queue for optimized background merging
        this.#intakeQueue.push({ 
            group: group, 
            isStaticWorld: true 
        });
    }

    /**
     * B"H
     * Removal with Immediate Rebuild.
     */
    removeMesh(mesh) {
        if (!this.#root || !mesh) return;

        const meshBox = new Box3().setFromObject(mesh);
        const nodes = this.#findLeafNodesInBox(this.#root, meshBox);

        nodes.forEach(node => {
            if (node.physicsMeshGroup && node.physicsMeshGroup.children.includes(mesh)) {
                node.physicsMeshGroup.remove(mesh);
                if (node.physics) {
                    node.physics.removeMesh(mesh); 
                }
            }
        });
    }

    /**
     * B"H
     * Inserts one mesh and rebuilds ONLY the specific nodes touched.
     */
    #insertAndBuildRecursive(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return;

        if (node.type === 'LEAF') {
            node.physicsMeshGroup.add(mesh);
            this.#buildNodePhysics(node); // Immediate Rebuild
        } else {
            // Recursively pass down to children
            for (const child of node.children) {
                this.#insertAndBuildRecursive(child, mesh, meshBox);
            }
        }
    }

    /**
     * B"H
     * Walks tree and builds any node that has meshes but no physics.
     */
    #rebuildDirtyNodesRecursive(node) {
        if (node.type === 'LEAF') {
            if (node.physicsMeshGroup.children.length > 0) {
                this.#buildNodePhysics(node);
            }
        } else {
            for (const child of node.children) {
                this.#rebuildDirtyNodesRecursive(child);
            }
        }
    }
    
   
    
    
}