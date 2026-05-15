// B"H
import { Particle } from './particle.js';
import { Constraint } from './constraint.js';
import { Vec3 } from '../../math/vec3.js';

export class ClothObject {
    constructor(id, renderObj, config) {
        this.id = id;
        this.renderObj = renderObj;
        this.particles = [];
        this.constraints = [];
        this.indices = renderObj.indices;
        
        // Defaults
        this.config = Object.assign({
            mass: 1.0,          // "Thickness" / Weight
            drag: 0.05,         // Air resistance / Damping
            stiffness: 1.0,     // Structural integrity
            pinFunction: null
        }, config);

        this.init();
    }

    init() {
        const pos = this.renderObj.positions;
        const particleMap = {};

        // 1. Create Particles (Welding vertices based on position)
        for (let i = 0; i < pos.length; i += 3) {
            const x = pos[i], y = pos[i+1], z = pos[i+2];
            // Key based on rounded position to identify shared vertices
            const kx = Math.round(x * 1000);
            const ky = Math.round(y * 1000);
            const kz = Math.round(z * 1000);
            const key = `${kx}_${ky}_${kz}`;
            
            let p;
            if (particleMap[key]) {
                p = particleMap[key];
            } else {
                const isPinned = this.config.pinFunction ? this.config.pinFunction(x, y, z) : false;
                p = new Particle(x, y, z, this.config.mass, this.config.drag, isPinned);
                this.particles.push(p);
                particleMap[key] = p;
            }
            // Map render vertex index to this particle
            p.renderIndices.push(i);
        }

        // 2. Create Constraints (Edges)
        const constraintSet = new Set();
        const indices = this.indices;

        const addLink = (i1, i2) => {
             const p1 = this.getParticleForIndex(i1, particleMap);
             const p2 = this.getParticleForIndex(i2, particleMap);
             if (p1 === p2) return;
             
             // Unique key for edge
             const id1 = this.particles.indexOf(p1);
             const id2 = this.particles.indexOf(p2);
             const key = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
             
             if (!constraintSet.has(key)) {
                 this.constraints.push(new Constraint(p1, p2, this.config.stiffness));
                 constraintSet.add(key);
             }
        };

        for (let i = 0; i < indices.length; i += 3) {
            addLink(indices[i], indices[i+1]);
            addLink(indices[i+1], indices[i+2]);
            addLink(indices[i+2], indices[i]);
        }

        // 3. Precompute mapping for fast normal updates
        this.riToParticle = new Array(pos.length/3);
        this.particles.forEach(p => {
             p.renderIndices.forEach(ri => this.riToParticle[ri/3] = p);
        });
        
        console.log(`B"H - ClothObject '${this.id}': ${this.particles.length} particles, ${this.constraints.length} constraints. Mass: ${this.config.mass}`);
    }

    getParticleForIndex(idx, map) {
        const i = idx * 3;
        const p = this.renderObj.positions;
        const key = `${Math.round(p[i]*1000)}_${Math.round(p[i+1]*1000)}_${Math.round(p[i+2]*1000)}`;
        return map[key];
    }

    integrate(dt) {
        this.particles.forEach(p => p.integrate(dt));
    }

    solveConstraints() {
        // Multiple iterations for stiffer cloth
        const iterations = 4;
        for (let i = 0; i < iterations; i++) {
            this.constraints.forEach(c => c.resolve());
        }
    }

    updateNormals() {
        const normBuffer = this.renderObj.normals;
        const posBuffer = this.renderObj.positions;
        
        // Reset accumulators
        this.particles.forEach(p => p.accumulatedNormal = [0,0,0]);

        // Accumulate face normals
        for (let i = 0; i < this.indices.length; i += 3) {
            const p0 = this.riToParticle[this.indices[i]];
            const p1 = this.riToParticle[this.indices[i+1]];
            const p2 = this.riToParticle[this.indices[i+2]];

            if (p0 && p1 && p2) {
                const v1 = Vec3.sub(p1.pos, p0.pos);
                const v2 = Vec3.sub(p2.pos, p0.pos);
                // Standard cross product (Triangle Normal)
                const n = Vec3.cross(v1, v2); 
                
                // Add to vertices (Weighted by area implicitly via cross product magnitude)
                p0.accumulatedNormal = Vec3.add(p0.accumulatedNormal, n);
                p1.accumulatedNormal = Vec3.add(p1.accumulatedNormal, n);
                p2.accumulatedNormal = Vec3.add(p2.accumulatedNormal, n);
            }
        }

        // Normalize and write back to buffers
        this.particles.forEach(p => {
            // Safety check for degenerate geometry
            let n = p.accumulatedNormal;
            if (n[0]===0 && n[1]===0 && n[2]===0) n = [0, 1, 0];
            else n = Vec3.normalize(n);

            p.renderIndices.forEach(idx => {
                // Update Position Buffer
                posBuffer[idx] = p.pos[0];
                posBuffer[idx+1] = p.pos[1];
                posBuffer[idx+2] = p.pos[2];

                // Update Normal Buffer
                normBuffer[idx] = n[0];
                normBuffer[idx+1] = n[1];
                normBuffer[idx+2] = n[2];
            });
        });
        
        // Flag for WebGL update
        this.renderObj.dirty = true;
    }
}