// B"H
/**
 * HorseAnchorSystem: the chariot waits for the living pull.
 * Today a placeholder hitch; tomorrow a horse, and the path already knows.
 */
export function createHorseAnchor(vehicle, horse = null) {
  vehicle.meta ||= {};
  vehicle.meta.horseAnchor = { horse, offset: { x: 0, z: -2.8 } };
  return vehicle.meta.horseAnchor;
}

export function attachHorse(vehicle, horse) {
  if (!vehicle.meta?.horseAnchor) createHorseAnchor(vehicle, horse);
  vehicle.meta.horseAnchor.horse = horse;
  return vehicle;
}

export function updateHorseAnchors(state) {
  for (const vehicle of state.vehicles || []) {
    const anchor = vehicle.meta?.horseAnchor;
    const horse = anchor?.horse;
    if (!horse?.position || state.activeVehicle === vehicle) continue;
    vehicle.mesh.position.x = horse.position.x + (anchor.offset?.x || 0);
    vehicle.mesh.position.z = horse.position.z + (anchor.offset?.z || 0);
    vehicle.velocity = horse.userData?.speed || vehicle.velocity || 0;
  }
}
