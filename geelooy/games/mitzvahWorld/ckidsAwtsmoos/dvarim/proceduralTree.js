
/**
 * B"H
 * @file proceduralTree.js
 * Generates dynamic trees based on genetic parameters.
 * Fully aligned with EZ-Tree specifications.
 */
import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import RNG from "../utils/math/rng.js";

// --- B"H: Full Tree Presets from Library ---
const TreePresets = {
  'Ash Large': { seed: 29919, type: "deciduous", bark: { type: "oak", tint: 13552830, flatShading: false, textured: true, textureScale: { x: 0.5, y: 5 } }, branch: { levels: 3, angle: { 1: 39, 2: 39, 3: 51 }, children: { 0: 10, 1: 4, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.0108 }, gnarliness: { 0: -0.05, 1: 0.2, 2: 0.16, 3: 0.05 }, length: { 0: 45, 1: 29.42, 2: 15.3, 3: 4.6 }, radius: { 0: 3.03, 1: 0.53, 2: 0.79, 3: 1.11 }, sections: { 0: 12, 1: 8, 2: 6, 3: 4 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.32, 2: 0.34, 3: 0 }, taper: { 0: 0.7, 1: 0.62, 2: 0.76, 3: 0 }, twist: { 0: 0.09, 1: -0.07, 2: 0, 3: 0 } }, leaves: { type: "ash", billboard: "double", angle: 30, count: 10, start: 0.01, size: 4.62, sizeVariance: 0.72, tint: 16777215, alphaTest: 0.5 } },
  'Ash Medium': { seed: 36330, type: "deciduous", bark: { type: "oak", tint: 13552830, flatShading: false, textured: true, textureScale: { x: 0.5, y: 5.0 } }, branch: { levels: 3, angle: { 1: 48, 2: 75, 3: 60 }, children: { 0: 7, 1: 4, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.06 }, gnarliness: { 0: 0.03, 1: 0.25, 2: 0.2, 3: 0.09 }, length: { 0: 43.47, 1: 27.14, 2: 9.51, 3: 4.6 }, radius: { 0: 2, 1: 0.63, 2: 0.76, 3: 0.7 }, sections: { 0: 12, 1: 8, 2: 6, 3: 4 }, segments: { 0: 12, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.23, 2: 0.33, 3: 0 }, taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 }, twist: { 0: 0.09, 1: -0.07, 2: 0, 3: 0 } }, leaves: { type: "ash", billboard: "double", angle: 55, count: 16, start: 0, size: 2.67, sizeVariance: 0.72, tint: 16777215, alphaTest: 0.5 } },
  'Ash Small': { seed: 26867, type: "deciduous", bark: { type: "oak", tint: 13552830, flatShading: false, textured: true, textureScale: { x: 0.5, y: 5 } }, branch: { levels: 2, angle: { 1: 48, 2: 75, 3: 60 }, children: { 0: 10, 1: 3, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.02 }, gnarliness: { 0: 0.11, 1: 0.09, 2: 0.05, 3: 0.09 }, length: { 0: 23.87, 1: 18, 2: 5.59, 3: 4.6 }, radius: { 0: 0.81, 1: 0.56, 2: 0.76, 3: 0.7 }, sections: { 0: 12, 1: 10, 2: 10, 3: 10 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.53, 2: 0.33, 3: 0 }, taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 }, twist: { 0: 0.3, 1: -0.07, 2: 0, 3: 0 } }, leaves: { type: "ash", billboard: "double", angle: 55, count: 30, start: 0, size: 2.05, sizeVariance: 0.717, tint: 16777215, alphaTest: 0.5 } },
  'Aspen Large': { seed: 30631, type: "deciduous", bark: { type: "birch", tint: 16777215, flatShading: false, textured: true, textureScale: { x: 1, y: 1 } }, branch: { levels: 2, angle: { 1: 47, 2: 63, 3: 7 }, children: { 0: 10, 1: 6, 2: 0 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.0217 }, gnarliness: { 0: 0.05, 1: -0.03, 2: 0.12, 3: 0.02 }, length: { 0: 69.6, 1: 18.56, 2: 11.19, 3: 1 }, radius: { 0: 1.11, 1: 0.58, 2: 0.7, 3: 0.7 }, sections: { 0: 12, 1: 10, 2: 8, 3: 6 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.62, 2: 0.05, 3: 0 }, taper: { 0: 0.7, 1: 0.13, 2: 0.7, 3: 0.7 }, twist: { 0: 0, 1: 0, 2: 0, 3: 0 } }, leaves: { type: "aspen", billboard: "double", angle: 36, count: 20, start: 0.15, size: 3.47, sizeVariance: 0.7, tint: 16580390, alphaTest: 0.5 } },
  'Aspen Medium': { seed: 18020, type: "deciduous", bark: { type: "birch", tint: 16777215, flatShading: false, textured: true, textureScale: { x: 1, y: 1 } }, branch: { levels: 2, angle: { 1: 75, 2: 32, 3: 7 }, children: { 0: 10, 1: 3, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.0148 }, gnarliness: { 0: 0.05, 1: 0.12, 2: 0.12, 3: 0.02 }, length: { 0: 50, 1: 6.07, 2: 11.19, 3: 1 }, radius: { 0: 0.72, 1: 0.41, 2: 0.7, 3: 0.7 }, sections: { 0: 12, 1: 10, 2: 8, 3: 6 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.59, 2: 0.35, 3: 0 }, taper: { 0: 0.37, 1: 0.13, 2: 0.7, 3: 0.7 }, twist: { 0: 0, 1: 0, 2: 0, 3: 0 } }, leaves: { type: "aspen", billboard: "double", angle: 30, count: 11, start: 0.124, size: 2.5, sizeVariance: 0.7, tint: 16775778, alphaTest: 0.5 } },
  'Bush 1': { seed: 45590, type: "deciduous", bark: { type: "oak", tint: 13552830, flatShading: false, textured: true, textureScale: { x: 0.5, y: 5 } }, branch: { levels: 3, angle: { 1: 21.5, 2: 62.6, 3: 60 }, children: { 0: 7, 1: 3, 2: 2 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.02 }, gnarliness: { 0: 0.11, 1: 0.09, 2: 0.05, 3: 0.09 }, length: { 0: 0.1, 1: 15.3, 2: 5.59, 3: 4.6 }, radius: { 0: 0.58, 1: 0.95, 2: 0.76, 3: 0.7 }, sections: { 0: 6, 1: 6, 2: 10, 3: 10 }, segments: { 0: 4, 1: 4, 2: 4, 3: 3 }, start: { 1: 0.53, 2: 0.33, 3: 0 }, taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 }, twist: { 0: 0.3, 1: -0.07, 2: 0, 3: 0 } }, leaves: { type: "ash", billboard: "double", angle: 55, count: 12, start: 0, size: 2.45, sizeVariance: 0.717, tint: 14745557, alphaTest: 0.5 } },
  'Oak Large': { seed: 23399, type: "deciduous", bark: { type: "oak", tint: 16774097, flatShading: false, textured: true, textureScale: { x: 1, y: 10 } }, branch: { levels: 3, angle: { 1: 54, 2: 43, 3: 32 }, children: { 0: 9, 1: 5, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.025 }, gnarliness: { 0: -0.04, 1: 0.16, 2: -0.06, 3: 0.09 }, length: { 0: 47.7, 1: 29.39, 2: 17.62, 3: 7.16 }, radius: { 0: 3, 1: 0.69, 2: 0.69, 3: 1.19 }, sections: { 0: 16, 1: 9, 2: 8, 3: 3 }, segments: { 0: 12, 1: 5, 2: 3, 3: 3 }, start: { 1: 0.35, 2: 0.1, 3: 0.0 }, taper: { 0: 0.73, 1: 0.42, 2: 0.69, 3: 0.75 }, twist: { 0: -0.23, 1: 0.42, 2: 0, 3: 0 } }, leaves: { type: "oak", billboard: "double", angle: 36, count: 10, start: 0.16, size: 4.5, sizeVariance: 0.7, tint: 14013901, alphaTest: 0.5 } },
  'Oak Medium': { seed: 35729, type: "deciduous", bark: { type: "oak", tint: 16774097, flatShading: false, textured: true, textureScale: { x: 1, y: 10 } }, branch: { levels: 3, angle: { 1: 54, 2: 58, 3: 32 }, children: { 0: 6, 1: 4, 2: 3 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: -0.01 }, gnarliness: { 0: 0, 1: -0.1, 2: -0.15, 3: 0.09 }, length: { 0: 37.24, 1: 11.08, 2: 12.39, 3: 7.16 }, radius: { 0: 1.41, 1: 0.9, 2: 0.69, 3: 1.19 }, sections: { 0: 8, 1: 6, 2: 3, 3: 1 }, segments: { 0: 7, 1: 5, 2: 3, 3: 3 }, start: { 1: 0.49, 2: 0.06, 3: 0.12 }, taper: { 0: 0.73, 1: 0.42, 2: 0.69, 3: 0.75 }, twist: { 0: -0.23, 1: 0.42, 2: 0, 3: 0 } }, leaves: { type: "oak", billboard: "double", angle: 42, count: 18, start: 0.16, size: 2.5, sizeVariance: 0.7, tint: 14013901, alphaTest: 0.5 } },
  'Pine Large': { seed: 44166, type: "evergreen", bark: { type: "pine", tint: 16777215, flatShading: false, textured: true, textureScale: { x: 1, y: 1 } }, branch: { levels: 1, angle: { 1: 129, 2: 16, 3: 60 }, children: { 0: 100, 1: 3, 2: 0 }, force: { direction: { x: 0, y: 1, z: 0 }, strength: 0.009 }, gnarliness: { 0: 0.05, 1: 0.08, 2: 0, 3: 0 }, length: { 0: 65.25, 1: 34.84, 2: 27.24, 3: 1 }, radius: { 0: 1.27, 1: 0.36, 2: 0.7, 3: 0.7 }, sections: { 0: 12, 1: 10, 2: 8, 3: 6 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.29, 2: 0.14, 3: 0.3 }, taper: { 0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7 }, twist: { 0: 0, 1: 0, 2: 0, 3: 0 } }, leaves: { type: "pine", billboard: "double", angle: 17, count: 18, start: 0.076, size: 2.6, sizeVariance: 0.2, tint: 16777215, alphaTest: 0.3 } },
  'Willow': { seed: 99887, type: "deciduous", bark: { type: "willow", tint: 16777215, flatShading: false, textured: true, textureScale: { x: 1, y: 1 } }, branch: { levels: 3, angle: { 1: 30, 2: 80, 3: 100 }, children: { 0: 5, 1: 8, 2: 5 }, force: { direction: { x: 0, y: -1, z: 0 }, strength: 0.05 }, gnarliness: { 0: 0.2, 1: 0.1, 2: 0.3, 3: 0.1 }, length: { 0: 30, 1: 15, 2: 10, 3: 8 }, radius: { 0: 1.5, 1: 0.8, 2: 0.4, 3: 0.1 }, sections: { 0: 12, 1: 8, 2: 6, 3: 4 }, segments: { 0: 8, 1: 6, 2: 4, 3: 3 }, start: { 1: 0.4, 2: 0.2, 3: 0.1 }, taper: { 0: 0.5, 1: 0.6, 2: 0.8, 3: 0.8 }, twist: { 0: 0.1, 1: 0.1, 2: 0.1, 3: 0.1 } }, leaves: { type: "ash", billboard: "double", angle: 80, count: 25, start: 0.1, size: 1.5, sizeVariance: 0.5, tint: 14745557, alphaTest: 0.5 } }
};

class Branch {
    constructor(origin, orientation, length, radius, level, sectionCount, segmentCount) {
        this.origin = origin.clone();
        this.orientation = orientation.clone();
        this.length = length;
        this.radius = radius;
        this.level = level;
        this.sectionCount = sectionCount;
        this.segmentCount = segmentCount;
    }
}

export default class ProceduralTree extends Tzomayach {
    type = "proceduralTree";
    static itemName = "Tree Seed";
    static description = "Plants a procedural tree.";
    static isBuildable = true; 
    
    constructor(op, olam) {
        super(op);
        
        // B"H: Load Preset
        const presetName = op.itemData?.preset || op.preset || 'Oak Medium';
        this.options = JSON.parse(JSON.stringify(TreePresets[presetName] || TreePresets['Oak Medium']));
        
        // B"H: Allow seed override
        if(op.seed) this.options.seed = op.seed;
        else this.options.seed = Math.random() * 65536;
        
        this.on("heescheel", async (olam) => {
             this.generate();
             this.mesh = this.treeGroup;
             this.mesh.nivraAwtsmoos = this;
             
             if(this.position) this.mesh.position.copy(this.position.vector3());
             if(this.rotation) this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
             if(this.scale) this.mesh.scale.copy(this.scale);
             
             this.mesh.updateMatrixWorld(true);
             
             olam.nivrayimGroup.add(this.mesh);
             
             if(this.isSolid) {
                 const trunkHeight = this.options.branch.length[0];
                 const trunkRadius = this.options.branch.radius[0];
                 const proxyGeo = new THREE.CylinderGeometry(trunkRadius * 0.5, trunkRadius, trunkHeight, 8);
                 proxyGeo.translate(0, trunkHeight/2, 0);
                 const proxyMesh = new THREE.Mesh(proxyGeo);
                 
                 proxyMesh.position.copy(this.mesh.position);
                 proxyMesh.rotation.copy(this.mesh.rotation);
                 proxyMesh.scale.copy(this.mesh.scale);
                 proxyMesh.updateMatrixWorld(true);
                 
                 proxyMesh.userData = { isSolid: true, visualReference: this.mesh };
                 this.olam.worldOctree.addObject(proxyMesh);
             }
        });
        
        this.on("heesHawvoos", (dt) => {
            if(this.leavesMaterial && this.leavesMaterial.userData.shader) {
                 this.leavesMaterial.userData.shader.uniforms.uTime.value += dt;
            }
        });
    }
    
    generate() {
        this.treeGroup = new THREE.Group();
        this.rng = new RNG(this.options.seed);
        
        this.branches = { verts: [], normals: [], indices: [], uvs: [] };
        this.leaves = { verts: [], normals: [], indices: [], uvs: [] };
        
        const branchQueue = [];
        
        branchQueue.push(new Branch(
            new THREE.Vector3(), new THREE.Euler(), 
            this.options.branch.length[0], this.options.branch.radius[0], 
            0, this.options.branch.sections[0], this.options.branch.segments[0]
        ));
        
        while(branchQueue.length > 0) {
            const b = branchQueue.shift();
            this.generateBranch(b, branchQueue);
        }
        
        this.createMeshes();
    }
    
    generateBranch(branch, queue) {
        const indexOffset = this.branches.verts.length / 3;
        let orientation = branch.orientation.clone();
        let origin = branch.origin.clone();
        
        let divisor = (this.options.type === 'evergreen' ? 1 : Math.max(1, this.options.branch.levels - 1));
        let sectionLength = branch.length / branch.sectionCount / divisor;
        
        let sections = [];
        
        for (let i = 0; i <= branch.sectionCount; i++) {
            let r = branch.radius;
            if (i === branch.sectionCount && branch.level === this.options.branch.levels) r = 0.001;
            else r *= (1 - (this.options.branch.taper[branch.level] || 0.7) * (i / branch.sectionCount));
            
            let first;
            for (let j = 0; j < branch.segmentCount; j++) {
                let angle = (2.0 * Math.PI * j) / branch.segmentCount;
                let v = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(r).applyEuler(orientation).add(origin);
                let n = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)).applyEuler(orientation).normalize();
                let uv = new THREE.Vector2(j / branch.segmentCount, i % 2 === 0 ? 0 : 1);
                
                this.branches.verts.push(v.x, v.y, v.z);
                this.branches.normals.push(n.x, n.y, n.z);
                this.branches.uvs.push(uv.x, uv.y);
                if (j === 0) first = { v, n, uv };
            }
            this.branches.verts.push(first.v.x, first.v.y, first.v.z);
            this.branches.normals.push(first.n.x, first.n.y, first.n.z);
            this.branches.uvs.push(1, first.uv.y);
            
            sections.push({ origin: origin.clone(), orientation: orientation.clone(), radius: r });
            origin.add(new THREE.Vector3(0, sectionLength, 0).applyEuler(orientation));
            
            const gnarl = Math.max(1, 1/Math.sqrt(r)) * (this.options.branch.gnarliness[branch.level] || 0);
            orientation.x += this.rng.random(gnarl, -gnarl);
            orientation.z += this.rng.random(gnarl, -gnarl);
            
            const qSec = new THREE.Quaternion().setFromEuler(orientation);
            const forceVec = this.options.branch.force.direction;
            const qForce = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(forceVec.x, forceVec.y, forceVec.z));
            qSec.rotateTowards(qForce, (this.options.branch.force.strength || 0) / r);
            orientation.setFromQuaternion(qSec);
        }
        
        const N = branch.segmentCount + 1;
        for (let i = 0; i < branch.sectionCount; i++) {
            for (let j = 0; j < branch.segmentCount; j++) {
                let v1 = indexOffset + i * N + j;
                let v2 = indexOffset + i * N + (j+1);
                let v3 = v1 + N;
                let v4 = v2 + N;
                this.branches.indices.push(v1, v3, v2, v2, v3, v4);
            }
        }
        
        if (branch.level < this.options.branch.levels) {
             const childCount = this.options.branch.children[branch.level] || 0;
             this.generateChildBranches(childCount, branch.level + 1, sections, queue);
             
             if (this.options.type !== 'evergreen') {
                 const last = sections[sections.length - 1];
                 queue.push(new Branch(
                     last.origin, last.orientation, 
                     this.options.branch.length[branch.level + 1], last.radius,
                     branch.level + 1, branch.sectionCount, branch.segmentCount
                 ));
             }
        } else {
            this.generateLeaves(sections);
        }
    }
    
    generateChildBranches(count, level, sections, queue) {
        for(let i=0; i<count; i++) {
            let start = this.rng.random(1.0, this.options.branch.start[level] || 0);
            const idx = Math.floor(start * (sections.length - 1));
            const secA = sections[idx];
            const secB = sections[Math.min(idx+1, sections.length-1)];
            const alpha = (start - idx / (sections.length - 1)) / (1 / (sections.length - 1));
            
            const origin = new THREE.Vector3().lerpVectors(secA.origin, secB.origin, alpha);
            const radius = this.options.branch.radius[level] * ((1-alpha)*secA.radius + alpha*secB.radius);
            
            const qA = new THREE.Quaternion().setFromEuler(secA.orientation);
            const qB = new THREE.Quaternion().setFromEuler(secB.orientation);
            const parentRot = new THREE.Euler().setFromQuaternion(qB.slerp(qA, alpha));
            
            const radialAngle = 2 * Math.PI * this.rng.random();
            const angle = (this.options.branch.angle[level] || 30) * Math.PI / 180;
            
            const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), angle);
            const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), radialAngle);
            const q3 = new THREE.Quaternion().setFromEuler(parentRot);
            
            const orientation = new THREE.Euler().setFromQuaternion(q3.multiply(q2.multiply(q1)));
            
            let len = this.options.branch.length[level] * (this.options.type === 'evergreen' ? 1.0 - start : 1.0);
            
            queue.push(new Branch(origin, orientation, len, radius, level, this.options.branch.sections[level], this.options.branch.segments[level]));
        }
    }
    
    generateLeaves(sections) {
        const count = this.options.leaves.count;
        for(let i=0; i<count; i++) {
            let start = this.rng.random(1.0, this.options.leaves.start);
            const idx = Math.floor(start * (sections.length - 1));
            const secA = sections[idx];
            const secB = sections[Math.min(idx+1, sections.length-1)];
            const origin = new THREE.Vector3().lerpVectors(secA.origin, secB.origin, 0.5);
            
            const angle = this.options.leaves.angle * Math.PI / 180;
            const leafOrient = new THREE.Euler(Math.random(), Math.random(), Math.random()); 
            
            this.generateLeafQuad(origin, leafOrient);
        }
    }
    
    generateLeafQuad(origin, orientation) {
        let i = this.leaves.verts.length / 3;
        let size = this.options.leaves.size * (1 + this.rng.random(0.2, -0.2));
        
        const makeQuad = (rotOffset) => {
            const v = [
                new THREE.Vector3(-size/2, size, 0), new THREE.Vector3(-size/2, 0, 0),
                new THREE.Vector3(size/2, 0, 0), new THREE.Vector3(size/2, size, 0)
            ].map(vec => vec.applyEuler(new THREE.Euler(0, rotOffset, 0)).applyEuler(orientation).add(origin));
            
            v.forEach(vec => this.leaves.verts.push(vec.x, vec.y, vec.z));
            const n = new THREE.Vector3(0,0,1).applyEuler(orientation);
            for(let k=0; k<4; k++) this.leaves.normals.push(n.x, n.y, n.z);
            this.leaves.uvs.push(0,1, 0,0, 1,0, 1,1);
            this.leaves.indices.push(i, i+1, i+2, i, i+2, i+3);
            i+=4;
        };
        makeQuad(0);
        if(this.options.leaves.billboard === 'double') makeQuad(Math.PI/2);
    }
    
    async createMeshes() {
        const branchGeo = new THREE.BufferGeometry();
        branchGeo.setAttribute('position', new THREE.Float32BufferAttribute(this.branches.verts, 3));
        branchGeo.setAttribute('normal', new THREE.Float32BufferAttribute(this.branches.normals, 3));
        branchGeo.setAttribute('uv', new THREE.Float32BufferAttribute(this.branches.uvs, 2));
        branchGeo.setIndex(this.branches.indices);
        
        // B"H: Use Standard Material for PBR if textures allow
        const branchMat = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(this.options.bark.tint),
            roughness: 1.0,
            metalness: 0.0,
            flatShading: this.options.bark.flatShading
        }); 
        
        // B"H: Dynamic Texture Loading based on Preset
        const barkType = this.options.bark.type || 'oak';
        const barkCap = barkType.charAt(0).toUpperCase() + barkType.slice(1); // e.g., "Birch"

        const texScale = this.options.bark.textureScale || {x:1, y:1};

        if(this.options.bark.textured) {
             const loadTex = (key) => {
                 const path = this.olam.getComponent("awtsmoos://barkTexture" + barkCap + key);
                 if(path) {
                     return this.olam.loadTexture({ url: path, shouldRepeat: true, repeatX: texScale.x, repeatY: texScale.y });
                 }
                 return Promise.resolve(null);
             };

             Promise.all([
                 loadTex(""),          // Color
                 loadTex("_normal"),
                 loadTex("_roughness"),
                 loadTex("_ao")
             ]).then(([col, nrm, rgh, ao]) => {
                 if(col) branchMat.map = col;
                 if(nrm) branchMat.normalMap = nrm;
                 if(rgh) branchMat.roughnessMap = rgh;
                 if(ao) branchMat.aoMap = ao;
                 branchMat.needsUpdate = true;
             });
        }
        
        const branches = new THREE.Mesh(branchGeo, branchMat);
        branches.castShadow = true;
        branches.receiveShadow = true;
        
        const leafGeo = new THREE.BufferGeometry();
        leafGeo.setAttribute('position', new THREE.Float32BufferAttribute(this.leaves.verts, 3));
        leafGeo.setAttribute('uv', new THREE.Float32BufferAttribute(this.leaves.uvs, 2));
        leafGeo.setIndex(this.leaves.indices);
        leafGeo.computeVertexNormals();
        
        this.leavesMaterial = new THREE.MeshPhongMaterial({
            color: this.options.leaves.tint,
            side: THREE.DoubleSide,
            alphaTest: this.options.leaves.alphaTest,
            shininess: 0
        });
        
        // B"H: Load Leaf Texture
        const leafType = this.options.leaves.type || 'oak';
        const leafCap = leafType.charAt(0).toUpperCase() + leafType.slice(1);
        const leafPath = this.olam.getComponent("awtsmoos://leafTexture" + leafCap);
        
        if(leafPath) {
             this.olam.loadTexture({ url: leafPath }).then(tex => {
                 this.leavesMaterial.map = tex;
                 this.leavesMaterial.needsUpdate = true;
             });
        }

        // B"H: Wind Shader
        this.leavesMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `
                uniform float uTime;
                // Simplex noise function would go here (simplified sine for brevity)
                void main() {
            ` + shader.vertexShader.replace('#include <project_vertex>', `
                vec4 mvPosition = vec4( transformed, 1.0 );
                float windOffset = position.x + position.z;
                float wind = sin(uTime * 1.5 + windOffset * 0.5) * 0.1 * uv.y;
                mvPosition.x += wind;
                mvPosition = modelViewMatrix * mvPosition;
                gl_Position = projectionMatrix * mvPosition;
            `);
            this.leavesMaterial.userData.shader = shader;
        };
        
        const leaves = new THREE.Mesh(leafGeo, this.leavesMaterial);
        leaves.castShadow = true;
        leaves.receiveShadow = true;
        
        this.treeGroup.add(branches);
        this.treeGroup.add(leaves);
    }
}
