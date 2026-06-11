// B"H
/**
 * @file visuals.js
 * @description
 * Chapter 385: Visual grounding becomes measurement, never hand lowering.
 *
 * This helper is shared by living bodies. It measures model root to lowest
 * visible vertex, stores that exact offset, and lets physics place the model at
 * collider-feet plus that measurement. No authored bias is applied here.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const ROOT_POS = new THREE.Vector3();
const MAX_REASONABLE_OFFSET = 2.4;

function measureRootToLowest(model) {
  model.updateMatrixWorld(true);
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model);
  if (!Number.isFinite(box.min.y) || box.isEmpty()) return 0;
  model.getWorldPosition(ROOT_POS);
  const offset = ROOT_POS.y - box.min.y;
  return Number.isFinite(offset) ? offset : 0;
}
function sanitize(value) { return Math.max(0, Math.min(MAX_REASONABLE_OFFSET, Number.isFinite(value) ? value : 0)); }
function sealVisualAgainstOctree(model) {
  Object.assign(model.userData ||= {}, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false });
  model.traverse(child => Object.assign(child.userData ||= {}, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true, addToOctree: false }));
}
function alignToColliderFeet(entity, model) {
  if (!entity?.collider?.start) return;
  const radius = Number(entity.collider.radius || entity.radius || 0.45);
  const feetY = entity.collider.start.y - radius;
  if (model.parent === entity.mesh) {
    model.position.set(0, Number(model.userData.visualGroundOffsetY || 0), 0);
    return;
  }
  model.position.set(entity.collider.start.x, feetY + Number(model.userData.visualGroundOffsetY || 0), entity.collider.start.z);
}

export default {
  updateDimensionsFromModel(model) {
    const targetModel = model || this.modelMesh;
    if (!targetModel?.isObject3D) return;
    sealVisualAgainstOctree(targetModel);
    const measured = sanitize(measureRootToLowest(targetModel));
    targetModel.userData.visualGroundOffsetY = measured;
    targetModel.userData.visualFootMeasurementY = measured;
    targetModel.userData.visualGroundMeasuredAt = Date.now();
    this.visualGroundBiasY = 0;
    this.visualYOffset = measured;
    alignToColliderFeet(this, targetModel);
  },

  spawnHebrewParticles(position, count = 10) {
    if (!this.olam) return;
    for (let i = 0; i < count; i += 1) {
      const letter = this.olam.randomLetter();
      const mesh = this.olam.makeNewHebrewLetter(letter, { color: this.olam.randomColor() });
      if (!mesh) continue;
      mesh.position.copy(position);
      mesh.position.y += 0.5;
      Object.assign(mesh.userData ||= {}, { skipOctree: true, addToOctree: false });
      const velocity = new THREE.Vector3((Math.random() - 0.5) * 15, Math.random() * 10 + 5, (Math.random() - 0.5) * 15);
      const rotSpeed = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      mesh.scale.setScalar(3);
      this.olam.scene.add(mesh);
      this.particles.push({ mesh, velocity, rotSpeed, life: 2 });
    }
  },

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
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
