// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { PHYSICS_CONSTANTS } from './physics/physicsConstants.js';
 
export default {
 
    /**
     * @method updateDimensionsFromModel
     * @description
     * Captures the physical extent of the loaded GLB mesh relative to its pivot.
     */
    updateDimensionsFromModel(model) {
        const targetModel = model || this.modelMesh;
        if (!targetModel) return;

        // 1. THE REVELATION OF MATRICES
        // B"H FIX: We MUST update the world matrix, otherwise the bounding box 
        // will measure the un-scaled, un-positioned original state!
        targetModel.updateMatrixWorld(true);
        targetModel.updateWorldMatrix(true, true);
 
        // 2. THE WEIGHING
        const box = new THREE.Box3().setFromObject(targetModel);
        const size = new THREE.Vector3();
        box.getSize(size);
 
        if (
            !isFinite(size.y) || size.y === 0 ||
            !isFinite(box.min.y) || !isFinite(box.max.y)
        ) {
            console.warn(`B"H - ⚠️ Degenerate measurement for [${this.name}]. Reality is distorted.`);
            return;
        }
 
        // Update local dimensions
        this.height = size.y;
        this.radius = Math.max(size.x, size.z) / 2 * 0.8;
 
        // Safety: Radius cannot exceed half the height
        if (this.radius > this.height / 2) {
            this.radius = this.height / 2;
        }

        // B"H: THE RADIUS CAP TIKKUN
        // Prevents stray vertices in GLB models from creating giant invisible walls!
        // A human soul's physical width should never exceed 0.6 units in this realm.
        if (this.radius > PHYSICS_CONSTANTS.MAX_RADIUS_CAP) {
            this.radius = PHYSICS_CONSTANTS.MAX_RADIUS_CAP;
        }
 
        /**
         * B"H: THE TRUE LOCAL OFFSET (visualYOffset)
         * We measure how far the bottom of the model (feet) is from its pivot (center).
         * This is essential for sticking the feet to the floor later.
         */
        const worldPivotY = new THREE.Vector3();
        targetModel.getWorldPosition(worldPivotY);
        this.visualYOffset = box.min.y - worldPivotY.y;
 
        if (this.collider) {
            this.collider.radius = this.radius;
            // The ends of the internal physics capsule
            const centerDistance = Math.max(0.1, this.height - (this.radius * 2));
 
            this.collider.end.set(
                this.collider.start.x,
                this.collider.start.y + centerDistance,
                this.collider.start.z
            );
 
            // B"H: silent

        }
 
        if (!this.boundingBoxHelper) {
            this.boundingBoxHelper = new THREE.Box3Helper(box.clone(), 0xff0000);
            if (this.olam && this.olam.scene) {
                this.olam.scene.add(this.boundingBoxHelper);
            }
        } else {
            this.boundingBoxHelper.box.copy(box);
        }
    },
 
    spawnHebrewParticles(position, count = 10) {
        if (!this.olam) return;
        for (let i = 0; i < count; i++) {
            const letter = this.olam.randomLetter();
            const mesh = this.olam.makeNewHebrewLetter(letter, { color: this.olam.randomColor() });
            if (!mesh) continue;
            mesh.position.copy(position);
            mesh.position.y += 0.5;
            const velocity = new THREE.Vector3((Math.random()-0.5)*15, (Math.random()*10)+5, (Math.random()-0.5)*15);
            const rotSpeed = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5);
            mesh.scale.setScalar(3.0);
            this.olam.scene.add(mesh);
            this.particles.push({ mesh, velocity, rotSpeed, life: 2.0 });
        }
    },
 
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) { p.mesh.removeFromParent(); this.particles.splice(i, 1); continue; }
            p.velocity.y -= 9.8 * dt;
            p.mesh.position.addScaledVector(p.velocity, dt);
            p.mesh.rotation.x += p.rotSpeed.x * dt * 3;
            p.mesh.rotation.y += p.rotSpeed.y * dt * 3;
            p.mesh.rotation.z += p.rotSpeed.z * dt * 3;
        }
    }
};
