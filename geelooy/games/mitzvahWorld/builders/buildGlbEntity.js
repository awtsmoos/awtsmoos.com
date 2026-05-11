/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE EMBODIED SOUL — buildGlbEntity.js
 *   ────────────────────────────────────────
 *   "And G-d breathed into his nostrils the breath of life" —
 *   the GLB loader is our neshama-breath for digital beings.
 *
 *   TIKKUN: Two import fixes for blob:/Worker-safe loading:
 *     `from 'three'` → `/games/scripts/build/three.module.js`
 *     `from 'three/examples/jsm/loaders/GLTFLoader.js'`
 *       → `/games/scripts/jsm/loaders/GLTFLoader.js`
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGlbEntity
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';

/** @constant {GLTFLoader} _LOADER - Shared loader instance */
const _LOADER = new GLTFLoader();

/**
 * @function buildGlbEntity
 * @description
 *   Loads a GLB file from `def.props.glbPath` and returns its scene root.
 *   Falls back to a magenta capsule if loading fails, so spawn location is visible.
 *
 * @param   {THREE.Scene}   scene
 * @param   {Object|null}   physics
 * @param   {import('../nivrayimDefs.js').NefeshDef} def
 * @returns {Promise<THREE.Object3D[]>}
 */
export async function buildGlbEntity(scene, physics, def) {
  const {
    glbPath       = '',
    castShadow    = true,
    receiveShadow = true,
    scale         = [1, 1, 1],
    animations    = {},
    physics: physDef,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const [sx, sy, sz] = def.scale    || scale;
  const [rx, ry, rz] = def.rotation || [0, 0, 0];

  let root;

  try {
    root = await _loadGlb(glbPath);
  } catch (err) {
    console.error(`B"H - buildGlbEntity: Failed to load "${glbPath}":`, err);
    root = _makeFallbackCapsule();
  }

  root.position.set(px, py, pz);
  root.rotation.set(rx, ry, rz);
  root.scale.set(sx, sy, sz);
  root.name = def.id;

  root.traverse((child) => {
    if (child.isMesh) {
      child.castShadow    = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });

  if (root.animations?.length && animations.autoPlay) {
    const mixer = new THREE.AnimationMixer(root);
    const clip  = THREE.AnimationClip.findByName(root.animations, animations.autoPlay)
                  || root.animations[0];
    if (clip) {
      mixer.clipAction(clip).play();
      root.userData.mixer = mixer;
    }
  }

  if (physics && physDef) {
    _addDynamicCapsule(physics, px, py, pz, physDef);
  }

  return [root];
}

/**
 * @function _loadGlb
 * @description Wraps GLTFLoader.load() in a Promise.
 * @param   {string} path
 * @returns {Promise<THREE.Group>}
 */
function _loadGlb(path) {
  return new Promise((resolve, reject) => {
    _LOADER.load(
      path,
      (gltf) => {
        const root    = gltf.scene;
        root.animations = gltf.animations || [];
        resolve(root);
      },
      undefined,
      (err) => reject(err),
    );
  });
}

/**
 * @function _makeFallbackCapsule
 * @description Bright magenta capsule shown when GLB load fails.
 * @returns {THREE.Mesh}
 */
function _makeFallbackCapsule() {
  const geo  = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.4, 1.6, 8, 16)
    : new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
  const mat  = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.isFallback = true;
  return mesh;
}

/**
 * @function _addDynamicCapsule
 * @description Adds a dynamic capsule collider for the Chassid.
 * @param {Object} physics
 * @param {number} x @param {number} y @param {number} z
 * @param {Object} physDef
 * @returns {void}
 */
function _addDynamicCapsule(physics, x, y, z, physDef) {
  const { radius = 0.4, height = 1.6, mass = 70 } = physDef;
  try {
    if (typeof physics.addDynamicCapsule === 'function') {
      physics.addDynamicCapsule({ x, y, z }, radius, height, mass);
    } else if (physics.world?.createRigidBody) {
      const R    = physics.RAPIER;
      const desc = R.RigidBodyDesc.dynamic().setTranslation(x, y + height / 2, z);
      const body = physics.world.createRigidBody(desc);
      physics.world.createCollider(R.ColliderDesc.capsule(height / 2, radius), body);
    }
  } catch (e) {
    console.error('B"H - buildGlbEntity physics error:', e);
  }
}