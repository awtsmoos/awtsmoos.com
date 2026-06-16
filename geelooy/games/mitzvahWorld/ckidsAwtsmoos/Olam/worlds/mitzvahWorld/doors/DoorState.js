// B"H
/** @file DoorState.js @description Parser-clear door state vessel. */
function option(options, key, fallback) { return options && options[key] !== undefined ? options[key] : fallback; }
export function createDoorState(options = {}) { return { open:false, locked:Boolean(option(options,"locked",false)), closedRotationY:option(options,"closedRotationY",0), openRotationY:option(options,"openRotationY",Math.PI*.52), speed:option(options,"speed",8), progress:0, destination:option(options,"destination",null) }; }
export function toggleDoorState(state) { if (state.locked) return state; state.open = !state.open; return state; }
export default createDoorState;
