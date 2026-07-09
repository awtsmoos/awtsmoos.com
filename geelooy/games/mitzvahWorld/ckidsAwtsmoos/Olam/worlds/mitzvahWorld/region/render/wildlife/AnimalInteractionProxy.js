// B"H
/** @file AnimalInteractionProxy.js @description Stable cheap wildlife click proxy. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

const MAT = new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false });

export function ensureAnimalInteractionProxy(root) {
  let proxy = root?.getObjectByName?.("AWTSMOOS_ANIMAL_INTERACTION_PROXY");
  if (proxy) return proxy;
  proxy = new THREE.Mesh(new THREE.CapsuleGeometry(.5, .9, 3, 7), MAT.clone());
  proxy.name = "AWTSMOOS_ANIMAL_INTERACTION_PROXY";
  proxy.position.set(0, .55, 0);
  proxy.visible = true;
  proxy.frustumCulled = false;
  proxy.nivraAwtsmoos = root;
  Object.assign(proxy.userData ||= {}, { wildlifeActor:true, animalInteractionProxy:true, selectableCombatTarget:true, combatTargetRoot:root, skipRaycast:false, skipOctree:true, noOctree:true });
  root.add(proxy);
  return proxy;
}

export default ensureAnimalInteractionProxy;
