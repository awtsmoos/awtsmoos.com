// B"H
/** @file DoorState.js @description Parser-clear door state vessel. */
function option(options, key, fallback) { return options && options[key] !== undefined ? options[key] : fallback; }

export function createDoorState(options = {}) {
  const open = Boolean(option(options, "open", option(options, "isOpen", false)));
  const state = {
    open,
    locked:Boolean(option(options, "locked", false)),
    closedRotationY:option(options, "closedRotationY", 0),
    openRotationY:option(options, "openRotationY", Math.PI * .52),
    speed:option(options, "speed", 8),
    progress:open ? 1 : 0,
    current:open ? 1 : 0,
    target:open ? 1 : 0,
    destination:option(options, "destination", null)
  };
  Object.defineProperty(state, "isOpen", {
    enumerable:true,
    get() { return this.open; },
    set(value) { this.open = Boolean(value); this.target = this.open ? 1 : 0; }
  });
  return state;
}

export function toggleDoorState(state) {
  if (state.locked) return state;
  state.open = !state.open;
  state.target = state.open ? 1 : 0;
  return state;
}

export default createDoorState;
