// B"H
/**
 * @file DoorInteractionRuntime.js
 * @description Door runtime that toggles the nearest real door from the cottage
 * root itself. It uses robust player position, immediate visual rotation, and
 * collision refresh. No raycast wrapper is required for the mobile fallback.
 */
import { registerHouseRoot } from "../../../collision/HouseCollisionWorld.js?compact=true&v=perf-tight-collision-20260703-bh8";
import { setDoorVisualState } from "./DoorAnimationRuntime.js?compact=true&v=door-roof-target-20260708-bh2";
import { normalizeDoorState, saveDoorState } from "./DoorPersistence.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { registerDoorEntry } from "./DoorInteractionRegistry.js?compact=true&v=door-wall-source-fix-20260708-bh4";
import { dist2, doorEntries, playerPosition, publishDoorState, toast, worldPos } from "./DoorInteractionHelpers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { publishMultiRoomCollisionDiagnostics } from "../interior/MultiRoomHouseCollision.js?compact=true&v=lod-house-octree-20260705-bh1";
const DOOR_REACH = 14;
function applyColliderState(root, doorId, state) {
  const open = state?.open === true;
  root?.traverse?.(node => {
    const data = node.userData || {};
    if (data.doorId === doorId && data.doorPanel) data.closedCollider = !open;
    if (data.doorState?.id === doorId) {
      data.doorState.open = open;
      data.doorOpen = open;
    }
    if (!Array.isArray(data.colliderSources)) return;
    data.colliderSources.forEach(src => {
      if (!src?.door || (src.id !== doorId && src.visibleTwin !== doorId)) return;
      src.open = open;
      src.solid = !open;
    });
  });
}
function refreshCollision(olam, root, reason, state) {
  applyColliderState(root, state?.id, state);
  root?.updateMatrixWorld?.(true);
  const result = registerHouseRoot(olam, root, { houseId:"living-region-cottages", forceRefresh:true, octree:true, octreeProxyLimit:260 });
  publishMultiRoomCollisionDiagnostics(olam, root);
  olam.__lastDoorCollisionRefresh = { at:Date.now(), reason, doorId:state?.id || null, open:state?.open === true, colliders:result?.records?.length || 0, octree:true };
  return result;
}
function bestDoor(olam, root) {
  const p = playerPosition(olam);
  let best = null, bestD = Infinity;
  for (const entry of doorEntries(root)) {
    const d = p ? dist2(p, worldPos(entry)) : 0;
    if (d < bestD) { best = entry; bestD = d; }
  }
  return { entry:best, distance:Math.sqrt(bestD), player:p };
}
export function nearestDoor(olam, root = olam?.__livingRegionCottageRoot, maxDistance = DOOR_REACH) {
  if (!root) return null;
  const probe = bestDoor(olam, root);
  const accepted = Boolean(probe.entry && (!probe.player || probe.distance <= maxDistance));
  olam.__lastNearestDoorProbe = { at:Date.now(), id:probe.entry?.state?.id || null, distance:probe.distance, maxDistance, accepted, hadPlayer:Boolean(probe.player), doorCount:doorEntries(root).length };
  return accepted ? probe.entry : null;
}
export function openDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state);
    if (entry.state.locked) return toast(olam, "LOCKED", "#ffcc66"), false;
    entry.state.open = true;
    const visual = setDoorVisualState(root, doorId, entry.state);
    saveDoorState(entry.state);
    publishDoorState(olam, entry.state);
    refreshCollision(olam, root, "door-open", entry.state);
    toast(olam, "DOOR OPEN", "#9fffd0");
    olam.__lastDoorToggleProof = { at:Date.now(), doorId, open:true, visual, source:"openDoor-source-bh4" };
    return true;
  }
  toast(olam, "NO DOOR", "#ffd966");
  return false;
}
export function closeDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) {
  for (const entry of doorEntries(root)) if (entry.state.id === doorId) {
    normalizeDoorState(entry.state);
    entry.state.open = false;
    const visual = setDoorVisualState(root, doorId, entry.state);
    saveDoorState(entry.state);
    publishDoorState(olam, entry.state);
    refreshCollision(olam, root, "door-close", entry.state);
    toast(olam, "DOOR CLOSED", "#d8c6a3");
    olam.__lastDoorToggleProof = { at:Date.now(), doorId, open:false, visual, source:"closeDoor-source-bh4" };
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
export function toggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot, options = {}) {
  const entry = nearestDoor(olam, root, options.maxDistance || DOOR_REACH);
  if (entry) return toggleDoor(olam, entry, root);
  toast(olam, "TOO FAR FROM DOOR", "#ffd966");
  return false;
}
export function forceToggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot) {
  const probe = bestDoor(olam, root);
  if (!probe.entry) return toast(olam, "NO DOOR", "#ffd966"), false;
  olam.__lastNearestDoorProbe = { at:Date.now(), id:probe.entry.state.id, distance:probe.distance, maxDistance:Infinity, accepted:true, forced:true, doorCount:doorEntries(root).length };
  return toggleDoor(olam, probe.entry, root);
}
export function registerDoorInteractables(olam, cottageRoot) {
  if (!olam || !cottageRoot) return;
  for (const entry of doorEntries(cottageRoot)) registerDoorEntry(olam, cottageRoot, entry, toggleDoor);
}
export function installDoorInteractionRuntime(olam, cottageRoot) {
  if (!olam || !cottageRoot) return null;
  olam.__livingRegionCottageRoot = cottageRoot;
  cottageRoot.userData ||= {};
  cottageRoot.userData.doorRuntimeInstalled = true;
  cottageRoot.userData.toggleNearestDoor = () => toggleNearestDoor(olam, cottageRoot);
  cottageRoot.userData.forceToggleNearestDoor = () => forceToggleNearestDoor(olam, cottageRoot);
  registerDoorInteractables(olam, cottageRoot);
  globalThis.__MITZVAH_DOOR_DIAG__ = () => ({
    count:olam.__doorInteractionRegistry?.length || 0,
    doorCount:doorEntries(cottageRoot).length,
    proxyCount:(olam.__doorInteractionRegistry || []).filter(d => d.proxy).length,
    lastNearestDoorProbe:olam.__lastNearestDoorProbe || null,
    lastToggleProof:olam.__lastDoorToggleProof || null,
    lastCollisionRefresh:olam.__lastDoorCollisionRefresh || null,
    diag:olam.__mitzvahDoorDiag || null,
    source:"door-runtime-source-fix-20260708-bh4"
  });
  return cottageRoot.userData.toggleNearestDoor;
}
export default { installDoorInteractionRuntime, toggleNearestDoor, forceToggleNearestDoor, openDoor, closeDoor, registerDoorInteractables };
