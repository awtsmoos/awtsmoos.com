/**
 * B"H
 * @file visuals.js
 * Handles appearance, dimensions, and particle effects (sparks of holiness).
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    updateDimensionsFromModel(model) {
        if (model || !this.modelMesh) return;

        // Calculate the bounding box of the visual model
        const box = new THREE.Box3().setFromObject(model || this.modelMesh);
        const size = new THREE.Vector3();
        box.getSize(size);

        // Update the height and radius based on the model's dimensions
        this.height = size.y * 0.95; 
        this.radius = Math.max(size.x, size.z) / 2 * 0.8;
    },

    spawnHebrewParticles(position, count = 10) { // B"H: Increased count
        if (!this.olam) return;
        
        for (let i = 0; i < count; i++) {
            const letter = this.olam.randomLetter();
            const mesh = this.olam.makeNewHebrewLetter(letter, { 
                color: this.olam.randomColor() 
            });
            
            if (!mesh) continue;

            mesh.position.copy(position);
            // Offset slightly so they don't spawn inside the block
            mesh.position.y += 0.5; 
            
            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 15, // B"H: Bigger explosion
                (Math.random() * 10) + 5, 
                (Math.random() - 0.5) * 15
            );

            const rotSpeed = new THREE.Vector3(
                Math.random() - 0.5, 
                Math.random() - 0.5, 
                Math.random() - 0.5
            );

            // Make them bigger and shiny
            mesh.scale.setScalar(3.0); // B"H: Bigger letters
            if(mesh.material) {
                mesh.material.emissive = new THREE.Color(0xffaa00);
                mesh.material.emissiveIntensity = 0.8;
            }

            this.olam.scene.add(mesh);
            
            this.particles.push({
                mesh,
                velocity,
                rotSpeed,
                life: 2.0 
            });
        }
    },

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            
            if (p.life <= 0) {
                p.mesh.removeFromParent();
                this.particles.splice(i, 1);
                continue;
            }

            p.velocity.y -= 20 * dt; // Gravity
            p.mesh.position.addScaledVector(p.velocity, dt);
            p.mesh.rotation.x += p.rotSpeed.x;
            p.mesh.rotation.y += p.rotSpeed.y;
            p.mesh.rotation.z += p.rotSpeed.z;
            
            const scale = p.life * 3.0; 
            p.mesh.scale.setScalar(scale); 
        }
    },

    updateBlockHighlight() {
        // 1. Cleanup previous highlight
        if (this.currentHighlighted) {
            const mesh = this.currentHighlighted;
            
            const restoreMat = (mat, saved) => {
                if (mat && saved && mat.emissive) {
                    mat.emissive.copy(saved);
                }
            };

            if (Array.isArray(mesh.material) && Array.isArray(mesh.savedEmissives)) {
                mesh.material.forEach((m, i) => {
                    if(mesh.savedEmissives[i]) restoreMat(m, mesh.savedEmissives[i]);
                });
            } else if (mesh.material && mesh.savedEmissive) {
                restoreMat(mesh.material, mesh.savedEmissive);
            }
            
            this.currentHighlighted = null;
            this.currentHighlightedSavedEmissives = null;
        }

        if (!this.activeRay) return;

        const item = this.getActiveItem();
        if (!item || item.className !== 'Tool') return;

        const origin = this.getRayStart();
        const direction = this.getRayDirection();
        const ray = new THREE.Ray(origin, direction);

        const hit = this.olam.worldOctree.rayIntersect(ray);

        if (hit && hit.distance < 15 && hit.object) {
            let visualMesh = hit.object;

            if (visualMesh.userData && visualMesh.userData.visualReference) {
                visualMesh = visualMesh.userData.visualReference;
            }

            if (visualMesh.userData && visualMesh.userData.itemData && visualMesh.userData.itemData.id === "world_brick") {
                return;
            }

            if (!visualMesh.isMesh || !visualMesh.material) return;

            this.currentHighlighted = visualMesh;
            
            const highlightMat = (mat) => {
                if (mat && mat.emissive) {
                    return mat.emissive.clone();
                }
                return null;
            };

            if (Array.isArray(visualMesh.material)) {
                if (!visualMesh.savedEmissives) {
                    visualMesh.savedEmissives = visualMesh.material.map(highlightMat);
                }
                visualMesh.material.forEach(m => {
                    if(m.emissive) m.emissive.setHex(0xff0000);
                });
            } else {
                if (!visualMesh.savedEmissive) {
                    visualMesh.savedEmissive = highlightMat(visualMesh.material);
                }
                if (visualMesh.material.emissive) {
                    visualMesh.material.emissive.setHex(0xff0000);
                }
            }
        }
    }
};