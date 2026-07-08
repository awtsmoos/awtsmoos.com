// B"H
/**
 * @file buildGlbEntity.js
 * @description Loads GLB entities with fallback, animation, shadows, and physics through parser-clear vessels.
 */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { loadGlb } from "./glb/GlbLoader.js?compact=true&v=awtsmoos-glb-loader-20260614-bh2";
import { makeFallbackCapsule } from "./glb/GlbFallback.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { addDynamicCapsule } from "./glb/GlbPhysics.js?compact=true&v=awtsmoos-glb-physics-20260614-bh2";
function propsOf(def) { return def && def.props ? def.props : {}; }
function triple(value, fallback) { return Array.isArray(value) ? value : fallback; }
function registerAnimation(olam, mixer) { if (olam && olam.tzimtzum && typeof olam.tzimtzum.onUpdate === "function") olam.tzimtzum.onUpdate((t, delta) => mixer.update(delta)); }
function applyShadows(root, castShadow, receiveShadow) { if (!root || typeof root.traverse !== "function") return; root.traverse(child => { if (child.isMesh) { child.castShadow = castShadow; child.receiveShadow = receiveShadow; } }); }
function animationsOf(root) { return root && Array.isArray(root.animations) ? root.animations : []; }
function chooseClip(root, name) { const animations = animationsOf(root); return THREE.AnimationClip.findByName(animations, name) || animations[0] || null; }
function startAnimation(root, animations, olam) { if (!animations || !animations.autoPlay || !animationsOf(root).length) return; const mixer = new THREE.AnimationMixer(root); const clip = chooseClip(root, animations.autoPlay); if (!clip) return; mixer.clipAction(clip).play(); if (!root.userData) root.userData = {}; root.userData.mixer = mixer; registerAnimation(olam, mixer); }
export async function buildGlbEntity(scene, physics, def, olam = null) {
  const props = propsOf(def), glbPath = props.glbPath || "", castShadow = props.castShadow !== false, receiveShadow = props.receiveShadow !== false;
  const scale = triple(props.scale, [1,1,1]), position = triple(def.position, [0,0,0]), defScale = triple(def.scale, scale), rotation = triple(def.rotation, [0,0,0]);
  let root;
  try { const sourceRoot = await loadGlb(glbPath); root = sourceRoot.clone(true); root.animations = sourceRoot.animations || []; }
  catch (error) { console.error(`B"H - buildGlbEntity: failed to load ${glbPath}`, error); root = makeFallbackCapsule(); root.animations = []; }
  root.position.set(position[0], position[1], position[2]); root.rotation.set(rotation[0], rotation[1], rotation[2]); root.scale.set(defScale[0], defScale[1], defScale[2]); root.name = def.id || "glb_entity";
  applyShadows(root, castShadow, receiveShadow); startAnimation(root, props.animations || {}, olam);
  if (physics && props.physics) addDynamicCapsule(physics, position[0], position[1], position[2], props.physics);
  return [root];
}
export default buildGlbEntity;
