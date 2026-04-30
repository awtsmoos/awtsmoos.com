
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
import { Octree as AwtsmoosOctree } from "./AwtsmoosOctree/index.js";
import { NODE_STATE, CONFIG } from './OctreeWorld/constants.js';
import LODNode from './OctreeWorld/LODNode.js';
import JobProcessor from './OctreeWorld/JobProcessor.js';

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

        console.log("B\"H - ⚓ OctreeWorld: Foundations fortified for flat planes.");
    }

    rayIntersect(ray) {
        if (!this.root) return null;
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
            if (v.lengthSq() > 1e-12) return { normal: v.normalize(), depth: v.length() };
        }
        return false;
    }

    /**
     * @method addObject
     * @description Solidifies a mesh into the physics world.
     */
    addObject(mesh) {
        if (!mesh || !mesh.geometry) return false;
        mesh.updateMatrixWorld(true);
        
        // Ensure terrain visibility
        if (mesh.userData?.isTerrain || mesh.name?.includes("Ground")) {
            mesh.frustumCulled = false;
        }

        if (mesh.userData?.isLiving) return false;

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

        return this._insertMeshOnly(this.root, mesh, worldBox);
    }

    removeMesh(mesh) {
        if (!this.root || !mesh) return;
        const scan = (node) => {
            if (node.type === 'LEAF') {
                if (node.physicsMeshGroup && node.physicsMeshGroup.children.includes(mesh)) {
                    node.physicsMeshGroup.remove(mesh);
                    if (node.physics && typeof node.physics.removeMesh === 'function') {
                        node.physics.removeMesh(mesh); 
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
            if (node.physicsMeshGroup.children.includes(mesh)) return true;
            node.physicsMeshGroup.add(mesh);
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
        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;
        newPhysics.fromGraphNode(node.physicsMeshGroup);
        newPhysics.build();
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }

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

    _processQueues() {
        const startTime = performance.now();
        const it = this._buildQueue.values();
        for (let node of it) {
            if (performance.now() - startTime > 4.0) return; 
            this._buildQueue.delete(node);
            this._buildNodePhysics(node);
        }
    }

    _assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new THREE.Vector3());
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
