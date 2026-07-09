// B"H
import { patchWorldState, readWorldState } from "../../../../../../systems/worldState/WorldStateStore.js?compact=true&v=full-chain-cache-bust-20260708-bh10";

export function serialDoor(state = {}) {
  return { id:String(state.id), open:Boolean(state.open), locked:Boolean(state.locked), updatedAt:Date.now() };
}

export function saveDoorState(state = {}) {
  const doors = readWorldState("doors", {});
  patchWorldState({ doors:{ ...doors, [state.id]:serialDoor(state) } });
}

export function normalizeDoorState(state = {}) {
  Object.assign(state, readWorldState("doors", {})?.[state.id] || {});
  state.open = Boolean(state.open);
  state.locked = Boolean(state.locked);
  return state;
}

export default { serialDoor, saveDoorState, normalizeDoorState };
