/**
 * B"H
 * @file buildGlbEntity.js
 * @description
 * The embodied soul loader now breathes through an Awtsmoos model boundary.
 * GLB/GLTF still work in browser through Three's loader, while .gltc JSON
 * descriptors and Node tests can use neutral vessels without hard binding this
 * builder to Three.js forever.
 */

import { createFallbackModel, loadModel } from '../ckidsAwtsmoos/Olam/graphics/ModelLoader.js';
import { loadThree } from '../ckidsAwtsmoos/Olam/graphics/ThreeBridge.js';

export async function buildGlbEntity(scene, physics, def) {
  const {
    glbPath = '',
    castShadow = true,
    receiveShadow = true,
    scale = [1, 1, 1],
    animations = {},
    physics: physDef,
  } = def.props || {};

  const THREE = await loadThree();
  const [px, py, pz] = def.position || [0, 0, 0];
  const [sx, sy, sz] = def.scale || scale;
  const [rx, ry, rz] = def.rotation || [0, 0, 0];

  let root;
  try {
    root = await loadModel(glbPath);
  } catch (err) {
    console.error(`B"H - buildGlbEntity: Failed to load "${glbPath}":`, err);
    root = createFallbackModel(() => makeFallbackCapsule(THREE));
  }

  root.position?.set?.(px, py, pz);
  root.rotation?.set?.(rx, ry, rz);
  root.scale?.set?.(sx, sy, sz);
  root.name = def.id;

  root.traverse?.((child) => {
    if (child.isMesh) {
      child.castShadow = castShadow;
      child.receiveShadow = receiveShadow;
    }
  });

  if (THREE && root.animations?.length && animations.autoPlay) {
    const mixer = new THREE.AnimationMixer(root);
    const clip = THREE.AnimationClip.findByName(root.animations, animations.autoPlay) || root.animations[0];
    if (clip) {
      mixer.clipAction(clip).play();
      root.userData = root.userData || {};
      root.userData.mixer = mixer;
    }
  }

  if (physics && physDef) {
    addDynamicCapsule(physics, px, py, pz, physDef);
  }

  return [root];
}

function makeFallbackCapsule(THREE) {
  if (!THREE) return createFallbackModel();
  const geo = THREE.CapsuleGeometry
    ? new THREE.CapsuleGeometry(0.4, 1.6, 8, 16)
    : new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16);
  const mat = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.isFallback = true;
  return mesh;
}

function addDynamicCapsule(physics, x, y, z, physDef) {
  const { radius = 0.4, height = 1.6, mass = 70 } = physDef;
  try {
    if (typeof physics.addDynamicCapsule === 'function') {
      physics.addDynamicCapsule({ x, y, z }, radius, height, mass);
    } else if (physics.world?.createRigidBody) {
      const R = physics.RAPIER;
      const desc = R.RigidBodyDesc.dynamic().setTranslation(x, y + height / 2, z);
      const body = physics.world.createRigidBody(desc);
      physics.world.createCollider(R.ColliderDesc.capsule(height / 2, radius), body);
    }
  } catch (e) {
    console.error('B"H - buildGlbEntity physics error:', e);
  }
}
