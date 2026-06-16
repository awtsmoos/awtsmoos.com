// B"H
/** The camera follows the rider like a faithful shliach behind the motion. */
export function updateVehicleCamera(state, dt) {
  const v = state.activeVehicle, cam = state.camera, THREE = state.THREE;
  if (!v || !cam || !THREE?.Vector3) return;
  const yaw = v.mesh.rotation.y;
  const desired = new THREE.Vector3(Math.sin(yaw) * -7, 4.2, Math.cos(yaw) * -7).add(v.mesh.position);
  cam.position.lerp?.(desired, Math.min(1, dt * 4));
  cam.lookAt?.(v.mesh.position.x, v.mesh.position.y + 1.3, v.mesh.position.z);
}
