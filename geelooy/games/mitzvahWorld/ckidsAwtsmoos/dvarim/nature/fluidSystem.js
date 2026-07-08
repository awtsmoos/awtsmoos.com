
// B"H
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * FluidSystem
 * Voxel-based cellular automata water.
 */
export default class FluidSystem {
    constructor(olam) {
        this.olam = olam;
        this.particles = [];
        this.maxParticles = 2000;
        this.dropRate = 0.05;
        this.raycaster = new THREE.Raycaster();
        this.down = new THREE.Vector3(0, -1, 0);
        
        // Instanced Mesh for Water
        const geo = new THREE.IcosahedronGeometry(0.3, 1);
        const mat = new THREE.MeshPhysicalMaterial({
            color: 0x00aaff,
            transmission: 0.9,
            opacity: 0.8,
            metalness: 0.1,
            roughness: 0.0,
            ior: 1.33,
            thickness: 1.0,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.InstancedMesh(geo, mat, this.maxParticles);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.olam.scene.add(this.mesh);
        
        this.olam.on("heesHawvoos", (dt) => this.update(dt));
    }

    addWater(position, volume = 1.0) {
        // Find empty slot
        let idx = this.particles.findIndex(p => !p.active);
        if (idx === -1 && this.particles.length < this.maxParticles) {
            idx = this.particles.length;
            this.particles.push({ active: false });
        }
        
        if (idx !== -1) {
            const p = this.particles[idx];
            p.active = true;
            p.position = position.clone();
            p.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            p.volume = volume;
            p.settled = false;
        }
    }

    update(dt) {
        if (!this.olam.worldOctree) return;
        
        const dummy = new THREE.Object3D();
        let activeCount = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            if (!p.active) {
                // Move offscreen
                dummy.position.set(0, -99999, 0);
                dummy.updateMatrix();
                this.mesh.setMatrixAt(i, dummy.matrix);
                continue;
            }

            activeCount++;

            // Physics
            if (!p.settled) {
                p.velocity.y -= 30.0 * dt; // Gravity
                p.position.addScaledVector(p.velocity, dt);

                // Collision / Ground Check
                this.raycaster.set(p.position.clone().add(new THREE.Vector3(0, 1, 0)), this.down);
                const hit = this.olam.worldOctree.rayIntersect(this.raycaster.ray);

                if (hit && hit.distance < 1.0) {
                    // Hit ground
                    p.position.y = hit.point.y + 0.3;
                    p.velocity.set(0, 0, 0);
                    
                    // Flow Logic: Check neighbors
                    const neighbors = [
                        new THREE.Vector3(1, 0, 0),
                        new THREE.Vector3(-1, 0, 0),
                        new THREE.Vector3(0, 0, 1),
                        new THREE.Vector3(0, 0, -1)
                    ];
                    
                    let moved = false;
                    // Shuffle to prevent bias
                    neighbors.sort(() => Math.random() - 0.5);

                    for (const offset of neighbors) {
                        const checkPos = p.position.clone().add(offset);
                        this.raycaster.set(checkPos.add(new THREE.Vector3(0, 2, 0)), this.down);
                        const nHit = this.olam.worldOctree.rayIntersect(this.raycaster.ray);
                        
                        if (nHit && nHit.point.y < p.position.y - 0.1) {
                            // Found a lower point, flow there
                            // Lerp for smooth visual
                            const dir = new THREE.Vector3().subVectors(nHit.point, p.position).normalize();
                            p.velocity.add(dir.multiplyScalar(5.0)); // Push downhill
                            moved = true;
                            break;
                        }
                    }

                    if (!moved) {
                        // Settle into a pool
                        p.settled = true;
                        // Spread out slightly to look like a puddle
                        p.scale = 1.0 + (p.volume * 0.5);
                    }
                }
            } else {
                // If settled, maybe evaporate or seep?
                if (Math.random() < 0.001) p.active = false;
            }

            dummy.position.copy(p.position);
            const s = p.scale || 1.0;
            // Flatten if settled
            if (p.settled) dummy.scale.set(s, 0.2, s);
            else dummy.scale.set(0.5, 0.5, 0.5);
            
            dummy.updateMatrix();
            this.mesh.setMatrixAt(i, dummy.matrix);
        }
        
        this.mesh.count = this.particles.length;
        this.mesh.instanceMatrix.needsUpdate = true;
    }
}
