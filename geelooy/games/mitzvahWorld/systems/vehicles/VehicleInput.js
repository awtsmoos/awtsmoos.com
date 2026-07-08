// B"H
/**
 * @file VehicleInput.js
 * @description Keyboard state and normalized vehicle driving intent.
 */
import { VEHICLE_INPUT_KEYS } from "./VehicleTypes.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { toggleVehicleMount } from "./VehicleMounting.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

function anyPressed(keys, codes) {
  return codes.some(code => keys[code]);
}

/** @param {Record<string, boolean>} keys B"H keyboard map. */
export function vehicleInputFromKeys(keys = {}) {
  const forward = anyPressed(keys, VEHICLE_INPUT_KEYS.forward) ? 1 : 0;
  const reverse = anyPressed(keys, VEHICLE_INPUT_KEYS.reverse) ? 1 : 0;
  const left = anyPressed(keys, VEHICLE_INPUT_KEYS.left) ? 1 : 0;
  const right = anyPressed(keys, VEHICLE_INPUT_KEYS.right) ? 1 : 0;
  return {
    throttle: forward - reverse,
    steer: left - right,
    brake: anyPressed(keys, VEHICLE_INPUT_KEYS.brake) ? 1 : 0
  };
}

/** @param {object} state B"H vehicle runtime state. */
export function installVehicleInput(state) {
  if (state.inputInstalled || typeof addEventListener !== "function") return;
  state.keys ||= {};
  const down = event => {
    state.keys[event.code] = true;
    if (event.code === VEHICLE_INPUT_KEYS.toggleMount || event.code === VEHICLE_INPUT_KEYS.legacyToggleMount) {
      toggleVehicleMount(state);
    }
  };
  const up = event => {
    state.keys[event.code] = false;
  };
  addEventListener("keydown", down);
  addEventListener("keyup", up);
  state.inputInstalled = true;
  state.removeVehicleInput = () => {
    removeEventListener("keydown", down);
    removeEventListener("keyup", up);
    state.inputInstalled = false;
  };
}
