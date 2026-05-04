
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE EMBODIED SOUL — buildGlbEntity.js
 *   ────────────────────────────────────────
 *   The Chassid descends from the GLB file —
 *   a compressed binary vessel forged in Blender,
 *   carrying within it the topology of a holy Jew:
 *   his hat, his coat, his beard, his dancing feet.
 *
 *   But before the mesh, comes the LOADING.
 *   Before the loading, comes the WAITING.
 *   And in the waiting — like the Tzaddik waiting for redemption —
 *   we place a placeholder capsule so the physics world stays happy.
 *
 *   Then the GLTFLoader speaks the word, the binary blossoms,
 *   the animations unfurl like the 248 positive commandments,
 *   and the Chassid STANDS in the world, ready to do mitzvos.
 *
 *   "And G-d breathed into his nostrils the breath of life" —
 *   the GLB loader is our neshama-breath for digital beings.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildGlbEntity
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** @constant {GLTFLoader} _LOADER - Shared loader instance (one vessel for all GLBs) */
const _LOADER = new GLTFLoader();

/**
 * @function buildGlbEntity
 * @description
 *   Loads a GLB file from `def.props.glbPath` and returns its scene root.
 *   If animations exist and `def.props.animations.autoPlay` is set,
 *   starts that animation clip automatically.
 *
 *   A dynamic capsule physics body is created at the entity's position
 *   if `def.props.physics` is defined and `isStatic` is false.
 *
 *   Falls back gracefully: if the GLB fails to load, a magenta capsule
 *   is returned so you can see WHERE the entity should be.
 *
 * @param   {THREE.Scene}   scene   - The living Three.js scene
 * @param   {Object|null}   physics - Physics world
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @returns {Promise<THREE.Object3D[]>}
 */
export async function buildGlbEntity(scene, physics, def) {
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
    root = await _loadGlb(glbPath);
  } catch (err) {
    console.error(`B"H - buildGlbEntity: ❌ Failed to load "${glbPath}":`, err);
    root = _makeFallbackCapsule();
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
  }

  // ── Physics capsule ───────────────────────────────────────────────────
  if (physics && physDef) {
    _addDynamicCapsule(physics, px, py, pz, physDef);
  }

  return [root];
}

/**
 * @function _loadGlb
 * @description
 *   Wraps GLTFLoader.load() in a Promise so we can await it.
 *   Returns the gltf.scene with animations grafted onto it.
 *
 *   "The tzaddik is the foundation of the world" — here he loads.
 *
 * @param   {string} path - URL path to the GLB file
 * @returns {Promise<THREE.Group>}
 */
function _loadGlb(path) {
  return new Promise((resolve, reject) => {
    _LOADER.load(
      path,
      (gltf) => {
        const root = gltf.scene;
        root.animations = gltf.animations || [];
        resolve(root);
      },
      (xhr) => {
        const pct = Math.round((xhr.loaded / (xhr.total || 1)) * 100);
        // B"H: silent

      },
      (err) => reject(err),
    );
  });
}

/**
 * @function _makeFallbackCapsule
 * @description
 *   When the GLB fails, we render a bright magenta capsule
 *   so the developer sees EXACTLY where the entity would be.
 *   "Even in failure, reveal the location of the soul."
 *
 * @returns {THREE.Mesh}
 */
function _makeFallbackCapsule() {
  const geo  = new THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.4, 1.6, 8, 16)
    : new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
  const mat  = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.isFallback = true;
  return mesh;
}

/**
 * @function _addDynamicCapsule
 * @description
 *   Adds a dynamic (non-static) capsule collider for the Chassid.
 *   Duck-typed for Rapier or custom addDynamicCapsule() APIs.
 *
 * @param {Object} physics
 * @param {number} x @param {number} y @param {number} z
 * @param {Object} physDef - Physics definition from nefesh props
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
