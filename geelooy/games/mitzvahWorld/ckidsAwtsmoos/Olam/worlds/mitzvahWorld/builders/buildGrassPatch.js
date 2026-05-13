/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BLADE OF PRAISE — buildGrassPatch.js
 *   ──────────────────────────────────────────
 *   Enhanced with realistic 3D grass blade geometry.
 *   Each blade is a tapered, V-shaped mesh that catches the light.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { createGrassMaterial } from './shaders/GrassShader.js';
import { NATURE_RULES } from '../data/manifests/NatureRules.js';

export async function buildGrassPatch(scene, physics, def, olam = null) {
  const { count = 800, radius = 60 } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];

  // ── 1. Create a Realistic Grass Blade Geometry ──
  const shape = new THREE.Shape();
  shape.moveTo(-0.05, 0);
  shape.lineTo(0.05, 0);
  shape.lineTo(0.02, 0.6);
  shape.lineTo(-0.02, 0.6);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: false
  });
  geo.rotateX(Math.PI / 2); // Lay it flat so it stands up after instance rotation
  geo.translate(0, 0, 0.3); // Pivot at the base

  const mat = createGrassMaterial();
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.position.set(px, py, pz);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;

    dummy.position.set(x, 0, z);
    dummy.rotation.set(
      (Math.random() - 0.5) * 0.2, // Slight tilt
      Math.random() * Math.PI,
      0
    );
    dummy.scale.setScalar(0.4 + Math.random() * 1.2);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  if (olam?.tzimtzum) {
    const { swaySpeed = 1.0 } = NATURE_RULES.grass.animation;
    olam.tzimtzum.onUpdate((t, dt) => {
      if (mat.uniforms?.time) mat.uniforms.time.value += dt * swaySpeed;
    });
  }

  return [mesh];
}
