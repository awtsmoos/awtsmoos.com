// B"H
/**
 * @file visuals.js
 * @description
 * Chapter 17: The Eye Stopped Pretending To Be A Collider.
 *
 * The Awtsmoos lets a GLB be measured, sealed from the octree, and visually
 * lifted by its actual foot offset. Measurement never mutates height, radius,
 * capsule start, capsule end, or collider radius.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const ROOT_POS = new THREE.Vector3();
const MIN_LIFT = 0;
const MAX_LIFT = 0.7;

/**
 * Measures the visual foot lift from the model root to the lowest vertex.
 *
 * @param {THREE.Object3D} targetModel Visual model root.
 * @returns {number} Positive visual lift.
 */
function measureVisualFootLift(targetModel) {
    targetModel.updateMatrixWorld(true);
    targetModel.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(targetModel);
    if (!Number.isFinite(box.min.y) || box.isEmpty()) return 0;
    targetModel.getWorldPosition(ROOT_POS);
    const lift = ROOT_POS.y - box.min.y;
    return Number.isFinite(lift) ? lift : 0;
}

/**
 * Marks a model hierarchy as decorative player visual matter.
 *
 * @param {THREE.Object3D} model Visual model root.
 * @returns {void}
 */
function sealVisualAgainstOctree(model) {
    model.userData ||= {};
    Object.assign(model.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
    model.traverse(child => {
        child.userData ||= {};
        Object.assign(child.userData, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
    });
}

/** @param {number} value Number. @param {number} min Min. @param {number} max Max. @returns {number} */
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

export default {
    /**
     * Stores visual-only lift from real model measurement plus optional bias.
     *
     * @param {THREE.Object3D} [model] Optional visual model to measure.
     * @returns {void}
     */
    updateDimensionsFromModel(model) {
        const targetModel = model || this.modelMesh;
        if (!targetModel?.isObject3D) return;
        sealVisualAgainstOctree(targetModel);
        const measured = measureVisualFootLift(targetModel);
        const bias = Number(this.visualGroundBiasY ?? this.originalOptions?.visualGroundBiasY ?? 0);
        const lift = measured + (Number.isFinite(bias) ? bias : 0);
        targetModel.userData.visualGroundOffsetY = clamp(Number.isFinite(lift) ? lift : measured, MIN_LIFT, MAX_LIFT);
        this.visualYOffset = -targetModel.userData.visualGroundOffsetY;
    },

    /**
     * Releases Hebrew-letter sparks from a point in space.
     *
     * @param {THREE.Vector3} position Origin of the sparks.
     * @param {number} [count=10] Number of sparks.
     * @returns {void}
     */
    spawnHebrewParticles(position, count = 10) {
        if (!this.olam) return;
        for (let i = 0; i < count; i++) {
            const letter = this.olam.randomLetter();
            const mesh = this.olam.makeNewHebrewLetter(letter, { color: this.olam.randomColor() });
            if (!mesh) continue;
            mesh.position.copy(position);
            mesh.position.y += 0.5;
            mesh.userData.skipOctree = true;
            mesh.userData.addToOctree = false;
            const velocity = new THREE.Vector3((Math.random() - 0.5) * 15, (Math.random() * 10) + 5, (Math.random() - 0.5) * 15);
            const rotSpeed = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            mesh.scale.setScalar(3.0);
            this.olam.scene.add(mesh);
            this.particles.push({ mesh, velocity, rotSpeed, life: 2.0 });
        }
    },

    /**
     * Advances decorative particles. These are never collision bodies.
     *
     * @param {number} dt Frame delta.
     * @returns {void}
     */
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
