// B"H
/**
 * Registry: every cottage door becomes one stable, hoverable, clickable target.
 * No splice(-1) darkness may delete the last door; each row is upserted by id.
 */
import { serialDoor } from "./DoorPersistence.js";
import { ensureDoorProxy, sealDoorPart, setDoorHighlight } from "./DoorProxyRuntime.js?v=perf-tight-collision-20260703-bh6";
import { actionName, ensureGenericRegistry, ensureInteractionArray, worldPos } from "./DoorInteractionHelpers.js";

const DOOR_RADIUS = 6.4;
function upsert(list, item, same) {
  const index = list.findIndex(same);
  if (index >= 0) list[index] = item;
  else list.push(item);
  return item;
}
function record(entry, proxy) {
  const p = worldPos(entry), s = entry.state;
  return {
    id:s.id, kind:"door", ownerId:s.houseId,
    prompt:s.locked ? "Locked" : (s.open ? "Close Door" : "Open Door"),
    radius:DOOR_RADIUS, bounds:{ type:"sphere", center:[p.x, p.y, p.z], radius:1.65 },
    action:"toggleDoor", workerOwned:true, networkReady:true,
    animation:"hinge", proxy:proxy?.name, state:serialDoor(s)
  };
}
function handleDoorAction(olam, cottageRoot, entry, toggleDoor, peula) {
  const action = actionName(peula);
  if (/mouseEnter|hover-enter/.test(action)) return setDoorHighlight(entry, true);
  if (/mouseLeave|hover-leave/.test(action)) return setDoorHighlight(entry, false);
  if (/accepted interaction|click|pointerdown|interact/.test(action)) return toggleDoor(olam, entry, cottageRoot);
  return false;
}
export function registerDoorEntry(olam, cottageRoot, entry, toggleDoor) {
  if (!olam || !entry?.state || !entry?.pivot) return null;
  const wrapper = {
    type:"cottageDoor", name:entry.state.id, interactable:true,
    doorState:entry.state, interactionKind:"door", interactionRadius:DOOR_RADIUS,
    interactionPrompt:entry.state.open ? "Close Door" : "Open Door",
    ayshPeula:peula => handleDoorAction(olam, cottageRoot, entry, toggleDoor, peula)
  };
  const proxy = ensureDoorProxy(entry, wrapper);
  wrapper.raycastMesh = proxy; wrapper.interactionMesh = proxy;
  entry.pivot.traverse?.(part => sealDoorPart(part, wrapper));
  upsert(ensureInteractionArray(olam), wrapper, x => x?.name === wrapper.name || x?.doorState?.id === entry.state.id);
  const row = record(entry, proxy);
  upsert(ensureGenericRegistry(olam), row, x => x?.id === row.id);
  olam.__doorInteractionRegistry ||= [];
  upsert(olam.__doorInteractionRegistry, row, x => x?.id === row.id);
  return wrapper;
}
