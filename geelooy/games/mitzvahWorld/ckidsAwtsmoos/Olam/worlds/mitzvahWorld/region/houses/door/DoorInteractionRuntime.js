// B"H
/**
 * @file DoorInteractionRuntime.js
 * @description
 * Cottage doors get their own explicit raycast wrappers. The Awtsmoos removes
 * huge phantom house collision while keeping the door click alive and visible.
 */
import { patchWorldState, readWorldState } from "../../../../../../systems/worldState/WorldStateStore.js";
import { setDoorVisualState } from "./DoorAnimationRuntime.js";

function playerPosition(olam) {
  return (olam?.player || olam?.chossid)?.mesh?.position || null;
}

function dist2(a, b) {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}

function toast(olam, message, color = "#ffe680") {
  olam?.ayshPeula?.("ui event", "effectsOverlay", { text: message, color });
}

function doorEntries(root) {
  const out = [];
  root?.traverse?.(child => {
    if (child.userData?.doorHingePivot && child.userData?.doorState) {
      out.push({ pivot: child, state: child.userData.doorState });
    }
  });
  return out;
}

function worldPos(entry) {
  const out = entry.pivot.position.clone();
  return entry.pivot.getWorldPosition ? entry.pivot.getWorldPosition(out) : out;
}

function sealDoorPart(part, wrapper) {
  part.nivraAwtsmoos = wrapper;
  Object.assign(part.userData ||= {}, {
    doorClickTarget: true,
    skipRaycast: false,
    skipOctree: true,
    noOctree: true
  });
}

export function nearestDoor(olam, root = olam?.__livingRegionCottageRoot) {
  const p = playerPosition(olam);
  if (!p || !root) return null;
  let best = null;
  let bestD = Infinity;
  for (const entry of doorEntries(root)) {
    const d = dist2(p, worldPos(entry));
    if (d < bestD) { best = entry; bestD = d; }
  }
  return best && bestD < 25 ? best : null;
}

export function openDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) {
    if (entry.state.id !== doorId) continue;
    if (entry.state.locked) return toast(olam, "LOCKED", "#ffcc66"), false;
    entry.state.open = true;
    setDoorVisualState(root, doorId, entry.state);
    patchWorldState(olam, `doors.${doorId}`, entry.state);
    toast(olam, "DOOR OPEN", "#9fffd0");
    return true;
  }
  return false;
}

export function closeDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) {
    if (entry.state.id !== doorId) continue;
    entry.state.open = false;
    setDoorVisualState(root, doorId, entry.state);
    patchWorldState(olam, `doors.${doorId}`, entry.state);
    toast(olam, "DOOR CLOSED", "#d8c6a3");
    return true;
  }
  return false;
}

export function toggleDoor(olam, entry, root = olam?.__livingRegionCottageRoot) {
  if (!entry) return toast(olam, "NO DOOR", "#ffd966"), false;
  const saved = readWorldState(olam, `doors.${entry.state.id}`, entry.state);
  Object.assign(entry.state, saved);
  return entry.state.open ? closeDoor(olam, entry.state.id, root) : openDoor(olam, entry.state.id, root);
}

export function toggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot) {
  return toggleDoor(olam, nearestDoor(olam, root), root);
}

export function registerDoorInteractables(olam, cottageRoot) {
  if (!Array.isArray(olam?.interactableNivrayim)) return;
  for (const entry of doorEntries(cottageRoot)) {
    const wrapper = {
      type: "cottageDoor",
      name: entry.state.id,
      interactable: true,
      raycastMesh: entry.pivot,
      ayshPeula(peula) {
        if (peula === "accepted interaction" || peula === "click") return toggleDoor(olam, entry, cottageRoot);
        return false;
      }
    };
    entry.pivot.traverse?.(part => sealDoorPart(part, wrapper));
    olam.interactableNivrayim.push(wrapper);
  }
}

export function installDoorInteractionRuntime(olam, cottageRoot) {
  if (!olam || !cottageRoot) return null;
  olam.__livingRegionCottageRoot = cottageRoot;
  cottageRoot.userData ||= {};
  cottageRoot.userData.doorRuntimeInstalled = true;
  cottageRoot.userData.toggleNearestDoor = () => toggleNearestDoor(olam, cottageRoot);
  registerDoorInteractables(olam, cottageRoot);
  return cottageRoot.userData.toggleNearestDoor;
}

export default { installDoorInteractionRuntime, toggleNearestDoor, openDoor, closeDoor };
