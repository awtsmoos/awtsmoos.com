// B"H
/**
 * @file VehicleMounting.js
 * @description Enter/exit state transitions for player and vehicle control.
 */

/** @param {object} state B"H runtime state. */
export function nearestVehicle(state) {
  const p = state.player?.position || state.camera?.position;
  if (!p) return null;
  let best = null;
  let dist = 4.5;
  for (const vehicle of state.vehicles || []) {
    const d = vehicle.mesh?.position?.distanceTo?.(p) ?? 999;
    if (d < dist) {
      best = vehicle;
      dist = d;
    }
  }
  return best;
}

/** @param {object} vehicle B"H vehicle entity. */
export function createExitOffset(vehicle = {}) {
  const yaw = vehicle.mesh?.rotation?.y || 0;
  return { x: Math.cos(yaw) * 1.8, y: 0, z: -Math.sin(yaw) * 1.8 };
}

/** @param {object} state B"H runtime state. */
export function enterVehicle(state, vehicle = state.nearVehicle) {
  if (!vehicle || state.activeVehicle) return false;
  state.activeVehicle = vehicle;
  vehicle.enter?.("player");
  vehicle.baseY = vehicle.mesh?.position?.y ?? 0;
  state.playerWasVisible = state.player?.visible;
  if (state.player) state.player.visible = false;
  return true;
}

/** @param {object} state B"H runtime state. */
export function exitVehicle(state) {
  const vehicle = state.activeVehicle;
  if (!vehicle) return false;
  vehicle.exit?.("player");
  if (state.player && vehicle.mesh?.position) {
    const offset = createExitOffset(vehicle);
    state.player.visible = state.playerWasVisible !== false;
    state.player.position.copy?.(vehicle.mesh.position);
    state.player.position.x += offset.x;
    state.player.position.y += offset.y;
    state.player.position.z += offset.z;
  }
  vehicle.velocity = 0;
  state.activeVehicle = null;
  return true;
}

/** @param {object} state B"H runtime state. */
export function toggleVehicleMount(state) {
  return state.activeVehicle ? exitVehicle(state) : enterVehicle(state);
}
