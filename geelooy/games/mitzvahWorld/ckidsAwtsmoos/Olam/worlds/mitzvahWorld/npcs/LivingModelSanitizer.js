// B"H
/**
 * @file LivingModelSanitizer.js
 * @description
 * Chapter 641: One living body, one visible covenant.
 *
 * The Awtsmoos speaks existence into every mesh, but a game avatar must not
 * become a crowded choir of cameras, invisible carriers, old ray boxes, and
 * duplicate fallback robes. This module is the quiet shamash at the door: it
 * trims non-body nodes, stamps living metadata, clones materials so NPCs stop
 * bleeding colors into each other, and judges visibility by what the player
 * can actually see rather than by the mere presence of geometry.
 */

const HIDDEN_NODE_NAMES = new Set([
  "Camera",
  "Camera.001",
  "NurbsPath",
  "Plane.001",
  "Plane.002",
  "teeth",
  "tooth-distance"
]);

const HIDDEN_MATERIAL_NAMES = new Set(["teffilinStrap"]);
const CARRIER_NAMES = new Set(["NPC_INVISIBLE_CARRIER", "GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY"]);

/** @param {object} material Candidate material. @returns {boolean} True when material draws. */
export function isDrawableMaterial(material) {
  if (!material) return false;
  if (material.visible === false) return false;
  if (Number(material.opacity) === 0) return false;
  return true;
}

/** @param {object} node Scene node. @returns {boolean} True when node is intentionally hidden. */
export function shouldHideLivingNode(node) {
  if (!node) return false;
  if (CARRIER_NAMES.has(node.name)) return true;
  if (node.userData?.awtsmoosRayProxy || node.userData?.isPlayerFallback) return true;
  for (let current = node; current; current = current.parent) {
    if (HIDDEN_NODE_NAMES.has(current.name)) return true;
  }
  const material = Array.isArray(node.material) ? node.material[0] : node.material;
  return HIDDEN_MATERIAL_NAMES.has(material?.name || "");
}

/** @param {object} root Object3D tree. @returns {boolean} True when visible renderable body exists. */
export function hasVisibleLivingRenderable(root) {
  let found = false;
  root?.traverse?.(child => {
    if (found || (!child?.isMesh && !child?.isSkinnedMesh)) return;
    if (child.visible === false || shouldHideLivingNode(child)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    if (!materials.some(isDrawableMaterial)) return;
    const count = child.geometry?.attributes?.position?.count || child.geometry?.index?.count || 0;
    if (count > 0) found = true;
  });
  return found;
}

/** @param {object} material Material or material array. @returns {object} Cloned material tree. */
export function cloneLivingMaterial(material) {
  if (Array.isArray(material)) return material.map(cloneLivingMaterial);
  return material?.clone ? material.clone() : material;
}

/** @param {object} root Object3D tree. @param {object} flags Metadata to apply. @returns {object} Same root. */
export function sanitizeLivingModelTree(root, flags = {}) {
  root?.traverse?.(child => {
    child.userData ||= {};
    Object.assign(child.userData, { isLiving: true, skipOctree: true, noOctree: true }, flags);
    if (shouldHideLivingNode(child)) child.visible = false;
    if (!child?.isMesh && !child?.isSkinnedMesh) return;
    if (child.material) child.material = cloneLivingMaterial(child.material);
    child.castShadow = false;
    child.receiveShadow = true;
    child.frustumCulled = flags.isNpc === true;
  });
  return root;
}
