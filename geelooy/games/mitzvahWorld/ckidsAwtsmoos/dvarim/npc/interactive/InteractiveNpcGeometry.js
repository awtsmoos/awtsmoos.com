// B"H
/**
 * @file InteractiveNpcGeometry.js
 * @description
 * Geometry helpers for NPC interaction. The Awtsmoos hides the invisible
 * carrier and reveals only the intentional ray vessel.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export function positionOf(entity) {
  return entity?.mesh?.position
    || entity?.modelMesh?.position
    || entity?.guf?.position
    || entity?.player?.mesh?.position
    || null;
}

export function guideCarrierGolem() {
  return {
    name: "NPC_INVISIBLE_CARRIER",
    guf: { BoxGeometry: [0.01, 0.01, 0.01] },
    toyr: {
      MeshBasicMaterial: {
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false
      }
    }
  };
}

export function makeRayProxy(nivra) {
  const geometry = new THREE.BoxGeometry(3.4, 3.6, 3.4);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false
  });
  const mesh = new THREE.Mesh(geometry, material);

  mesh.name = "GUIDE_EXPLICIT_TAP_COLLIDER_RAYCAST_ONLY";
  mesh.position.set(0, 1.25, 0);
  mesh.nivraAwtsmoos = nivra;
  Object.assign(mesh.userData, {
    awtsmoosRayProxy: true,
    explicitTapOnly: true,
    skipRaycast: false,
    skipOctree: true,
    noOctree: true
  });

  return mesh;
}
