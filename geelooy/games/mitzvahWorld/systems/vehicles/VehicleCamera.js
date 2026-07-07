// B"H
/**
 * @file VehicleCamera.js
 * @description Smooth chase camera while mounted.
 */

/** @param {object} state B"H runtime state. @param {number} dt Seconds. */
export function updateVehicleCamera(state, dt) {
  const vehicle = state.activeVehicle;
  const cam = state.camera;
  const THREE = state.THREE;
  if (!vehicle?.mesh || !cam || !THREE?.Vector3) return;
  const yaw = vehicle.mesh.rotation.y;
  const speed = Math.abs(vehicle.velocity || 0);
  const distance = 7 + Math.min(3, speed * 0.08);
  const height = 4.1 + Math.min(1.4, speed * 0.04);
  const desired = new THREE.Vector3(
    Math.sin(yaw) * -distance,
    height,
    Math.cos(yaw) * -distance
  ).add(vehicle.mesh.position);
  cam.position.lerp?.(desired, Math.min(1, dt * 4.2));
  cam.lookAt?.(vehicle.mesh.position.x, vehicle.mesh.position.y + 1.25, vehicle.mesh.position.z);
}
