
/**
 * B"H
 * Job Processor for background geometry operations
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { JOB_STEP, NODE_STATE } from './constants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _tempBox = new THREE.Box3();
const _tempTri = new THREE.Triangle();

export default class JobProcessor {
    constructor(world) {
        this.world = world;
        this.activeJob = null;
        this.conversionQueue = [];
    }

    queueJob(proxy) {
        this.conversionQueue.push(proxy);
    }

    hasWork() {
        return this.activeJob || this.conversionQueue.length > 0;
    }

    process(timeLimit) {
        const deadline = performance.now() + timeLimit;

        if (!this.activeJob && this.conversionQueue.length > 0) {
            const proxy = this.conversionQueue.shift();
            this.activeJob = {
                proxy: proxy, step: JOB_STEP.CLONE, clone: null,
                iter: { idx: 0, count: 0 }, attr: null, index: null, mw: null, affected: new Set()
            };
        }

        const job = this.activeJob;
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
                this._setupMatrices(job);
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
                if (this._processTriangles(job)) {
                    job.step = JOB_STEP.FINALIZE;
                }
                continue;
            }
            if (job.step === JOB_STEP.FINALIZE) {
                job.affected.forEach(n => {
                    n.state = NODE_STATE.READY;
                    // B"H: ABSOLUTE EXISTENTIAL CONTINUITY
                    // Clone the mesh so `Object3D.add` doesn't steal it from previous nodes!
                    const finalClone = job.clone.clone();
                    finalClone.matrixWorld.copy(job.clone.matrixWorld);
                    finalClone.userData = { ...job.clone.userData };
                    
                    if (!n.physicsMeshGroup.children.some(c => c.userData?.visualReference === finalClone.userData.visualReference)) {
                        n.physicsMeshGroup.add(finalClone);
                    }
                });
                this.activeJob = null;
                break;
            }
        }
    }

    _setupMatrices(job) {
        job.clone.position.copy(job.proxy.mesh.position);
        job.clone.quaternion.copy(job.proxy.mesh.quaternion);
        job.clone.scale.copy(job.proxy.mesh.scale);
        job.clone.updateMatrix();
        job.clone.matrixWorld.copy(job.clone.matrix);

        if(!job.clone.geometry.boundingBox) job.clone.geometry.computeBoundingBox();
        const box = _tempBox.setFromObject(job.clone);
        if(this.world.root.box.intersectsBox(box)) this.world.root.box.union(box);
    }

    _processTriangles(job) {
        const batch = 100;
        const target = Math.min(job.iter.idx + batch, job.iter.count);
        const pos=job.attr, idx=job.index, mw=job.mw;

        for (; job.iter.idx < target; job.iter.idx += 3) {
            let a, b, c;
            if (idx) {
                a = idx.getX(job.iter.idx); b = idx.getX(job.iter.idx+1); c = idx.getX(job.iter.idx+2);
            } else {
                a = job.iter.idx; b = a+1; c = a+2;
            }
            _v1.fromBufferAttribute(pos, a).applyMatrix4(mw);
            _v2.fromBufferAttribute(pos, b).applyMatrix4(mw);
            _v3.fromBufferAttribute(pos, c).applyMatrix4(mw);
            _tempTri.set(_v1, _v2, _v3);
            _tempTri.sourceMesh = job.clone;
            this.world._distributeTriangleToNodes(this.world.root, _tempTri, job.affected);
        }
        return job.iter.idx >= job.iter.count;
    }
}
