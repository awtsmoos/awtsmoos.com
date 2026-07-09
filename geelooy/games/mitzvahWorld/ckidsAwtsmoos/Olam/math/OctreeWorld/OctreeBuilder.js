
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { Octree as AwtsmoosOctree } from "../AwtsmoosOctree/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { JOB_STEP, NODE_STATE } from "./constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _tempBox = new THREE.Box3();
const _tempTri = new THREE.Triangle();

export default class OctreeBuilder {
    constructor(world) {
        this.world = world;
        this.activeJob = null;
        this.conversionQueue =[];
    }

    buildNodePhysics(node) {
        let totalTriangles = 0;
        for(const mesh of node.physicsMeshGroup.children) {
             const geo = mesh.geometry;
             const count = geo.index ? geo.index.count : geo.attributes.position.count;
             totalTriangles += (count / 3);
        }

        if (totalTriangles > 5000000) {
            console.warn(`B"H - 🏔️ Node geometry exceeds 5,000,000 triangles. Aborting build.`);
            return; 
        }

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
    
    synchronouslyRebuildNode(node, newMesh) {
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
                
                const newTriangle = new THREE.Triangle(v1.clone(), v2.clone(), v3.clone());
                
                // B"H: ABSOLUTE PURGE OF THE VOID
                // Discard any triangle that has no mathematical area!
                if (newTriangle.getArea() < 1e-8) continue;
                
                if(!node.box.intersectsTriangle(newTriangle)) continue;

                newTriangle.sourceMesh = newMesh; 
                node.physics.addDynamicTriangle(newTriangle);
            }
        }
        if(newMesh.geometry.index) geometry.dispose();
    }

    processActiveJob(timeLimit, distributeCallback) {
        const deadline = performance.now() + timeLimit;
        
        if (!this.activeJob && this.conversionQueue.length > 0) {
            const proxy = this.conversionQueue.shift();
            this.activeJob = {
                proxy: proxy, 
                step: JOB_STEP.CLONE, 
                clone: null,
                iter: { idx: 0, count: 0 }, 
                attr: null, 
                index: null, 
                mw: null, 
                affected: new Set()
            };
        }

        const job = this.activeJob;
        if (!job) return;

        while (performance.now() < deadline) {
             if (job.step === JOB_STEP.CLONE) {
                job.clone = job.proxy.mesh.clone();
                if(job.clone.parent) job.clone.parent = null;
                job.clone.updateMatrix();
                job.step = JOB_STEP.BOUNDS;
                continue;
            }
            if (job.step === JOB_STEP.BOUNDS) {
                job.clone.position.copy(job.proxy.mesh.position);
                job.clone.quaternion.copy(job.proxy.mesh.quaternion);
                job.clone.scale.copy(job.proxy.mesh.scale);
                job.clone.updateMatrix();
                job.clone.matrixWorld.copy(job.clone.matrix);
                
                if(!job.clone.geometry.boundingBox) job.clone.geometry.computeBoundingBox();
                const box = _tempBox.setFromObject(job.clone);
                
                if(this.world.root && this.world.root.box.intersectsBox(box)) {
                    this.world.root.box.union(box);
                }

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
                    
                    // B"H: ABSOLUTE PURGE OF THE VOID (ASYNC JOB BUILDER)
                    // If a triangle has no mathematical dimension, we cast it out!
                    // This is what caused the House freeze.
                    if (tri.getArea() < 1e-8) continue;
                    
                    tri.sourceMesh = job.clone;
                    distributeCallback(this.world.root, tri, job.affected);
                }
                if (job.iter.idx >= job.iter.count) job.step = JOB_STEP.FINALIZE;
                continue;
            }
            if (job.step === JOB_STEP.FINALIZE) {
                job.affected.forEach(n => {
                    n.state = NODE_STATE.READY;
                    if (!n.physicsMeshGroup.children.includes(job.clone)) n.physicsMeshGroup.add(job.clone);
                });
                this.activeJob = null;
                break;
            }
        }
    }
}
