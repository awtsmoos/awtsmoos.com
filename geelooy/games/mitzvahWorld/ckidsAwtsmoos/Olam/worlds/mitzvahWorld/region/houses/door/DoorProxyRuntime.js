// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

const PROXY = "AWTSMOOS_DOOR_EXPLICIT_INTERACTION_PROXY";
const HIGHLIGHT = "AWTSMOOS_DOOR_HOVER_HIGHLIGHT";

export function sealDoorPart(part, wrapper) {
  if (part?.userData?.visualOnly) return;
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
  proxy.visible = true;
  proxy.frustumCulled = false;
  sealDoorPart(proxy, wrapper);
  entry.pivot.add(proxy);
  ensureDoorHighlight(entry);
  return proxy;
}

export function ensureDoorHighlight(entry) {
  let mesh = entry?.pivot?.getObjectByName?.(HIGHLIGHT);
  if (mesh) return mesh;
  mesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.62, 3.38, 1.3),
    new THREE.MeshBasicMaterial({ color:0xffef9a, wireframe:true, transparent:true, opacity:0.95, depthWrite:false })
  );
  mesh.name = HIGHLIGHT;
  mesh.position.set(0, 1.25, 0);
  mesh.visible = false;
  mesh.frustumCulled = false;
  Object.assign(mesh.userData ||= {}, { visualOnly:true, skipRaycast:true, skipOctree:true, noOctree:true });
  entry.pivot.add(mesh);
  return mesh;
}

export function setDoorHighlight(entry, active) {
  const mesh = ensureDoorHighlight(entry);
  mesh.visible = Boolean(active);
  return mesh.visible;
}

export default { ensureDoorProxy, sealDoorPart, ensureDoorHighlight, setDoorHighlight };
