// B"H
import * as THREE from "/games/scripts/build/three.module.js";

const PROXY = "AWTSMOOS_DOOR_EXPLICIT_INTERACTION_PROXY";

export function sealDoorPart(part, wrapper) {
  part.nivraAwtsmoos = wrapper;
  Object.assign(part.userData ||= {}, {
    doorClickTarget:true,
    skipRaycast:false,
    skipOctree:true,
    noOctree:true,
    interactionLayer:"explicit-interaction",
    addToOctree:false
  });
}

export function ensureDoorProxy(entry, wrapper) {
  let proxy = entry.pivot.getObjectByName?.(PROXY);
  if (proxy) return proxy;
  proxy = new THREE.Mesh(
    new THREE.BoxGeometry(2.25, 3.1, 1.15),
    new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })
  );
  proxy.name = PROXY;
  proxy.position.set(0, 1.25, 0);
  proxy.visible = false;
  proxy.frustumCulled = false;
  sealDoorPart(proxy, wrapper);
  entry.pivot.add(proxy);
  return proxy;
}

export default { ensureDoorProxy, sealDoorPart };
