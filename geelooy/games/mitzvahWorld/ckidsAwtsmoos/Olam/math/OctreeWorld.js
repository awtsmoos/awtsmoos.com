
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { Octree as AwtsmoosOctree } from "./AwtsmoosOctree/index.js";
import { JOB_STEP, NODE_STATE, CONFIG } from './OctreeWorld/constants.js';
import LODNode from './OctreeWorld/LODNode.js';
import JobProcessor from './OctreeWorld/JobProcessor.js';

const _v1 = new THREE.Vector3();
const _tempBox = new THREE.Box3();
const _tempTri = new THREE.Triangle();

function triangleCountOf(geometry) {
    if (!geometry?.attributes?.position) return 0;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    return Math.ceil(count / 3);
}

function isFiniteBox(box) {
    return box &&
        Number.isFinite(box.min.x) && Number.isFinite(box.min.y) && Number.isFinite(box.min.z) &&
        Number.isFinite(box.max.x) && Number.isFinite(box.max.y) && Number.isFinite(box.max.z);
}

function hasLivingAncestor(object) {
    let current = object;
    while (current) {
        if (
            current.userData?.isLiving ||
            current.userData?.isPlayer ||
            current.userData?.isNpc ||
            current.userData?.skipOctree ||
            current.userData?.noOctree
        ) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

function shouldBakeMesh(mesh, worldBox = null) {
    if (!mesh?.isMesh || !mesh.geometry) return false;
    if (hasLivingAncestor(mesh)) return false;
    if (mesh.userData?.notSolid || mesh.userData?.isDynamic) return false;
    if (mesh.isSkinnedMesh || mesh.isInstancedMesh) return false;
    if (mesh.type === 'SkinnedMesh' || mesh.type === 'InstancedMesh') return false;

    const triCount = triangleCountOf(mesh.geometry);
    if (triCount <= 0 || triCount > CONFIG.MAX_TRIANGLES_PER_MESH) return false;

    const box = worldBox || new THREE.Box3().setFromObject(mesh);
    if (!isFiniteBox(box) || box.isEmpty()) return false;

    const size = box.getSize(new THREE.Vector3());
    return size.x <= CONFIG.MAX_WORLD_BOX_SIZE &&
        size.y <= CONFIG.MAX_WORLD_BOX_SIZE &&
        size.z <= CONFIG.MAX_WORLD_BOX_SIZE;
}

function collectBakeMeshes(root) {
    const meshes = [];
    if (!root || hasLivingAncestor(root)) return meshes;
    root.updateMatrixWorld?.(true);
    root.traverse?.(obj => {
        if (meshes.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) return;
        if (obj.isMesh && obj.geometry && shouldBakeMesh(obj)) meshes.push(obj);
    });
    return meshes;
}

function makePhysicsClone(mesh) {
    const clone = new THREE.Mesh(mesh.geometry.clone());
    mesh.getWorldPosition(clone.position);
    mesh.getWorldQuaternion(clone.quaternion);
    mesh.getWorldScale(clone.scale);
    clone.updateMatrix();
    clone.updateMatrixWorld(true);
    clone.userData = { ...mesh.userData, visualReference: mesh, inMainWorld: true };
    return clone;
}

export class OctreeWorld {
    constructor() {
        this.root = null;
        this._intakeQueue = [];
        this._buildQueue = new Set();
        this._subdivisionQueue = new Set();
        this._mergeQueue = new Set();
        this._pendingOctrees = []; 
        this._lastUpdateCenter = new THREE.Vector3(Infinity, Infinity, Infinity);
        
        this.jobProcessor = new JobProcessor(this);
    }

    _buildNodePhysics(node) {
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        if (totalTriangles > CONFIG.MAX_TRIANGLES_PER_NODE) return; 

        const newPhysics = new AwtsmoosOctree(node.box.clone());
        newPhysics._isManaged = true;
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.physicsMeshGroup.userData.isPreTransformed = true;
            newPhysics.fromGraphNode(node.physicsMeshGroup);
            newPhysics.build();
        }
        
        if (node.physics && node.physics.dynamicTriangles.length > 0) {
            for(const tri of node.physics.dynamicTriangles) {
                if(tri.sourceMesh) newPhysics.addDynamicTriangle(tri);
            }
        }
        
        node.physics = newPhysics;
        node.state = NODE_STATE.READY;
    }
    
    _synchronouslyRebuildNode(node, newMesh) {
        const geometry = (newMesh.geometry.index) ? newMesh.geometry.toNonIndexed() : newMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

        if (positionAttribute) {
            for (let i = 0; i < positionAttribute.count; i += 3) {
                v1.fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
                v2.fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
                v3.fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
                
                const newTriangle = new THREE.Triangle(v1.clone(), v2.clone(), v3.clone());
                if(!node.box.intersectsTriangle(newTriangle)) continue;

                newTriangle.sourceMesh = newMesh; 
                node.physics.addDynamicTriangle(newTriangle);
            }
        }
        if(newMesh.geometry.index) geometry.dispose();
    }
    
    rayIntersect(ray) {
        let closestResult = false;
        const check = (octree) => {
            const res = octree.rayIntersect(ray);
            if (res && (!closestResult || res.distance < closestResult.distance)) {
                closestResult = res;
            }
        };

        if (this.root) {
            const candidates = this._findLeafNodesInBox(this.root, this.root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }
        for (const sat of this._pendingOctrees) {
            if (ray.intersectsBox(sat.box)) check(sat);
        }
        return closestResult;
    }

    update(focus, velocity) {
        if (!this.root) return;
        this._processIntakeQueue();

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;

        const needsUpdate = foci.some(f => f.position.distanceToSquared(this._lastUpdateCenter) > CONFIG.SAFE_RADIUS_SQ);
        
        if (!needsUpdate) {
            this._processQueues(); 
            return;
        }

        this._lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this._lastUpdateCenter.add(f.position));
        this._lastUpdateCenter.divideScalar(foci.length);

        this._enforceCriticalPath(foci);
        this._assessAndQueueWork(this.root, foci);
        this._processQueues();
    }
    
    capsuleIntersect(capsule) {
        let hit = false;
        const testCapsule = capsule.clone();
        
        const checkOctree = (octree) => {
             const result = octree.capsuleIntersect(testCapsule);
             if (result) {
                 testCapsule.translate(result.normal.multiplyScalar(result.depth));
                 hit = true;
             }
        };

        const capsuleBox = _tempBox;
        capsuleBox.min.copy(testCapsule.start).min(testCapsule.end).subScalar(testCapsule.radius);
        capsuleBox.max.copy(testCapsule.start).max(testCapsule.end).addScalar(testCapsule.radius);

        if (this.root) {
            const candidates = this._findLeafNodesInBox(this.root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        for (const sat of this._pendingOctrees) {
            if (sat.box.intersectsBox(capsuleBox)) checkOctree(sat);
        }
        
        if (hit) {
            const correction = testCapsule.getCenter(new THREE.Vector3()).sub(capsule.getCenter(new THREE.Vector3()));
            const depth = correction.length();
            if (depth > 1e-9) return { normal: correction.normalize(), depth };
        }
        return false;
    }

    _processIntakeQueue() {
        const deadline = performance.now() + 4; 
        while (this._intakeQueue.length > 0) {
            if (performance.now() > deadline) return;
            const job = this._intakeQueue[0];
            if (job.group) {
                const meshes = collectBakeMeshes(job.group);
                this._intakeQueue.shift();
                for (const m of meshes) {
                    if (this._intakeQueue.length >= CONFIG.MAX_TOTAL_INTAKE_QUEUE) break;
                    this._intakeQueue.unshift({ mesh: m });
                }
                continue;
            }
            const { mesh } = this._intakeQueue.shift();
            if (!shouldBakeMesh(mesh)) continue;
            const clone = makePhysicsClone(mesh);
            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);
            if (!shouldBakeMesh(clone, worldBox)) continue;
            this._insertMeshOnly(this.root, clone, worldBox);
        }
    }
    
    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;
        if (node.type === 'LEAF') {
            const meshToAdd = mesh.parent ? mesh.clone() : mesh;
            if (mesh.parent) meshToAdd.userData = Object.assign({}, mesh.userData);
            node.physicsMeshGroup.add(meshToAdd);
            node.state = NODE_STATE.PENDING_BUILD;
            if(mesh.userData) mesh.userData.inMainWorld = true;
            if (node.physics) this._synchronouslyRebuildNode(node, meshToAdd);
            else this._buildNodePhysics(node);
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this._insertMeshOnly(child, mesh, meshBox)) placed = true;
            }
            return placed;
        }
    }

    _distributeMeshes(node, mesh) {
        const meshWorldBox = new THREE.Box3().setFromObject(mesh);
        if (!node.box.intersectsBox(meshWorldBox)) return;
        if (node.type === 'LEAF') {
            node.physicsMeshGroup.add(mesh);
            node.state = NODE_STATE.PENDING_BUILD;
            return;
        }
        if (node.type === 'BRANCH') {
            const intersectingChildren = node.children.filter(child => child.box.intersectsBox(meshWorldBox));
            if (intersectingChildren.length === 1) this._distributeMeshes(intersectingChildren[0], mesh);
            else if (intersectingChildren.length > 1) intersectingChildren.forEach(child => this._distributeMeshes(child, mesh.clone()));
        }
    }

    _enforceCriticalPath(foci) {
        for (const focus of foci) {
            const criticalPoint = focus.position.clone().addScaledVector(focus.velocity, 0.25);
            let currentNode = this._findLeafNodeAtPoint(this.root, criticalPoint);
            if (currentNode && currentNode.state !== NODE_STATE.READY) this._buildNodePhysics(currentNode);
        }
    }
    
    _assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new THREE.Vector3());
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        for (const focus of foci) {
            const dynamicBuildRadius = CONFIG.BASE_BUILD_RADIUS + (focus.velocity.length() * CONFIG.VELOCITY_LOOKAHEAD);
            const distSq = center.distanceToSquared(focus.position);
            if (distSq < dynamicBuildRadius * dynamicBuildRadius) {
                highestPriority = 'BUILD';
                detailLevel = Math.min(detailLevel, distSq); 
                break;
            }
        }

        if (highestPriority === 'BUILD') {
            if (node.type === 'BRANCH') { 
                node.children.forEach(child => this._assessAndQueueWork(child, foci));
            } else { 
                const nodeSizeSq = node.box.getSize(new THREE.Vector3()).lengthSq();
                if (detailLevel < nodeSizeSq * 4 && this._getNodeDepth(node) < CONFIG.MAX_DEPTH) {
                    this._subdivisionQueue.add(node);
                } else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this._buildQueue.add(node);
                }
            }
        } else { 
            if (node.type === 'BRANCH' && center.distanceToSquared(this._lastUpdateCenter) > CONFIG.MERGE_RADIUS * CONFIG.MERGE_RADIUS) {
                this._mergeQueue.add(node);
            }
        }
    }

    _processQueues() {
        const startTime = performance.now();
        while (this._intakeQueue.length > 0) {
            if (performance.now() - startTime > CONFIG.FRAME_BUDGET) return;
            this._processIntakeQueue();
        }
        this._processSet(this._buildQueue, n => this._buildNodePhysics(n), startTime);
        this._processSet(this._subdivisionQueue, n => this._subdivide(n), startTime);
        this._processSet(this._mergeQueue, n => this._merge(n), startTime);

        if (this.jobProcessor.hasWork()) {
             const remainingTime = CONFIG.FRAME_BUDGET - (performance.now() - startTime);
             if (remainingTime > 0) this.jobProcessor.process(remainingTime);
        }
        
        if (this._pendingOctrees.length > 0) {
            const now = performance.now();
            this._pendingOctrees = this._pendingOctrees.filter(sat => {
                if (now - sat.creationTime < 3000) return true;
                const center = sat.box.getCenter(_v1);
                const mainNode = this._findLeafNodeAtPoint(this.root, center);
                return !(mainNode && mainNode.state === NODE_STATE.READY);
            });
        }
    }

    _processSet(set, action, startTime) {
        if (set.size > 0) {
            const iterator = set.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > CONFIG.FRAME_BUDGET) return;
                const node = result.value;
                set.delete(node);
                action(node);
                result = iterator.next();
            }
        }
    }

    _subdivide(node) {
        if (node.type === 'BRANCH') return;
        node.type = 'BRANCH';
        if (node.physics) node.physics.clear();
        node.physics = null;
        node.state = NODE_STATE.EMPTY;

        const halfSize = node.box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        for (let i = 0; i < 8; i++) {
            const min = new THREE.Vector3(
                node.box.min.x + (i & 1 ? halfSize.x : 0),
                node.box.min.y + (i & 2 ? halfSize.y : 0),
                node.box.min.z + (i & 4 ? halfSize.z : 0)
            );
            node.children.push(new LODNode(new THREE.Box3(min, min.clone().add(halfSize))));
        }
        const meshesToMove = [...node.physicsMeshGroup.children];
        node.physicsMeshGroup.clear();
        for(const meshToMove of meshesToMove) this._distributeMeshes(node, meshToMove);
        const foci = [{ position: this._lastUpdateCenter, velocity: new THREE.Vector3() }];
        node.children.forEach(child => this._assessAndQueueWork(child, foci));
    }

    _merge(node) {
        const meshesToCollect = [];
        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') currentNode.children.forEach(gather);
            meshesToCollect.push(...currentNode.physicsMeshGroup.children);
            if (currentNode.physics) currentNode.physics.clear();
            this._buildQueue.delete(currentNode);
            this._subdivisionQueue.delete(currentNode);
            this._mergeQueue.delete(currentNode);
        };
        node.children.forEach(gather);
        node.children.length = 0; 
        node.type = 'LEAF';
        meshesToCollect.forEach(mesh => node.physicsMeshGroup.add(mesh));
        node.state = node.physicsMeshGroup.children.length > 0 ? NODE_STATE.PENDING_BUILD : NODE_STATE.EMPTY;
    }

    _findLeafNodesInBox(startNode, box, result = []) {
        if (!startNode.box.intersectsBox(box)) return result;
        if (startNode.type === 'LEAF') result.push(startNode);
        else if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) this._findLeafNodesInBox(child, box, result);
        }
        return result;
    }
    
    _findLeafNodeAtPoint(startNode, point) {
        if (!startNode.box.containsPoint(point)) return null;
        if (startNode.type === 'LEAF') return startNode;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                const result = this._findLeafNodeAtPoint(child, point);
                if (result) return result;
            }
        }
        return null;
    }
    
    _distributeTriangleToNodes(node, triangle, affectedNodes) {
        if (!node.box.intersectsTriangle(triangle)) return;
        if (node.type === 'LEAF') {
            if (!node.physics) {
                node.physics = new AwtsmoosOctree(node.box.clone());
                node.physics._isManaged = true;
            }
            _tempBox.setFromPoints([triangle.a, triangle.b, triangle.c]);
            node.box.union(_tempBox);
            node.physics.box.copy(node.box); 
            node.state = NODE_STATE.READY;
            const tClone = triangle.clone();
            tClone.sourceMesh = triangle.sourceMesh;
            node.physics.addDynamicTriangle(tClone);
            if (affectedNodes) affectedNodes.add(node);
        } else {
            const len = node.children.length;
            for (let i = 0; i < len; i++) this._distributeTriangleToNodes(node.children[i], triangle, affectedNodes);
        }
    }

    _getNodeDepth(nodeToFind, startNode = this.root, depth = 0) {
        if (nodeToFind === startNode) return depth;
        if (startNode.type === 'BRANCH') {
            for (const child of startNode.children) {
                if (child.box.containsBox(nodeToFind.box) || child.box.intersectsBox(nodeToFind.box)) {
                    const foundDepth = this._getNodeDepth(nodeToFind, child, depth + 1);
                    if (foundDepth !== -1) return foundDepth;
                }
            }
        }
        return -1;
    }
    
    addObject(mesh) {
        if (!mesh) return false;
        if (!mesh.isMesh || !mesh.geometry) {
            const meshes = collectBakeMeshes(mesh);
            let addedAny = false;
            for (const childMesh of meshes) {
                if (this.addObject(childMesh)) addedAny = true;
            }
            return addedAny;
        }

        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
        if (!shouldBakeMesh(mesh, worldBox)) return false;

        if (!this.root) this.root = new LODNode(worldBox.clone());
        else this.root.box.union(worldBox);

        const physicsClone = makePhysicsClone(mesh);

        const satGeo = mesh.geometry.clone();
        const satClone = new THREE.Mesh(satGeo);
        satClone.copy(physicsClone); 
        satClone.updateMatrix();
        satClone.updateMatrixWorld(true);
        satClone.userData = { ...mesh.userData, visualReference: mesh };

        const tempGroup = new THREE.Group();
        tempGroup.add(satClone);

        const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.05));
        satelliteOctree._isManaged = true; 
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); 
        
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh;

        this._pendingOctrees.push(satelliteOctree);
        if (this._pendingOctrees.length > CONFIG.MAX_PENDING_OCTREES) {
            this._pendingOctrees.splice(0, this._pendingOctrees.length - CONFIG.MAX_PENDING_OCTREES);
        }
        physicsClone.userData.inMainWorld = true; 
        this._insertMeshOnly(this.root, physicsClone, worldBox);
        return true;
    }

    fromGraphNode(group) {
        if (!group || hasLivingAncestor(group)) return false;
        group.updateMatrixWorld(true);
        const groupBox = new THREE.Box3().setFromObject(group);
        if (!isFiniteBox(groupBox) || groupBox.isEmpty()) return false;

        const meshes = collectBakeMeshes(group);
        if (meshes.length === 0) return false;

        if (!this.root) this.root = new LODNode(groupBox.clone());
        else this.root.box.union(groupBox);

        for (const mesh of meshes) {
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            if (!shouldBakeMesh(mesh, worldBox)) continue;

            const clone = makePhysicsClone(mesh);

            const tempGroup = new THREE.Group();
            tempGroup.add(clone);

            const sat = new AwtsmoosOctree(worldBox);
            sat.fromGraphNode(tempGroup);
            sat.build();
            sat.creationTime = performance.now();
            sat.sourceMesh = mesh;
            this._pendingOctrees.push(sat);
        }
        if (this._pendingOctrees.length > CONFIG.MAX_PENDING_OCTREES) {
            this._pendingOctrees.splice(0, this._pendingOctrees.length - CONFIG.MAX_PENDING_OCTREES);
        }
        this._intakeQueue.push({ group: group, isStaticWorld: true });
        return true;
    }

    removeMesh(mesh) {
        if (!this.root || !mesh) return;
        const visualRef = mesh.userData?.visualReference || mesh;
        const meshBox = new THREE.Box3().setFromObject(mesh);
        const nodes = this._findLeafNodesInBox(this.root, meshBox);

        nodes.forEach(node => {
            if (!node.physicsMeshGroup) return;
            const toRemove = node.physicsMeshGroup.children.filter(child => {
                const childRef = child.userData?.visualReference || child;
                return child === mesh || child === visualRef || childRef === mesh || childRef === visualRef;
            });

            if (toRemove.length > 0) {
                toRemove.forEach(child => node.physicsMeshGroup.remove(child));
                if (node.physics?.clear) node.physics.clear();
                node.physics = null;
                node.state = node.physicsMeshGroup.children.length > 0 ? NODE_STATE.PENDING_BUILD : NODE_STATE.EMPTY;
                if (node.state === NODE_STATE.PENDING_BUILD) this._buildQueue.add(node);
            }
        });

        this._pendingOctrees = this._pendingOctrees.filter(sat => {
            return sat.sourceMesh !== mesh && sat.sourceMesh !== visualRef;
        });
    }
}
