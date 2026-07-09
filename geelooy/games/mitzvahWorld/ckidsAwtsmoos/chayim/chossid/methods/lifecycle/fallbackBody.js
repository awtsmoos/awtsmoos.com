// B"H
/**
 * @file fallbackBody.js
 * @description
 * Chapter 7: The Chossid Never Becomes A Floating Black Head. The fallback body
 * remains a feature, but its hair, beard, hat, and face are anchored to a simple
 * readable silhouette for mobile. A real GLB still wins when truly visible.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { hasVisibleLivingRenderable } from '../../../../Olam/worlds/mitzvahWorld/npcs/LivingModelSanitizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const FALLBACK_NAME = 'BASIC_VISIBLE_CHOSSID_BODY';
export function ensureFallbackBody(chossid) { const host = fallbackHost(chossid); if (!host?.isObject3D) return false; const existing = host.getObjectByName?.(FALLBACK_NAME); const hasReal = hasVisibleRenderable(chossid?.modelMesh); if (hasReal) { existing?.removeFromParent?.(); return false; } const body = existing || buildFallbackBody(chossid); if (!existing) host.add(body); body.visible = true; body.position.set(0,body.userData.groundLiftY || measureFallbackGroundLift(body),0); body.rotation.set(0,0,0); body.scale.set(1,1,1); return true; }
function fallbackHost(chossid) { return chossid?.mesh?.isObject3D ? chossid.mesh : chossid?.modelMesh || null; }
export function hasVisibleRenderable(root) { return hasVisibleLivingRenderable(root); }
function material(color, rough = true) { const m = new THREE.MeshLambertMaterial({ color }); m.transparent = false; m.opacity = 1; m.depthWrite = true; m.userData.mobileStablePlayerMaterial = true; return m; }
function buildFallbackBody(chossid) {
  const body = new THREE.Group(); body.name = FALLBACK_NAME;
  body.add(
    part('BASIC_VISIBLE_CHOSSID_ROBE', new THREE.BoxGeometry(0.82, 1.35, 0.52), 0xf8f3df, 0.76),
    part('BASIC_VISIBLE_CHOSSID_TROUSERS', new THREE.BoxGeometry(0.42, 0.58, 0.38), 0x242424, 0.2),
    part('BASIC_VISIBLE_CHOSSID_HEAD', new THREE.BoxGeometry(0.42, 0.42, 0.40), 0xf0c08d, 1.52),
    part('BASIC_VISIBLE_CHOSSID_HAIR_CAP', new THREE.BoxGeometry(0.44, 0.12, 0.42), 0x2b1b10, 1.76),
    part('BASIC_VISIBLE_CHOSSID_HAT', new THREE.BoxGeometry(0.56, 0.18, 0.56), 0x2c2117, 1.94),
    part('BASIC_VISIBLE_CHOSSID_BEARD', new THREE.BoxGeometry(0.34, 0.42, 0.18), 0xc46f23, 1.25, 0, 0, -0.22)
  );
  [-.26,.26].forEach(x => body.add(part('BASIC_VISIBLE_CHOSSID_ARM', new THREE.BoxGeometry(0.18, 0.82, 0.2), 0xf8f3df, 0.78, x, 0, 0)));
  [-.18,.18].forEach(x => body.add(part('BASIC_VISIBLE_CHOSSID_LEG', new THREE.BoxGeometry(0.18, 0.76, 0.22), 0x242424, -0.22, x, 0, 0)));
  stamp(body, chossid); return body;
}
function measureFallbackGroundLift(body) { let minY = Infinity; body.updateMatrixWorld?.(true); body.traverse(child => { if (!child.geometry?.boundingBox) child.geometry?.computeBoundingBox?.(); const box = child.geometry?.boundingBox; if (!box) return; minY = Math.min(minY, child.position.y + box.min.y); }); const lift = Number.isFinite(minY) ? Math.max(0, -minY) : 0; body.userData.groundLiftY = lift; return lift; }
function stamp(root, chossid) { Object.assign(root.userData ||= {}, { isLiving:true, isPlayer:true, isPlayerFallback:true, mobileStableHead:true, skipOctree:true, noOctree:true }); root.nivraAwtsmoos = chossid; root.traverse(child => { Object.assign(child.userData ||= {}, { isLiving:true, isPlayer:true, skipOctree:true, noOctree:true }); child.frustumCulled = false; child.nivraAwtsmoos = chossid; if (child.material) { child.material.transparent = false; child.material.opacity = 1; child.material.depthWrite = true; child.material.needsUpdate = true; } }); }
function part(name, geometry, color, y, x = 0, _unused = 0, z = 0) { const mesh = new THREE.Mesh(geometry, material(color)); mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }
