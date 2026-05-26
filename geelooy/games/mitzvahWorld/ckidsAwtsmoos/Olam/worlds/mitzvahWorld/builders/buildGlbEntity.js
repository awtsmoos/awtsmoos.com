/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE EMBODIED SOUL — buildGlbEntity.js
 *   ────────────────────────────────────────
 *   The Chassid descends from the GLB file —
 *   a compressed binary vessel forged in Blender,
 *   carrying within it the topology of a holy Jew.
 *
 *   This orchestrator uses the modular fragments:
 *     - GlbLoader: To fetch the data
 *     - GlbFallback: To provide mercy in failure
 *     - GlbPhysics: To forge the physical boundaries
 *
 *   "And G-d breathed into his nostrils the breath of life" —
 *   the GLB loader is our neshama-breath for digital beings.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGlbEntity
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { loadGlb }            from './glb/GlbLoader.js';
import { makeFallbackCapsule } from './glb/GlbFallback.js';
import { addDynamicCapsule }  from './glb/GlbPhysics.js';

/**
 * @function buildGlbEntity
 * @description
 *   Loads a GLB file and returns its scene root.
 *   Uses modular sub-systems for loading, fallbacks, and physics.
 *
 * @param   {THREE.Scene}   scene   - The living Three.js scene
 * @param   {Object|null}   physics - Physics world
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @param   {Object|null}   olam    - Olam context
 * @returns {Promise<THREE.Object3D[]>}
 */
export async function buildGlbEntity(scene, physics, def, olam = null) {
  const {
    glbPath     = '',
    castShadow  = true,
    receiveShadow = true,
    scale       = [1, 1, 1],
    animations  = {},
    physics: physDef,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const [sx, sy, sz] = def.scale   || scale;
  const [rx, ry, rz] = def.rotation || [0, 0, 0];

  let root;

  try {
    const sourceRoot = await loadGlb(glbPath);
    root = sourceRoot.clone(true);
    root.animations = sourceRoot.animations || [];
  } catch (err) {
    console.error(`B"H - buildGlbEntity: ❌ Failed to load "${glbPath}":`, err);
    root = makeFallbackCapsule();
  }

  root.position.set(px, py, pz);
  root.rotation.set(rx, ry, rz);
  root.scale.set(sx, sy, sz);
  root.name = def.id;

  // Apply shadow settings recursively
  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });

  // ── Animations ────────────────────────────────────────────────────────
  if (root.animations?.length && animations.autoPlay) {
    const mixer = new THREE.AnimationMixer(root);
    const clip  = THREE.AnimationClip.findByName(root.animations, animations.autoPlay)
                  || root.animations[0];
    if (clip) {
      mixer.clipAction(clip).play();
      root.userData.mixer = mixer;
    }
    
    // Register for updates
    if (olam?.tzimtzum) {
      olam.tzimtzum.onUpdate((t, delta) => {
        mixer.update(delta);
      });
    }
  }

  // ── Physics capsule ───────────────────────────────────────────────────
  if (physics && physDef) {
    addDynamicCapsule(physics, px, py, pz, physDef);
  }

  return [root];
}

export default buildGlbEntity;
