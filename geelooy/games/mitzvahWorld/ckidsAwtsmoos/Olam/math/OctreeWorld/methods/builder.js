
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

const _tempBox = new THREE.Box3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _tempTri = new THREE.Triangle();

const NODE_STATE = { EMPTY: 'EMPTY', PENDING_BUILD: 'PENDING_BUILD', READY: 'READY' };
const MAX_DEPTH = 12;

const JOB_STEP = {
    CLONE: 0,
    MATRICES: 1,
    SETUP_ITER: 2,
    PROCESS_TRIS: 3,
    FINALIZE: 4
};

export default {
    processIntakeQueue() {
        const deadline = performance.now() + 4; 

        while (this._intakeQueue.length > 0) {
            if (performance.now() > deadline) return;

            const job = this._intakeQueue[0];
            
            if (job.group) {
                const meshes = [];
                job.group.traverse(obj => {
                    if (obj.isMesh && obj.geometry && !obj.userData.notSolid) {
                        meshes.push(obj);
                    }
                });
                this._intakeQueue.shift();
                for(const m of meshes) this._intakeQueue.unshift({ mesh: m });
                continue;
            }

            const { mesh } = this._intakeQueue.shift();
            
            const clone = new THREE.Mesh(mesh.geometry.clone()); 
            mesh.getWorldPosition(clone.position);
            mesh.getWorldQuaternion(clone.quaternion);
            mesh.getWorldScale(clone.scale);
            clone.updateMatrix();
            clone.updateMatrixWorld(true);
            
            clone.userData = { ...mesh.userData, visualReference: mesh };

            if (!clone.geometry.boundingBox) clone.geometry.computeBoundingBox();
            const worldBox = clone.geometry.boundingBox.clone().applyMatrix4(clone.matrixWorld);

            this._insertMeshOnly(this._root, clone, worldBox);
        }
    },
    
    _insertMeshOnly(node, mesh, meshBox) {
        if (!node.box.intersectsBox(meshBox)) return false;

        if (node.type === 'LEAF') {
            const meshToAdd = mesh.parent ? mesh.clone() : mesh;
            if (mesh.parent) meshToAdd.userData = Object.assign({}, mesh.userData);

            node.physicsMeshGroup.add(meshToAdd);
            node.state = NODE_STATE.PENDING_BUILD;

            if(mesh.userData) mesh.userData.inMainWorld = true;

            if (node.physics) {
                this._synchronouslyRebuildNode(node, meshToAdd);
            } else {
                this._buildNodePhysics(node);
            }
            return true;
        } else {
            let placed = false;
            for (const child of node.children) {
                if (this._insertMeshOnly(child, mesh, meshBox)) {
                    placed = true;
                }
            }
            return placed;
        }
    },

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

            if (intersectingChildren.length === 1) {
                this._distributeMeshes(intersectingChildren[0], mesh);
            } else if (intersectingChildren.length > 1) {
                intersectingChildren.forEach(child => {
                    this._distributeMeshes(child, mesh.clone());
                });
            }
        }
    },

    addObject(mesh) {
        if (!mesh) return false;

        mesh.updateMatrixWorld(true);
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const worldBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);

        if (!this._root) {
            this._root = this.createNode(worldBox.clone());
        } else {
            this._root.box.union(worldBox);
        }

        const physicsClone = new THREE.Mesh(mesh.geometry.clone());
        mesh.getWorldPosition(physicsClone.position);
        mesh.getWorldQuaternion(physicsClone.quaternion);
        mesh.getWorldScale(physicsClone.scale);
        physicsClone.updateMatrix();
        physicsClone.updateMatrixWorld(true);
        
        physicsClone.userData = { ...mesh.userData, visualReference: mesh };

        const satGeo = mesh.geometry.clone();
        const satClone = new THREE.Mesh(satGeo);
        satClone.copy(physicsClone); 
        satClone.updateMatrix();
        satClone.updateMatrixWorld(true);
        
        satClone.userData = { ...mesh.userData, visualReference: mesh };

        const tempGroup = new THREE.Group();
        tempGroup.add(satClone);

        const AwtsmoosOctree = this.AwtsmoosOctreeClass;
        const satelliteOctree = new AwtsmoosOctree(worldBox.clone().expandByScalar(0.05));
        satelliteOctree._isManaged = true; 
        satelliteOctree.fromGraphNode(tempGroup);
        satelliteOctree.build(); 
        
        satelliteOctree.creationTime = performance.now();
        satelliteOctree.sourceMesh = mesh;

        this._pendingOctrees.push(satelliteOctree);

        physicsClone.userData.inMainWorld = true; 
        this._insertMeshOnly(this._root, physicsClone, worldBox);

        return true;
    },

    _buildNodePhysics(node) {
        // Lag Prevention Valve.
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        if (totalTriangles > 15000) return; 

        const AwtsmoosOctree = this.AwtsmoosOctreeClass;
        // B"H FIX: Expand box slightly to prevent boundary precision issues dropping triangles
        const newPhysics = new AwtsmoosOctree(node.box.clone().expandByScalar(0.1));
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
    },
    
    _synchronouslyRebuildNode(node, newMesh) {
        const geometry = (newMesh.geometry.index) ? newMesh.geometry.toNonIndexed() : newMesh.geometry;
        const positionAttribute = geometry.getAttribute('position');
        const v1 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const v3 = new THREE.Vector3();

        if (positionAttribute) {
            for (let i = 0; i < positionAttribute.count; i += 3) {
                v1.fromBufferAttribute(positionAttribute, i).applyMatrix4(newMesh.matrixWorld);
                v2.fromBufferAttribute(positionAttribute, i + 1).applyMatrix4(newMesh.matrixWorld);
                v3.fromBufferAttribute(positionAttribute, i + 2).applyMatrix4(newMesh.matrixWorld);
                
                // Use a proper triangle for intersection check
                const t = new THREE.Triangle(v1.clone(), v2.clone(), v3.clone());
                if(!node.box.intersectsTriangle(t)) continue;

                t.sourceMesh = newMesh; 
                node.physics.addDynamicTriangle(t);
            }
        }
        if(newMesh.geometry.index) geometry.dispose();
    },

    _assessAndQueueWork(node, foci) {
        const center = node.box.getCenter(new THREE.Vector3());
        let highestPriority = 'MERGE';
        let detailLevel = Infinity;

        for (const focus of foci) {
            const dynamicBuildRadius = this._baseBuildRadius + (focus.velocity.length() * this._velocityLookaheadFactor);
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
                if (detailLevel < nodeSizeSq * 4 && this._getNodeDepth(node) < MAX_DEPTH) {
                    this._subdivisionQueue.add(node);
                }
                else if (node.state === NODE_STATE.PENDING_BUILD) {
                    this._buildQueue.add(node);
                }
            }
        } else { 
            if (node.type === 'BRANCH' && center.distanceToSquared(this._lastUpdateCenter) > this._mergeRadius * this._mergeRadius) {
                this._mergeQueue.add(node);
            }
        }
    },

    _processQueues() {
        const frameBudget = 5; 
        const startTime = performance.now();

        // 1. Intake
        while (this._intakeQueue.length > 0) {
            if (performance.now() - startTime > frameBudget) return;
            this.processIntakeQueue();
        }

        // 2. Build
        if (this._buildQueue.size > 0) {
            const iterator = this._buildQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this._buildQueue.delete(node);
                this._buildNodePhysics(node);
                result = iterator.next();
            }
        }

        // 3. Subdivide
        if (this._subdivisionQueue.size > 0) {
            const iterator = this._subdivisionQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this._subdivisionQueue.delete(node);
                this._subdivide(node);
                result = iterator.next();
            }
        }

        // 4. Merge
        if (this._mergeQueue.size > 0) {
             const iterator = this._mergeQueue.values();
            let result = iterator.next();
            while (!result.done) {
                if (performance.now() - startTime > frameBudget) return;
                const node = result.value;
                this._mergeQueue.delete(node);
                this._merge(node);
                result = iterator.next();
            }
        }
        
        // 5. Job Processing (Async Cloning/Triangle Extraction)
        if (this._activeJob || this._conversionQueue.length > 0) {
             const remainingTime = frameBudget - (performance.now() - startTime);
             if (remainingTime > 0) {
                 this._processActiveJob(remainingTime);
             }
        }
        
        // 6. Satellite Cleanup
        if (this._pendingOctrees.length > 0) {
            const now = performance.now();
            this._pendingOctrees = this._pendingOctrees.filter(sat => {
                if (now - sat.creationTime < 3000) return true;
                const center = sat.box.getCenter(_v1);
                // Requires _findLeafNodeAtPoint from Traversal (mixed in)
                const mainNode = this._findLeafNodeAtPoint(this._root, center);
                if (mainNode && mainNode.state === NODE_STATE.READY) {
                    return false; 
                }
                return true; 
            });
        }
    },

    _processActiveJob(timeLimit) {
        const deadline = performance.now() + timeLimit;
        
        if (!this._activeJob && this._conversionQueue.length > 0) {
            const proxy = this._conversionQueue.shift();
            this._activeJob = {
                proxy: proxy, step: JOB_STEP.CLONE, clone: null,
                iter: { idx: 0, count: 0 }, attr: null, index: null, mw: null, affected: new Set()
            };
        }

        const job = this._activeJob;
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
                if(this._root.box.intersectsBox(box)) this._root.box.union(box);

                job.step = JOB_STEP.SETUP_ITER;
                continue;
            }
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
                    this._distributeTriangleToNodes(this._root, tri, job.affected);
                }
                if (job.iter.idx >= job.iter.count) job.step = JOB_STEP.FINALIZE;
                continue;
            }
            if (job.step === JOB_STEP.FINALIZE) {
                job.affected.forEach(n => {
                    n.state = NODE_STATE.READY;
                    if (!n.physicsMeshGroup.children.includes(job.clone)) n.physicsMeshGroup.add(job.clone);
                });
                this._activeJob = null;
                break;
            }
        }
    },

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
            // This requires the OctreeWorld to have a createNode method or access to the class
            // Since we are mixing in, we assume 'this.createNode' works (defined in OctreeWorld.js)
            node.children.push(this.createNode(new THREE.Box3(min, min.clone().add(halfSize))));
        }
        
        const meshesToMove = [...node.physicsMeshGroup.children];
        node.physicsMeshGroup.clear();

        for(const meshToMove of meshesToMove) {
             this._distributeMeshes(node, meshToMove);
        }

        const foci = [{ position: this._lastUpdateCenter, velocity: new THREE.Vector3() }];
        node.children.forEach(child => this._assessAndQueueWork(child, foci));
    },

    _merge(node) {
        const meshesToCollect = [];

        const gather = (currentNode) => {
            if (currentNode.type === 'BRANCH') {
                currentNode.children.forEach(gather);
            }
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
        
        if (node.physicsMeshGroup.children.length > 0) {
            node.state = NODE_STATE.PENDING_BUILD;
        } else {
            node.state = NODE_STATE.EMPTY;
        }
    },
    
    _distributeTriangleToNodes(node, triangle, affectedNodes) {
        if (!node.box.intersectsTriangle(triangle)) return;

        if (node.type === 'LEAF') {
            if (!node.physics) {
                const AwtsmoosOctree = this.AwtsmoosOctreeClass;
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
                this._distributeTriangleToNodes(node.children[i], triangle, affectedNodes);
            }
        }
    },
    
    _enforceCriticalPath(foci) {
        for (const focus of foci) {
            const criticalPoint = focus.position.clone().addScaledVector(focus.velocity, 0.25);
            let currentNode = this._findLeafNodeAtPoint(this._root, criticalPoint);

            if (currentNode && currentNode.state !== NODE_STATE.READY) {
                this._buildNodePhysics(currentNode);
            }
        }
    }
};