// B"H
import * as THREE from "/games/scripts/build/three.module.js";
import { setDoorVisualState } from "./DoorAnimationRuntime.js";
import { normalizeDoorState, saveDoorState, serialDoor } from "./DoorPersistence.js";
import { ensureDoorProxy, sealDoorPart } from "./DoorProxyRuntime.js";

const playerPosition = olam => (olam?.player || olam?.chossid)?.mesh?.position || null;
const toast = (olam, text, color = "#ffe680") => olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color, replace:true });

function dist2(a, b) {
  const dx = a.x - b.x, dy = (a.y || 0) - (b.y || 0), dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function doorEntries(root) {
  const out = [];
  root?.traverse?.(child => {
    if (child.userData?.doorHingePivot && child.userData?.doorState) out.push({ pivot:child, state:child.userData.doorState });
  });
  return out;
}

function worldPos(entry) {
  const out = new THREE.Vector3();
  return entry.pivot.getWorldPosition ? entry.pivot.getWorldPosition(out) : out.copy(entry.pivot.position);
}

export function nearestDoor(olam, root = olam?.__livingRegionCottageRoot, maxDistance = 5.6) {
  const p = playerPosition(olam);
  if (!p || !root) return null;
  let best = null, bestD = Infinity;
  for (const entry of doorEntries(root)) {
    const d = dist2(p, worldPos(entry));
    if (d < bestD) { best = entry; bestD = d; }
  }
  return best && bestD <= maxDistance * maxDistance ? best : null;
}

export function openDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state);
    if (entry.state.locked) return toast(olam, "LOCKED", "#ffcc66"), false;
    entry.state.open = true;
    setDoorVisualState(root, doorId, entry.state);
    saveDoorState(entry.state);
    toast(olam, "DOOR OPEN", "#9fffd0");
    return true;
  }
  toast(olam, "NO DOOR", "#ffd966");
  return false;
}

export function closeDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state);
    entry.state.open = false;
    setDoorVisualState(root, doorId, entry.state);
    saveDoorState(entry.state);
    toast(olam, "DOOR CLOSED", "#d8c6a3");
    return true;
  }
  toast(olam, "NO DOOR", "#ffd966");
  return false;
}

export function toggleDoor(olam, entry, root = olam?.__livingRegionCottageRoot) {
  if (!entry) return toast(olam, "NO DOOR NEARBY", "#ffd966"), false;
  normalizeDoorState(entry.state);
  return entry.state.open ? closeDoor(olam, entry.state.id, root) : openDoor(olam, entry.state.id, root);
}

export function toggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot) {
  const entry = nearestDoor(olam, root);
  return entry ? toggleDoor(olam, entry, root) : (toast(olam, "TOO FAR FROM DOOR", "#ffd966"), false);
}

export function registerDoorInteractables(olam, cottageRoot) {
  if (!Array.isArray(olam?.interactableNivrayim)) return;
  olam.__doorInteractionRegistry ||= [];
  for (const entry of doorEntries(cottageRoot)) registerEntry(olam, cottageRoot, entry);
}

function registerEntry(olam, cottageRoot, entry) {
  const wrapper = { type:"cottageDoor", name:entry.state.id, interactable:true, doorState:entry.state, ayshPeula:p => /accepted interaction|click|pointerdown/.test(p) ? toggleDoor(olam, entry, cottageRoot) : false };
  const proxy = ensureDoorProxy(entry, wrapper);
  wrapper.raycastMesh = proxy; wrapper.interactionMesh = proxy;
  entry.pivot.traverse?.(part => sealDoorPart(part, wrapper));
  if (!olam.interactableNivrayim.includes(wrapper)) olam.interactableNivrayim.push(wrapper);
  olam.__doorInteractionRegistry.push({ id:entry.state.id, proxy:proxy.name, state:serialDoor(entry.state) });
}

export function installDoorInteractionRuntime(olam, cottageRoot) {
  if (!olam || !cottageRoot) return null;
  olam.__livingRegionCottageRoot = cottageRoot; cottageRoot.userData ||= {};
  cottageRoot.userData.doorRuntimeInstalled = true; cottageRoot.userData.toggleNearestDoor = () => toggleNearestDoor(olam, cottageRoot);
  registerDoorInteractables(olam, cottageRoot);
  globalThis.__MITZVAH_DOOR_DIAG__ = () => ({ count:olam.__doorInteractionRegistry?.length || 0, doors:olam.__doorInteractionRegistry || [] });
  return cottageRoot.userData.toggleNearestDoor;
}
export default { installDoorInteractionRuntime, toggleNearestDoor, openDoor, closeDoor };
