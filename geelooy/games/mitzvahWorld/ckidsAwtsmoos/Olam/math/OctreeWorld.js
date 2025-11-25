// B"H
// In file: /Olam/math/OctreeWorld.js

import * as THREE  from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from './AwtsmoosOctree.js';
var { Box3, Vector3, Group, Mesh, Sphere, Triangle } = THREE
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

    // Center point of the last update cycle. Used to check if an update is needed.
    #lastUpdateCenter = new Vector3(Infinity, Infinity, Infinity);

    constructor() {}

    /**
     * Ingests a THREE.js Group and distributes its meshes into the octree structure.
     * This is an asynchronous process; the geometry will be available for physics later.
     */
    fromGraphNode(group) {
        if (!group) return;
        const tempBox = new Box3().setFromObject(group);
        if (tempBox.isEmpty()) return;

        if (!this.#root) {
            this.#root = new LODNode(new Box3().copy(tempBox));
        } else {
            this.#root.box.union(tempBox);
        }
        this.#intakeQueue.push({ group });
    }
    
    
    
    /**
 * B"H
 * Synchronously adds a single dynamic object to the physics world.
 * This bypasses the async intake queue for immediate updates.
 * @param {THREE.Mesh} mesh - The mesh to add.
 */
addObject(mesh) {
        if (!this.#root || !mesh) return;

        const leafNode = this.#findLeafNodeAtPoint(this.#root, mesh.position);

        if (leafNode) {
            console.log(`[OctreeWorld] Found leaf node for new object. Triggering synchronous rebuild.`);
            this.#synchronouslyRebuildNode(leafNode, mesh); // Call the new, dedicated function
            console.log(`[OctreeWorld] Dynamically added "${mesh.name}" to physics node.`);
        } else {
            console.warn(`[OctreeWorld] Could not find a physics node for dynamic object: ${mesh.name}`);
        }
    }
    
    
    /**
     * B"H
     * Removes a mesh from the physics world.
     * OPTIMIZED: Uses "Soft Delete" for instant response.
     * Schedules a background cleanup to prevent freezing.
     */
    removeMesh(mesh) {
        if (!this.#root || !mesh) return;

        let found = false;

        // 1. Dynamic Nodes (Fast - Keep this)
        // Small chunks are fast to rebuild, so we do them immediately to keep memory low.
        const meshBox = new THREE.Box3().setFromObject(mesh);
        const nodes = this.#findLeafNodesInBox(this.#root, meshBox);

        nodes.forEach(node => {
            if (node.physicsMeshGroup && node.physicsMeshGroup.children.includes(mesh)) {
                node.physicsMeshGroup.remove(mesh);
                found = true;
                
                if (node.state === NODE_STATE.READY && node.physics) {
                    node.physics.removeMesh(mesh); // Fast for small nodes
                    
                    if (node.physics.getTotalTriangleCount() === 0) {
                        node.state = NODE_STATE.EMPTY;
                    }
                }
            }
        });

        // 2. Static World (The Freeze Source)
        // If it wasn't dynamic, it's in the massive static tree.
        // WE DO NOT REBUILD HERE. The '!parent' check in AwtsmoosOctree makes collision ignore it instantly.
        if (!found && this.#root.physics) {
            // Just log it. The visual removal (removeFromParent) is enough for gameplay.
            // We schedule a background cleanup to run when the browser is idle.
            this.scheduleStaticCleanup();
        }
    }

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
        if (node.state === NODE_STATE.READY) return; // Already done
        
        if (!node.physics) node.physics = new AwtsmoosOctree();
        else node.physics.clear();
        
        node.physics.box.copy(node.box);
        node.physics._isManaged = true;
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.physicsMeshGroup.userData.isPreTransformed = true;
            node.physics.fromGraphNode(node.physicsMeshGroup);
            node.physics.build();
            console.log(`[OctreeWorld] ASYNC build complete for node. Triangle count: ${node.physics.getTotalTriangleCount()}`);
        }
        
        node.state = NODE_STATE.READY;
    }
    
     /**
     * B"H
     * This new function ONLY handles synchronous rebuilds for dynamic objects.
     * It safely handles all cases: adding to an empty node, or adding to a node
     * that already contains the static world geometry.
     */
    #synchronouslyRebuildNode(node, newMesh) {
    console.log(`[OctreeWorld] DYNAMIC ADD triggered.`);

    if (node.state !== NODE_STATE.READY) {
        console.warn('[OctreeWorld] Node was not ready. Forcing async build as fallback.');
        this.#buildNodePhysics(node);
    }
    
    const geometry = newMesh.geometry.toNonIndexed();
    const positionAttribute = geometry.getAttribute('position');

    if (positionAttribute) {
        for (let i = 0; i < positionAttribute.count; i += 3) {
            const v1 = new Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
            const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
            const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
            const newTriangle = new Triangle(v1, v2, v3);
            
            // --- B"H FIX: Attach the mesh to the physics triangle so we know WHAT we hit ---
            newTriangle.sourceMesh = newMesh; 
            // ---------------------------------------------------------------------------

            // Call our new, SAFE method. It doesn't rebuild anything!
            node.physics.addDynamicTriangle(newTriangle);
        }
    }
    geometry.dispose();

    console.log(`[OctreeWorld] DYNAMIC ADD complete. Added 12 triangles to the dynamic list.`);
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
     * Performs a fast, READ-ONLY collision query.
     * It IGNORES any part of the world that is not in the 'READY' state.
     * This function's simplicity is the key to its performance.
     */
    capsuleIntersect(capsule) {
        if (!this.#root) return false;

        const testCapsule = capsule.clone();

        // Manually create a bounding box that perfectly encloses the capsule.
        const capsuleBox = new Box3();
        capsuleBox.set(testCapsule.start, testCapsule.end);
        capsuleBox.expandByScalar(testCapsule.radius);
        // --- END OF FIX ---
        
        const candidates = this.#findLeafNodesInBox(this.#root, capsuleBox);
        
        for (const node of candidates) {
            if (node.state === NODE_STATE.READY && node.physics) {
                const result = node.physics.capsuleIntersect(testCapsule);
                if (result) {
                    testCapsule.translate(result.normal.multiplyScalar(result.depth));
                }
            }
        }
        
        const correction = testCapsule.getCenter(new Vector3()).sub(capsule.getCenter(new Vector3()));
        const depth = correction.length();
        return (depth > 1e-9) ? { normal: correction.normalize(), depth } : false;
    }

    // --- PRIVATE METHODS ---

    #processIntakeQueue() {
        if (this.#intakeQueue.length === 0) return;
        
        while (this.#intakeQueue.length > 0) {
            const { group } = this.#intakeQueue.shift();
            group.updateWorldMatrix(true, true);

            group.traverse(mesh => {
                if (!mesh.isMesh || !mesh.geometry.getAttribute('position') || mesh.userData.notSolid) return;
                
                if (mesh.geometry.boundingBox === null) mesh.geometry.computeBoundingBox();

                const physicsClone = new Mesh(mesh.geometry); // Material is irrelevant for physics
                
                // --- Definitive Positioning Fix: Reconstruct matrix for a perfect, stable clone ---
                mesh.getWorldPosition(physicsClone.position);
                mesh.getWorldQuaternion(physicsClone.quaternion);
                mesh.getWorldScale(physicsClone.scale);
                physicsClone.updateMatrix();
                physicsClone.updateMatrixWorld(true);

                this.#distributeMeshes(this.#root, physicsClone);
            });
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

    #processQueues() {
        // Priority: Build > Subdivide > Merge
        this.#processQueue(this.#buildQueue, this.#buildsPerFrame, this.#buildNodePhysics.bind(this));
        this.#processQueue(this.#subdivisionQueue, this.#subdivisionsPerFrame, this.#subdivide.bind(this));
        this.#processQueue(this.#mergeQueue, this.#mergesPerFrame, this.#merge.bind(this));
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
    
    /**
     * Performs a fast, read-only raycast against the world.
     * This method is architecturally safe:
     * - It is extremely fast, as it only queries nodes the ray physically passes through.
     * - It NEVER builds or modifies geometry.
     * - It ONLY returns intersections with geometry that is in the 'READY' state,
     *   ensuring it never causes a performance stutter and respects the LOD system.
     * @param {THREE.Ray} ray The ray to test against the world.
     * @returns {object|false} The closest intersection object from AwtsmoosOctree, or false if no intersection.
     */
    rayIntersect(ray) {
        if (!this.#root) {
            return false;
        }

        let closestResult = false;
        const candidates = [];

        // Inner function to recursively find all leaf nodes the ray passes through.
        // This is much more efficient than checking all nodes.
        const findCandidates = (node) => {
            if (!ray.intersectsBox(node.box)) {
                return;
            }

            if (node.type === 'LEAF') {
                candidates.push(node);
            } else if (node.type === 'BRANCH') {
                for (const child of node.children) {
                    findCandidates(child);
                }
            }
        };

        findCandidates(this.#root);

        // Iterate only through the nodes the ray could possibly hit.
        for (const node of candidates) {
            // The critical performance and safety check: ONLY query fully built, ready physics nodes.
            if (node.state === NODE_STATE.READY && node.physics) {
                
                // Delegate the expensive part to the highly optimized AwtsmoosOctree.
                const result = node.physics.rayIntersect(ray);

                // If we found a hit, check if it's the closest one so far.
                if (result) {
                    if (!closestResult || result.distance < closestResult.distance) {
                        closestResult = result;
                    }
                }
            }
        }

        return closestResult;
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
}