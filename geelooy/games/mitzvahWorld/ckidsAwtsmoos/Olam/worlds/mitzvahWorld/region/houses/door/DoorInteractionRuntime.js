// B"H
/** Door runtime: the hinge changes both visible wood and collision law. */
import { registerHouseRoot } from "../../../collision/HouseCollisionWorld.js?v=big-solid-house-rooms-20260702-bh12";
import { setDoorVisualState } from "./DoorAnimationRuntime.js";
import { normalizeDoorState, saveDoorState } from "./DoorPersistence.js";
import { registerDoorEntry } from "./DoorInteractionRegistry.js";
import { dist2, doorEntries, playerPosition, publishDoorState, toast, worldPos } from "./DoorInteractionHelpers.js";
function applyColliderState(root, doorId, state) {
  const open = state?.open === true;
  root?.traverse?.(node => {
    const data = node.userData || {};
    if (data.doorId === doorId && data.doorPanel) data.closedCollider = !open;
    if (data.doorState?.id === doorId) { data.doorState.open = open; data.doorOpen = open; }
    if (!Array.isArray(data.colliderSources)) return;
    data.colliderSources.forEach(src => { if (!src?.door || (src.id !== doorId && src.visibleTwin !== doorId)) return; src.open = open; src.solid = !open; });
  });
}
function refreshCollision(olam, root, reason, state) {
  applyColliderState(root, state?.id, state); root?.updateMatrixWorld?.(true);
  const result = registerHouseRoot(olam, root, { houseId:"living-region-cottages" });
  olam.__lastDoorCollisionRefresh = { at:Date.now(), reason, doorId:state?.id || null, open:state?.open === true, colliders:result?.records?.length || 0 };
  return result;
}
export function nearestDoor(olam, root = olam?.__livingRegionCottageRoot, maxDistance = 6.4) {
  const p = playerPosition(olam); if (!p || !root) return null;
  let best = null, bestD = Infinity;
  for (const entry of doorEntries(root)) { const d = dist2(p, worldPos(entry)); if (d < bestD) { best = entry; bestD = d; } }
  return best && bestD <= maxDistance * maxDistance ? best : null;
}
export function openDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state); if (entry.state.locked) return toast(olam, "LOCKED", "#ffcc66"), false;
    entry.state.open = true; setDoorVisualState(root, doorId, entry.state); saveDoorState(entry.state);
    publishDoorState(olam, entry.state); refreshCollision(olam, root, "door-open", entry.state); toast(olam, "DOOR OPEN", "#9fffd0"); return true;
  }
  toast(olam, "NO DOOR", "#ffd966"); return false;
}
export function closeDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state); entry.state.open = false; setDoorVisualState(root, doorId, entry.state); saveDoorState(entry.state);
    publishDoorState(olam, entry.state); refreshCollision(olam, root, "door-close", entry.state); toast(olam, "DOOR CLOSED", "#d8c6a3"); return true;
  }
  toast(olam, "NO DOOR", "#ffd966"); return false;
}
export function toggleDoor(olam, entry, root = olam?.__livingRegionCottageRoot) { if (!entry) return toast(olam, "NO DOOR NEARBY", "#ffd966"), false; normalizeDoorState(entry.state); return entry.state.open ? closeDoor(olam, entry.state.id, root) : openDoor(olam, entry.state.id, root); }
export function toggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot) { const entry = nearestDoor(olam, root); return entry ? toggleDoor(olam, entry, root) : (toast(olam, "TOO FAR FROM DOOR", "#ffd966"), false); }
export function registerDoorInteractables(olam, cottageRoot) { if (!olam || !cottageRoot) return; for (const entry of doorEntries(cottageRoot)) registerDoorEntry(olam, cottageRoot, entry, toggleDoor); }
export function installDoorInteractionRuntime(olam, cottageRoot) { if (!olam || !cottageRoot) return null; olam.__livingRegionCottageRoot = cottageRoot; cottageRoot.userData ||= {}; cottageRoot.userData.doorRuntimeInstalled = true; cottageRoot.userData.toggleNearestDoor = () => toggleNearestDoor(olam, cottageRoot); registerDoorInteractables(olam, cottageRoot); globalThis.__MITZVAH_DOOR_DIAG__ = () => ({ count:olam.__doorInteractionRegistry?.length || 0, doors:olam.__doorInteractionRegistry || [], interactions:olam.__interactionRegistry || [], lastCollisionRefresh:olam.__lastDoorCollisionRefresh || null }); return cottageRoot.userData.toggleNearestDoor; }
export default { installDoorInteractionRuntime, toggleNearestDoor, openDoor, closeDoor, registerDoorInteractables };
