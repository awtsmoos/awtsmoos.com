// B"H
/**
 * @file DoorInteractionRuntime.js
 * @description Cottage doors have explicit raycast proxies and noisy feedback.
 * Closed/open visual state, interaction distance, and saved route state are one
 * runtime path instead of silent nearest-door guesses.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { patchWorldState, readWorldState } from "../../../../../../systems/worldState/WorldStateStore.js";
import { setDoorVisualState } from "./DoorAnimationRuntime.js";
const PROXY = "AWTSMOOS_DOOR_EXPLICIT_INTERACTION_PROXY";
function playerPosition(olam) { return (olam?.player || olam?.chossid)?.mesh?.position || null; }
function dist2(a, b) { const dx = a.x - b.x, dy = (a.y || 0) - (b.y || 0), dz = a.z - b.z; return dx * dx + dy * dy + dz * dz; }
function toast(olam, text, color = "#ffe680") { olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color, replace:true }); }
function doorEntries(root) { const out = []; root?.traverse?.(child => { if (child.userData?.doorHingePivot && child.userData?.doorState) out.push({ pivot:child, state:child.userData.doorState }); }); return out; }
function worldPos(entry) { const out = new THREE.Vector3(); return entry.pivot.getWorldPosition ? entry.pivot.getWorldPosition(out) : out.copy(entry.pivot.position); }
function save(olam, state) { patchWorldState(olam, `doors.${state.id}`, state); }
function normalizeState(olam, state) { Object.assign(state, readWorldState(olam, `doors.${state.id}`, state)); state.open = Boolean(state.open); state.locked = Boolean(state.locked); return state; }
function sealPart(part, wrapper) { part.nivraAwtsmoos = wrapper; Object.assign(part.userData ||= {}, { doorClickTarget:true, skipRaycast:false, skipOctree:true, noOctree:true, interactionLayer:"explicit-interaction", addToOctree:false }); }
function ensureProxy(entry, wrapper) { let proxy = entry.pivot.getObjectByName?.(PROXY); if (proxy) return proxy; proxy = new THREE.Mesh(new THREE.BoxGeometry(2.25, 3.1, 1.15), new THREE.MeshBasicMaterial({ transparent:true, opacity:0, depthWrite:false })); proxy.name = PROXY; proxy.position.set(0, 1.25, 0); proxy.visible = false; proxy.frustumCulled = false; sealPart(proxy, wrapper); entry.pivot.add(proxy); return proxy; }
export function nearestDoor(olam, root = olam?.__livingRegionCottageRoot, maxDistance = 5.6) { const p = playerPosition(olam); if (!p || !root) return null; let best = null, bestD = Infinity; for (const entry of doorEntries(root)) { const d = dist2(p, worldPos(entry)); if (d < bestD) { best = entry; bestD = d; } } return best && bestD <= maxDistance * maxDistance ? best : null; }
export function openDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) { for (const entry of doorEntries(root)) { if (entry.state.id !== doorId) continue; normalizeState(olam, entry.state); if (entry.state.locked) return toast(olam, "LOCKED", "#ffcc66"), false; entry.state.open = true; setDoorVisualState(root, doorId, entry.state); save(olam, entry.state); toast(olam, "DOOR OPEN", "#9fffd0"); return true; } toast(olam, "NO DOOR", "#ffd966"); return false; }
export function closeDoor(olam, doorId, root = olam?.__livingRegionCottageRoot) { for (const entry of doorEntries(root)) { if (entry.state.id !== doorId) continue; normalizeState(olam, entry.state); entry.state.open = false; setDoorVisualState(root, doorId, entry.state); save(olam, entry.state); toast(olam, "DOOR CLOSED", "#d8c6a3"); return true; } toast(olam, "NO DOOR", "#ffd966"); return false; }
export function toggleDoor(olam, entry, root = olam?.__livingRegionCottageRoot) { if (!entry) return toast(olam, "NO DOOR NEARBY", "#ffd966"), false; normalizeState(olam, entry.state); return entry.state.open ? closeDoor(olam, entry.state.id, root) : openDoor(olam, entry.state.id, root); }
export function toggleNearestDoor(olam, root = olam?.__livingRegionCottageRoot) { const entry = nearestDoor(olam, root); if (!entry) return toast(olam, "TOO FAR FROM DOOR", "#ffd966"), false; return toggleDoor(olam, entry, root); }
export function registerDoorInteractables(olam, cottageRoot) { if (!Array.isArray(olam?.interactableNivrayim)) return; olam.__doorInteractionRegistry ||= []; for (const entry of doorEntries(cottageRoot)) { const wrapper = { type:"cottageDoor", name:entry.state.id, interactable:true, raycastMesh:null, interactionMesh:null, doorState:entry.state, ayshPeula(peula) { if (peula === "accepted interaction" || peula === "click" || peula === "pointerdown") return toggleDoor(olam, entry, cottageRoot); return false; } }; const proxy = ensureProxy(entry, wrapper); wrapper.raycastMesh = proxy; wrapper.interactionMesh = proxy; entry.pivot.traverse?.(part => sealPart(part, wrapper)); if (!olam.interactableNivrayim.includes(wrapper)) olam.interactableNivrayim.push(wrapper); olam.__doorInteractionRegistry.push({ id:entry.state.id, proxy:proxy.name, state:entry.state }); } }
export function installDoorInteractionRuntime(olam, cottageRoot) { if (!olam || !cottageRoot) return null; olam.__livingRegionCottageRoot = cottageRoot; cottageRoot.userData ||= {}; cottageRoot.userData.doorRuntimeInstalled = true; cottageRoot.userData.toggleNearestDoor = () => toggleNearestDoor(olam, cottageRoot); registerDoorInteractables(olam, cottageRoot); globalThis.__MITZVAH_DOOR_DIAG__ = () => ({ count:olam.__doorInteractionRegistry?.length || 0, doors:olam.__doorInteractionRegistry || [] }); return cottageRoot.userData.toggleNearestDoor; }
export default { installDoorInteractionRuntime, toggleNearestDoor, openDoor, closeDoor };
