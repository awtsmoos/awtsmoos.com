// B"H
/**
 * @file fallbackBody.js
 * @description
 * Chapter 6: The Chossid Never Vanishes From The Wall.
 *
 * The Awtsmoos revealed the exact danger: `modelMesh` may exist while carrying
 * no visible renderable garment. Existence is not visibility. This fallback now
 * asks the scene graph whether a real mesh can be seen; if not, a simple body is
 * attached to the moving player root so it follows physics no matter what the
 * remote GLB does.
 */
import * as THREE from '/games/scripts/build/three.module.js';

const FALLBACK_NAME = 'BASIC_VISIBLE_CHOSSID_BODY';

/**
 * Ensures the player has either a visible GLB garment or a visible fallback.
 *
 * @param {object} chossid Player entity.
 * @returns {boolean} True when fallback is visible.
 */
export function ensureFallbackBody(chossid) {
  const host = fallbackHost(chossid);
  if (!host?.isObject3D) return false;
  const existing = host.getObjectByName?.(FALLBACK_NAME);
  const hasReal = hasVisibleRenderable(chossid?.modelMesh);
  if (hasReal) {
    existing?.removeFromParent?.();
    return false;
  }
  const body = existing || buildFallbackBody(chossid);
  if (!existing) host.add(body);
  body.visible = true;
  body.position.set(0, 0, 0);
  body.rotation.set(0, 0, 0);
  body.scale.set(1, 1, 1);
  return true;
}

/** @param {object} chossid Player. @returns {THREE.Object3D|null} Moving host. */
function fallbackHost(chossid) {
  return chossid?.mesh?.isObject3D ? chossid.mesh : chossid?.modelMesh || null;
}

/** @param {THREE.Object3D|null} root Model root. @returns {boolean} Visible mesh exists. */
export function hasVisibleRenderable(root) {
  let found = false;
  root?.traverse?.(child => {
    if (found || !child?.isMesh) return;
    if (child.visible === false) return;
    const material = Array.isArray(child.material) ? child.material[0] : child.material;
    if (material?.visible === false || material?.opacity === 0) return;
    const geometry = child.geometry;
    if (!geometry) return;
    const count = geometry.attributes?.position?.count || geometry.index?.count || 0;
    if (count > 0) found = true;
  });
  return found;
}

/** @param {object} chossid Player entity. @returns {THREE.Group} Fallback body. */
function buildFallbackBody(chossid) {
  const body = new THREE.Group();
  body.name = FALLBACK_NAME;
  body.add(
    part('BASIC_VISIBLE_CHOSSID_ROBE', new THREE.BoxGeometry(0.85, 1.45, 0.55), 0x1f6fff, 0.8),
    part('BASIC_VISIBLE_CHOSSID_HEAD', new THREE.BoxGeometry(0.45, 0.45, 0.45), 0xf1d0a8, 1.75),
    part('BASIC_VISIBLE_CHOSSID_HAT', new THREE.BoxGeometry(0.65, 0.22, 0.65), 0x111111, 2.08)
  );
  stamp(body, chossid);
  return body;
}

/** @param {THREE.Object3D} root Tree. @param {object} chossid Player. */
function stamp(root, chossid) {
  Object.assign(root.userData ||= {}, { isLiving: true, isPlayer: true, isPlayerFallback: true, skipOctree: true, noOctree: true });
  root.nivraAwtsmoos = chossid;
  root.traverse(child => {
    Object.assign(child.userData ||= {}, { isLiving: true, isPlayer: true, skipOctree: true, noOctree: true });
    child.frustumCulled = false;
    child.nivraAwtsmoos = chossid;
  });
}

/** @returns {THREE.Mesh} Visible fallback mesh part. */
function part(name, geometry, color, y) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color }));
  mesh.name = name;
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}
