// B"H
/** Door helpers: distance, player, and state vessels kept small. */
import * as THREE from "/games/scripts/build/three.module.js";
import { serialDoor } from "./DoorPersistence.js";
const TEMP = new THREE.Vector3();
export const playerEntity = olam => olam?.player || olam?.chossid;
export const playerPosition = olam => playerEntity(olam)?.mesh?.position || playerEntity(olam)?.collider?.start || null;
export const toast = (olam, text, color = "#ffe680") => olam?.ayshPeula?.("ui event", "effectsOverlay", { text, color, replace:true });
export const actionName = p => typeof p === "string" ? p : String(p?.type || p?.action || p?.peula || "");
export function dist2(a, b) { const dx = a.x - b.x, dy = (a.y || 0) - (b.y || 0), dz = a.z - b.z; return dx * dx + dy * dy + dz * dz; }
export function doorEntries(root) { const out = []; root?.traverse?.(c => c.userData?.doorHingePivot && c.userData?.doorState && out.push({ pivot:c, state:c.userData.doorState })); return out; }
export function worldPos(entry) { return entry.pivot.getWorldPosition ? entry.pivot.getWorldPosition(TEMP).clone() : entry.pivot.position.clone(); }
export function ensureInteractionArray(olam) { if (!Array.isArray(olam.interactableNivrayim)) olam.interactableNivrayim = []; return olam.interactableNivrayim; }
export function ensureGenericRegistry(olam) { if (!Array.isArray(olam.__interactionRegistry)) olam.__interactionRegistry = []; return olam.__interactionRegistry; }
export function publishDoorState(olam, state) { const payload = { type:"door", id:state.id, houseId:state.houseId, open:Boolean(state.open), locked:Boolean(state.locked), state:serialDoor(state) }; olam?.liveBridge?.world?.setDoorOpen?.(state.id, payload.open); olam?.__liveBridge?.world?.setDoorOpen?.(state.id, payload.open); olam?.collisionWorld?.setDoorOpen?.(state.id, payload.open); olam?.world?.setDoorOpen?.(state.id, payload.open); olam?.ayshPeula?.("doorStateChanged", payload); if (olam) olam.__lastDoorStateChange = { ...payload, at:Date.now() }; }
