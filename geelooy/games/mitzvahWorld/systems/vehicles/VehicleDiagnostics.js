// B"H
/**
 * @file VehicleDiagnostics.js
 * @description Browser and smoke-test reporting for the live vehicle runtime.
 */

/** @param {object} state B"H vehicle runtime state. */
export function vehicleDiagnostics(state = {}) {
  return {
    ok: Boolean(state.status === "ready" && state.vehicles?.length),
    status: state.status || "unknown",
    activeVehicle: state.activeVehicle?.id || null,
    nearVehicle: state.nearVehicle?.id || null,
    vehicleCount: state.vehicles?.length || 0,
    vehicles: (state.vehicles || []).map(vehicle => ({
      id: vehicle.id,
      name: vehicle.customName || vehicle.name,
      type: vehicle.vehicleType,
      state: vehicle.state,
      velocity: Number(vehicle.velocity || 0),
      position: vehicle.mesh?.position
        ? [vehicle.mesh.position.x, vehicle.mesh.position.y, vehicle.mesh.position.z].map(v => Math.round(v * 100) / 100)
        : null
    }))
  };
}

/** @param {object} state B"H vehicle runtime state. */
export function installVehicleDiagnostics(state) {
  state.diagnostics = () => vehicleDiagnostics(state);
  globalThis.__MITZVAH_VEHICLE_DIAG__ = state.diagnostics;
}
