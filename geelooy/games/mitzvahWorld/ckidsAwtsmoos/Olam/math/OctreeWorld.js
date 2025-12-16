
// B"H
// In file: /Olam/math/OctreeWorld.js

import * as THREE  from '/games/scripts/build/three.module.js';
import { Capsule } from './Capsule.js'
import { Octree as AwtsmoosOctree } from "./AwtsmoosOctree/index.js";
//'./AwtsmoosOctree.js';
import OctreeMath from './OctreeMath.js'; // B"H New Import

var { Box3, Vector3, Group, Mesh, Sphere, Triangle, Matrix4} = THREE;
// --- Helper Cache ---
const _v1 = new Vector3();
const _v2 = new Vector3();
const _v3 = new Vector3();
const _tempBox = new Box3();
const _tempTri = new Triangle();

const JOB_STEP = {
    CLONE: 0,
    BOUNDS: 1,
    SETUP_ITER: 2,
    PROCESS_TRIS: 3,
    FINALIZE: 4
};

const MAX_DEPTH = 12;
const NODE_STATE = {
    EMPTY: 'EMPTY',             
    PENDING_BUILD: 'PENDING_BUILD', 
    READY: 'READY'              
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
    #pendingOctrees = []; 

    #safeRadiusSq = 400; 
    #baseBuildRadius = 60;
    #mergeRadius = 120;
    #velocityLookaheadFactor = 2.0;
    
    #lastUpdateCenter = new Vector3(Infinity, Infinity, Infinity);
	#activeJob = null; 
    #conversionQueue = []; 

    constructor() {}

    #buildNodePhysics(node) {
        // Lag Prevention Valve.
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        if (totalTriangles > 15000) return; 

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
    
    #synchronouslyRebuildNode(node, newMesh) {
        const geometry = (newMesh.geometry.index) ? newMesh.geometry.toNonIndexed() : newMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const v1 = new Vector3();
        const v2 = new Vector3();
        const v3 = new Vector3();

        if (positionAttribute) {
            for (let i = 0; i < positionAttribute.count; i += 3) {
                v1.fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
                v2.fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
                v3.fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
                
                const newTriangle = new Triangle(v1.clone(), v2.clone(), v3.clone());
                
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

        if (this.#root) {
            const candidates = this.#findLeafNodesInBox(this.#root, this.#root.box);
            for (const node of candidates) {
                if (node.physics) check(node.physics);
            }
        }

        for (const sat of this.#pendingOctrees) {
            if (ray.intersectsBox(sat.box)) {
                check(sat);
            }
        }

        return closestResult;
    }

    update(focus, velocity) {
        if (!this.#root) return;
        this.#processIntakeQueue();

        const foci = Array.isArray(focus) ? focus : [{ position: focus, velocity }];
        if (foci.length === 0) return;

        const needsUpdate = foci.some(f => f.position.distanceToSquared(this.#lastUpdateCenter) > this.#safeRadiusSq);
        
        if (!needsUpdate) {
            this.#processQueues(); 
            return;
        }

        this.#lastUpdateCenter.set(0, 0, 0);
        foci.forEach(f => this.#lastUpdateCenter.add(f.position));
        this.#lastUpdateCenter.divideScalar(foci.length);

        this.#enforceCriticalPath(foci);
        this.#assessAndQueueWork(this.#root, foci);
        this.#processQueues();
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

        if (this.#root) {
            const candidates = this.#findLeafNodesInBox(this.#root, capsuleBox);
            for (const node of candidates) {
                if (node.physics) checkOctree(node.physics);
            }
        }

        for (const sat of this.#pendingOctrees) {
            if (sat.box.intersectsBox(capsuleBox)) {
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

    // --- PRIVATE METHODS ---

    #processIntakeQueue() {
        const deadline = performance.now() + 4; 

        while (this.#intakeQueue.length > 0) {
            if (performance.now() > deadline) return;

            const job = this.#intakeQueue[0];
            
            if (job.group) {
                const meshes = [];
                job.group.traverse(obj => {
                    if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                        meshes.push(obj);
                    }
                });
                this.#intakeQueue.shift();
                for(const m of meshes) this.#intakeQueue.unshift({ mesh: m });
                continue;
            }

            const { mesh } = this.#intakeQueue.shift();
            
            const clone = new Mesh(mesh.geometry.clone()); 
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            
            clone.userData = { ...mesh.userData, visualReference: mesh };

            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);

            this.#insertMeshOnly(this.#root, clone, worldBox);
        }
    }
    
    #insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;

        if (node.type === 'LEAF') {
            const meshToAdd = mesh.parent ? mesh.clone() : mesh;
            if (mesh.parent) meshToAdd.userData = Object.assign({}, mesh.userData);

            node.physicsMeshGroup.add(meshToAdd);
            node.state = NODE_STATE.PENDING_BUILD;

            if(mesh.userData) mesh.userData.inMainWorld = true;

            if (node.physics) {
                this.#synchronouslyRebuildNode(node, meshToAdd);
            } else {
                this.#buildNodePhysics(node);
            }
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this.#insertMeshOnly(child, mesh, meshBox)) {
                    placed = true;
                }
            }
            return placed;
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
            const criticalPoint = focus.position.clone().addScaledVector(focus.velocity, 0.25);
            let currentNode = this.#findLeafNodeAtPoint(this.#root, criticalPoint);

            if (currentNode && currentNode.state !== NODE_STATE.READY) {
                this.#buildNodePhysics(currentNode);
            }
        }
    }
    
    #assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new Vector3());
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        for (const focus of foci) {
            const dynamicBuildRadius = this.#baseBuildRadius + (focus.velocity.length() * this.#velocityLookaheadFactor);
            const distSq = center.distanceToSquared(focus.position);

            if (distSq < dynamicBuildRadius * dynamicBuildRadius) {
                highestPriority = 'BUILD';
                detailLevel = Math.min(detailLevel, distSq); 
                break;
            }
        }

        if (highestPriority === 'BUILD') {
            if (node.type === 'BRANCH') { 
                node.children.forEach(child => this.#assessAndQueueWork(child, foci));
            } else { 
                const nodeSizeSq = node.box.getSize(new Vector3()).lengthSq();
                if (detailLevel < nodeSizeSq * 4 && this.#getNodeDepth(node) < MAX_DEPTH) {
                    this.#subdivisionQueue.add(node);
                }
                else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this.#buildQueue.add(node);
                }
            }
        } else { 
            if (node.type === 'BRANCH' && center.distanceToSquared(this.#lastUpdateCenter) > this.#mergeRadius * this.#mergeRadius) {
                this.#mergeQueue.add(node);
            }
        }
    }

    #processQueues() {
        const frameBudget = 5; 
        const startTime = performance.now();

        while (this.#intakeQueue.length > 0) {
            if (performance.now() - startTime > frameBudget) return;
            this.#processIntakeQueue();
        }

        if (this.#buildQueue.size > 0) {
            const iterator = this.#buildQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this.#buildQueue.delete(node);
                this.#buildNodePhysics(node);
                result = iterator.next();
            }
        }

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
        
        if (this.#activeJob || this.#conversionQueue.length > 0) {
             const remainingTime = frameBudget - (performance.now() - startTime);
             if (remainingTime > 0) {
                 this.#processActiveJob(remainingTime);
             }
        }
        
        if (this.#pendingOctrees.length > 0) {
            const now = performance.now();
            this.#pendingOctrees = this.#pendingOctrees.filter(sat => {
                if (now - sat.creationTime < 3000) return true;
                const center = sat.box.getCenter(_v1);
                const mainNode = this.#findLeafNodeAtPoint(this.#root, center);
                if (mainNode && mainNode.state === NODE_STATE.READY) {
                    return false; 
                }
                return true; 
            });
        }
    }

    #processActiveJob(timeLimit) {
        const deadline = performance.now() + timeLimit;
        
        if (!this.#activeJob && this.#conversionQueue.length > 0) {
            const proxy = this.#conversionQueue.shift();
            this.#activeJob = {
                proxy: proxy, step: JOB_STEP.CLONE, clone: null,
                iter: { idx: 0, count: 0 }, attr: null, index: null, mw: null, affected: new Set()
            };
        }

        const job = this.#activeJob;
        if (!job) return;

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

        const foci = [{ position: this.#lastUpdateCenter, velocity: new Vector3() }];
        node.children.forEach(child => this.#assessAndQueueWork(child, foci));
    }

    #merge(node) {
        const meshesToCollect = [];

        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') {
                currentNode.children.forEach(gather);
            }
            meshesToCollect.push(...currentNode.physicsMeshGroup.children);
            if (currentNode.physics) currentNode.physics.clear();
            
            this.#buildQueue.delete(currentNode);
            this.#subdivisionQueue.delete(currentNode);
            this.#mergeQueue.delete(currentNode);
        };
        
        node.children.forEach(gather);
        node.children.length = 0; 
        node.type = 'LEAF';

        meshesToCollect.forEach(mesh => node.physicsMeshGroup.add(mesh));
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.state = NODE_STATE.PENDING_BUILD;
        } else {
            node.state = NODE_STATE.EMPTY;
        }
    }

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

        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        if (!this.#root) {
            this.#root = new LODNode(worldBox.clone());
        } else {
            this.#root.box.union(worldBox);
        }

        const physicsClone = new Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        
        physicsClone.userData = { ...mesh.userData, visualReference: mesh };

        const satGeo = mesh.geometry.clone();
        const satClone = new Mesh(satGeo);
        satClone.copy(physicsClone); 
        satClone.updateMatrix();
        satClone.updateMatrixWorld(true);
        
        satClone.userData = { ...mesh.userData, visualReference: mesh };

        const tempGroup = new Group();
        tempGroup.add(satClone);

        const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.05));
        satelliteOctree._isManaged = true; 
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); 
        
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh;

        this.#pendingOctrees.push(satelliteOctree);

        physicsClone.userData.inMainWorld = true; 
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

        const meshes = [];
        group.traverse(obj => {
            if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                meshes.push(obj);
            }
        });

        for (const mesh of meshes) {
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

            const clone = new Mesh(mesh.geometry.clone());
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);

            clone.userData = { ...mesh.userData, visualReference: mesh };

            const tempGroup = new Group();
            tempGroup.add(clone);

            const sat = new AwtsmoosOctree(worldBox);
            sat.fromGraphNode(tempGroup);
            sat.build();
            
            sat.creationTime = performance.now();
            sat.sourceMesh = mesh;
            
            this.#pendingOctrees.push(sat);
        }

        this.#intakeQueue.push({ 
            group: group, 
            isStaticWorld: true 
        });
    }

    removeMesh(mesh) {
        if (!this.#root || !mesh) return;

        const visualRef = mesh.userData?.visualReference || mesh;

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

        this.#pendingOctrees = this.#pendingOctrees.filter(sat => {
            if (sat.sourceMesh === visualRef) {
                return false; 
            }
            return true; 
        });
    }
}
