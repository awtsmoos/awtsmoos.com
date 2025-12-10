
/**
 * B"H
 * @file treeGenerator.js
 * Logic for generating tree geometry.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import RNG from "../../../utils/math/rng.js";
import Branch from "./branch.js";

export default class TreeGenerator {
    constructor(options, olam) {
        this.options = options;
        this.olam = olam;
        this.rng = new RNG(this.options.seed);
        this.branches = { verts: [], normals: [], indices: [], uvs: [] };
        this.leaves = { verts: [], normals: [], indices: [], uvs: [] };
        this.treeGroup = new THREE.Group();
    }

    generate() {
        // Reset arrays
        this.branches = { verts: [], normals: [], indices: [], uvs: [] };
        this.leaves = { verts: [], normals: [], indices: [], uvs: [] };
        
        const branchQueue = [];
        
        // Initial Trunk
        branchQueue.push(new Branch(
            new THREE.Vector3(), new THREE.Euler(), 
            this.options.branch.length[0], this.options.branch.radius[0], 
            0, this.options.branch.sections[0], this.options.branch.segments[0]
        ));
        
        while(branchQueue.length > 0) {
            const b = branchQueue.shift();
            this.generateBranch(b, branchQueue);
        }
        
        return {
            treeGroup: this.treeGroup,
            branches: this.branches,
            leaves: this.leaves
        };
    }
    
    generateBranch(branch, queue) {
        const indexOffset = this.branches.verts.length / 3;
        let orientation = branch.orientation.clone();
        let origin = branch.origin.clone();
        
        let divisor = (this.options.type === 'evergreen' ? 1 : Math.max(1, this.options.branch.levels - 1));
        let sectionLength = branch.length / branch.sectionCount / divisor;
        
        // B"H: Track texture V-coordinate by accumulated length to prevent distortion
        let textureV = 0; 
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
                
                // B"H FIX: Use continuous texture V based on length
                let uv = new THREE.Vector2(j / branch.segmentCount, textureV);
                
                this.branches.verts.push(v.x, v.y, v.z);
                this.branches.normals.push(n.x, n.y, n.z);
                this.branches.uvs.push(uv.x, uv.y);
                if (j === 0) first = { v, n, uv };
            }
            // Close the loop
            this.branches.verts.push(first.v.x, first.v.y, first.v.z);
            this.branches.normals.push(first.n.x, first.n.y, first.n.z);
            this.branches.uvs.push(1, first.uv.y);
            
            sections.push({ origin: origin.clone(), orientation: orientation.clone(), radius: r });
            origin.add(new THREE.Vector3(0, sectionLength, 0).applyEuler(orientation));
            
            // Accumulate texture length for next section
            textureV += (sectionLength * 0.2); // 0.2 scale factor keeps UVs reasonable

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
            // Terminal branch - add leaves
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
        if(count <= 0) return;
        
        for(let i=0; i<count; i++) {
            let start = this.rng.random(1.0, this.options.leaves.start);
            const idx = Math.floor(start * (sections.length - 1));
            const secA = sections[idx];
            const secB = sections[Math.min(idx+1, sections.length-1)];
            
            // Randomly position around the branch
            const origin = new THREE.Vector3().lerpVectors(secA.origin, secB.origin, Math.random());
            
            // Add slight random offset from branch center so they don't look like they are inside
            const offset = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize().multiplyScalar(secA.radius);
            origin.add(offset);

            const leafOrient = new THREE.Euler(
                Math.random() * Math.PI, 
                Math.random() * Math.PI * 2, 
                Math.random() * Math.PI
            ); 
            
            this.generateLeafQuad(origin, leafOrient);
        }
    }
    
    generateLeafQuad(origin, orientation) {
        let i = this.leaves.verts.length / 3;
        // B"H FIX: Ensure leaf size is visible
        let size = Math.max(0.5, this.options.leaves.size * (1 + this.rng.random(0.2, -0.2)));
        
        const makeQuad = (rotOffset) => {
            // Leaf centered at bottom
            const v = [
                new THREE.Vector3(-size/2, size, 0), new THREE.Vector3(-size/2, 0, 0),
                new THREE.Vector3(size/2, 0, 0), new THREE.Vector3(size/2, size, 0)
            ].map(vec => vec.applyEuler(new THREE.Euler(0, rotOffset, 0)).applyEuler(orientation).add(origin));
            
            v.forEach(vec => this.leaves.verts.push(vec.x, vec.y, vec.z));
            
            // Normals pointing generally out
            const n = new THREE.Vector3(0,0,1).applyEuler(orientation);
            for(let k=0; k<4; k++) this.leaves.normals.push(n.x, n.y, n.z);
            
            // Standard Quad UVs
            this.leaves.uvs.push(0,1, 0,0, 1,0, 1,1);
            
            this.leaves.indices.push(i, i+1, i+2, i, i+2, i+3);
            i+=4;
        };
        
        makeQuad(0);
        if(this.options.leaves.billboard === 'double') makeQuad(Math.PI/2);
    }
}
