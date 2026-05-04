
/**
 * @file OctreeWorld.js
 * @description
 * 🏰 THE TEMPLE OF FOUNDATIONS — STABILITY TIKKUN 🏰
 * 
 * "And the gold of that land is good." (Bereishit 2:12)
 * 
 * If the world is built on a zero-height plane, the soul falls into the abyss.
 * We ensure all objects, especially the Emerald ground, have physical depth 
 * when being added to the static collision grid.
 * 
 * We reintroduce the ancient pathways (fromGraphNode & removeMesh) so 
 * high-level architecture modules do not cast TypeErrors into the abyss.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "./AwtsmoosOctree/index.js?v=purged2";
import { NODE_STATE, CONFIG } from './OctreeWorld/constants.js?v=purged2';
import LODNode from './OctreeWorld/LODNode.js?v=purged2';
import JobProcessor from './OctreeWorld/JobProcessor.js?v=purged2';

export class OctreeWorld {
    constructor() {
        // B"H: Establish a massive initial boundary for the earth
        this.root = new LODNode(new THREE.Box3(
            new THREE.Vector3(-2500, -500, -2500),
            new THREE.Vector3(2500, 2500, 2500)
        ));

        this._intakeQueue = [];
        this._buildQueue = new Set();
        this._subdivisionQueue = new Set();
        this._mergeQueue = new Set();
        this._pendingOctrees = []; 
        this._lastUpdateCenter = new THREE.Vector3(0, 0, 0);
        this.jobProcessor = new JobProcessor(this);
        
        // Ensure sacred preservation of binding
        this.rayIntersect = this.rayIntersect.bind(this);
        this.capsuleIntersect = this.capsuleIntersect.bind(this);
        this.addObject = this.addObject.bind(this);
        this.removeMesh = this.removeMesh.bind(this);
        this.fromGraphNode = this.fromGraphNode.bind(this);

        // B"H: OctreeWorld initialized
    }

    rayIntersect(ray) {
        if (!this.root) return null;
        
        // B"H: FORCE CRYSTALLIZATION — ensure any recently added terrain/objects 
        // are physically real before we try to bounce light (rays) off them.
        this._processQueues(true); 

        // B"H: THE SHIELD OF THE DATA — safety against invalid ray objects
        if (!ray || typeof ray.intersectsBox !== 'function') {
            return null;
        }

        let best = null;
        const scan = (node) => {
            if (!ray.intersectsBox(node.box)) return;
            if (node.type === 'LEAF') {
                if (node.physics && typeof node.physics.rayIntersect === 'function') {
                    const hit = node.physics.rayIntersect(ray);
                    if (hit && (!best || hit.distance < best.distance)) best = hit;
                }
            } else if (node.children) {
                node.children.forEach(scan);
            }
        };
        scan(this.root);
        return best;
    }

    capsuleIntersect(capsule) {
        if (!this.root) return false;
        let hit = false;
        const test = capsule.clone();
        const scan = (node) => {
            const b = new THREE.Box3().setFromPoints([test.start, test.end]).expandByScalar(test.radius);
            if (!node.box.intersectsBox(b)) return;
            if (node.type === 'LEAF' && node.physics && typeof node.physics.capsuleIntersect === 'function') {
                const res = node.physics.capsuleIntersect(test);
                if (res) { test.translate(res.normal.multiplyScalar(res.depth)); hit = true; }
            } else if (node.children) {
                node.children.forEach(scan);
            }
        };
        scan(this.root);
        if (hit) {
            const v = test.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            const depth = v.length(); // B"H: MUST capture length BEFORE normalize (normalize sets length to 1!)
            if (depth > 1e-6) return { normal: v.normalize(), depth: depth };
        }
        return false;
    }

    /**
     * @method addObject
     * @description Solidifies a mesh into the physics world.
     */
    addObject(mesh) {
        if (!mesh || !mesh.geometry) return false;
        
        // B"H: THE EYE OF FOUNDATION — Logging exactly what is being anchored.
        const meshName = mesh.name || "Unnamed Vessel";
        const meshType = mesh.geometry?.type || "Unknown Geometry";
        // B"H: silent


        mesh.updateMatrixWorld(true);
        
        // Ensure terrain visibility
        if (mesh.userData?.isTerrain || mesh.name?.includes("Ground")) {
            mesh.frustumCulled = false;
        }

        // B"H: THE SEPARATION OF LEVELS (Exclusion Logic)
        if (
            mesh.userData?.isLiving || 
            mesh.userData?.isPlayer || 
            mesh.userData?.isNpc ||
            mesh.userData?.isSphere ||
            mesh.userData?.isDynamic || // B"H: Reject all dynamic objects as requested
            mesh.name?.toLowerCase().includes("chossid") ||
            mesh.name?.toLowerCase().includes("player")
        ) {
            // B"H: silent

            return false;
        }

        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        // B"H: ABSOLUTE THICKNESS GUARANTEE
        // If a plane is added, expand the physics boundary so it's not a zero-width gap.
        const size = new THREE.Vector3();
        worldBox.getSize(size);
        if (size.y < 0.1) {
            worldBox.min.y -= 1.0;
            worldBox.max.y += 1.0;
        }

        if (this.root) this.root.box.union(worldBox);

        const result = this._insertMeshOnly(this.root, mesh, worldBox);
        if (result) {
            // B"H: silent

        }
        return result;
    }

    removeMesh(mesh) {
        if (!this.root || !mesh) return;
        const meshId = mesh.uuid;
        const scan = (node) => {
            if (node.type === 'LEAF') {
                if (node.physicsMeshGroup) {
                    const proxy = node.physicsMeshGroup.children.find(c => c.userData._physicsSourceId === meshId);
                    if (proxy) {
                        node.physicsMeshGroup.remove(proxy);
                        node.state = NODE_STATE.PENDING_BUILD; // Mark for rebuild
                        this._buildQueue.add(node);
                    }
                }
            } else if (node.children) {
                node.children.forEach(scan);
            }
        };
        scan(this.root);
    }

    fromGraphNode(group) {
        if (!group) return;
        group.traverse(child => {
            if (child.isMesh && !child.userData?.notSolid) {
                this.addObject(child);
            }
        });
    }

    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;
        if (node.type === 'LEAF') {
            // B"H: THE REPARENTING TIKKUN
            // Three.js Group.add() removes the mesh from its current parent!
            // If we add the actual scene mesh to physicsMeshGroup, it vanishes from the scene.
            // SOLUTION: Create a physics proxy with the same geometry but a dummy material.
            // Only the proxy enters the physics group. The original stays in the scene.
            const alreadyInserted = node.physicsMeshGroup.children.some(
                c => c.userData._physicsSourceId === mesh.uuid
            );
            if (alreadyInserted) return true;

            const physicsProxy = new THREE.Mesh(
                mesh.geometry, 
                new THREE.MeshBasicMaterial({ visible: false })
            );
            physicsProxy.matrixAutoUpdate = false;
            mesh.updateMatrixWorld(true);
            physicsProxy.matrix.copy(mesh.matrixWorld);
            physicsProxy.matrixWorld.copy(mesh.matrixWorld);
            physicsProxy.userData._physicsSourceId = mesh.uuid;
            physicsProxy.name = mesh.name + '_physicsProxy';
            node.physicsMeshGroup.add(physicsProxy);
            node.state = NODE_STATE.PENDING_BUILD;
            this._buildQueue.add(node);
            return true;
        }
        
        let placed = false;
        if (node.children) {
            node.children.forEach(child => {
                if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
            });
        }
        return placed;
    }

    _buildNodePhysics(node) {
        if (!node || !node.physicsMeshGroup || node.physicsMeshGroup.children.length === 0) return;
        // B"H: Pass the same safe config (MAX_DEPTH: 5, MAX_TRIANGLES_PER_NODE: 32)
        // to ALL sub-octrees built by OctreeWorld, not just the root.
        // Previously, CONFIG from constants.js may have had different (dangerous) values.
        const newPhysics = new AwtsmoosOctree(node.box.clone(), CONFIG);
        newPhysics._isManaged = true;
        // B"H: silent

        newPhysics.fromGraphNode(node.physicsMeshGroup);
        newPhysics.build();
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
        // B"H: silent

    }

    // B"H: Reuse a single Vector3 for assessAndQueueWork center calculations
    // to avoid allocating a new Vector3 every time the player moves 20 units.
    _centerScratch = new THREE.Vector3();

    update(focus, velocity) {
        if (!this.root) return;
        this._processQueues();
        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0 || !foci[0].position) return;
        
        if (foci[0].position.distanceToSquared(this._lastUpdateCenter) > 400) {
            this._lastUpdateCenter.copy(foci[0].position);
            this._assessAndQueueWork(this.root, foci);
        }
    }

    _processQueues(forceAll = false) {
        // B"H: 2ms budget per frame — down from 4ms.
        // The Octree build is synchronous and WILL block the Worker thread.
        // We bypass this budget if forceAll is true (e.g. during world load).
        const startTime = performance.now();
        const it = this._buildQueue.values();
        for (let node of it) {
            if (!forceAll && performance.now() - startTime > 2.0) return; 
            this._buildQueue.delete(node);
            try {
                this._buildNodePhysics(node);
            } catch(e) {
                console.error("B\"H - 🚨 OctreeWorld: Crystallization Shattered!", e);
            }
        }
    }

    _assessAndQueueWork(node, foci) {
        // B"H: Reuse _centerScratch instead of `new THREE.Vector3()` per call
        const center = node.box.getCenter(this._centerScratch);
        let inRange = false;
        for (const focus of foci) {
            if (center.distanceToSquared(focus.position) < 4000000) { inRange = true; break; }
        }
        if (inRange) {
            if (node.type === 'BRANCH' && node.children) {
                node.children.forEach(c => this._assessAndQueueWork(c, foci));
            } else if (node.state === NODE_STATE.PENDING_BUILD) {
                this._buildQueue.add(node);
            }
        }
    }
}
