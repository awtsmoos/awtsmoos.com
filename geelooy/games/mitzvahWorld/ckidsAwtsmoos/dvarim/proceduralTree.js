
/**
 * B"H
 * @file proceduralTree.js
 * Generates dynamic trees based on genetic parameters.
 */
import Tzomayach from "../chayim/tzomayach.js";
import * as THREE from '/games/scripts/build/three.module.js';
import RNG from "../utils/math/rng.js";

// --- Configuration Enums & Presets ---
const TreePresets = {
    'Oak': {
        seed: 35729,
        branch: {
            levels: 3, angle: {1: 54, 2: 58, 3: 32}, children: {0: 6, 1: 4, 2: 3},
            force: { direction: {x: 0, y: 1, z: 0}, strength: -0.01 },
            gnarliness: {0: 0, 1: -0.1, 2: -0.15, 3: 0.09},
            length: {0: 10, 1: 5, 2: 4, 3: 2}, 
            radius: {0: 0.8, 1: 0.5, 2: 0.3, 3: 0.1},
            sections: {0: 8, 1: 6, 2: 3, 3: 1}, segments: {0: 7, 1: 5, 2: 3, 3: 3},
            start: {1: 0.49, 2: 0.06, 3: 0.12}, taper: {0: 0.73, 1: 0.42, 2: 0.69, 3: 0.75},
            twist: {0: -0.23, 1: 0.42, 2: 0, 3: 0}
        },
        leaves: { type: 'Oak', billboard: 'double', angle: 42, count: 18, start: 0.16, size: 1.5, sizeVariance: 0.7, tint: 0x55aa55, alphaTest: 0.5 }
    },
    'Pine': {
        seed: 13977,
        type: 'evergreen',
        branch: {
            levels: 1, angle: {1: 110, 2: 16, 3: 60}, children: {0: 60, 1: 3, 2: 5},
            force: { direction: {x: 0, y: 1, z: 0}, strength: -0.003 },
            gnarliness: {0: 0.05, 1: 0.08, 2: 0, 3: 0},
            length: {0: 12, 1: 4, 2: 2, 3: 1},
            radius: {0: 0.6, 1: 0.2, 2: 0.7, 3: 0.7},
            sections: {0: 12, 1: 10, 2: 8, 3: 6}, segments: {0: 8, 1: 6, 2: 4, 3: 3},
            start: {1: 0.27, 2: 0.14, 3: 0.3}, taper: {0: 0.7, 1: 0.7, 2: 0.7, 3: 0.7},
            twist: {0: 0, 1: 0, 2: 0, 3: 0}
        },
        leaves: { type: 'Pine', billboard: 'double', angle: 39, count: 20, start: 0.09, size: 0.8, sizeVariance: 0.2, tint: 0x336633, alphaTest: 0.3 }
    }
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
        
        const presetName = op.itemData?.preset || op.preset || 'Oak';
        this.options = JSON.parse(JSON.stringify(TreePresets[presetName] || TreePresets['Oak']));
        if(op.seed) this.options.seed = op.seed;
        else this.options.seed = Math.random() * 10000;
        
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
        
        const branchMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); 
        
        // B"H: Attempt to load bark texture from components
        const preset = this.options.type === 'evergreen' ? 'Pine' : 'Oak';
        const barkPath = this.olam.getComponent("awtsmoos://barkTexture" + preset);
        if(barkPath) {
             this.olam.loadTexture({ url: barkPath, shouldRepeat: true, repeatX: 1, repeatY: 10 }).then(tex => {
                 branchMat.map = tex;
                 branchMat.needsUpdate = true;
             });
        }
        
        const branches = new THREE.Mesh(branchGeo, branchMat);
        
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
        
        // B"H: Attempt to load leaf texture from components
        const leafPath = this.olam.getComponent("awtsmoos://leafTexture" + preset);
        if(leafPath) {
             this.olam.loadTexture({ url: leafPath }).then(tex => {
                 this.leavesMaterial.map = tex;
                 this.leavesMaterial.needsUpdate = true;
             });
        }

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
        
        this.treeGroup.add(branches);
        this.treeGroup.add(leaves);
    }
}
