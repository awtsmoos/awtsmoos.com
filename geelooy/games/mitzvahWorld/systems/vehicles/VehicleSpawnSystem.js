// B"H
/**
 * Places vehicles in the village by default.
 * The first road must begin where the neshama wakes up; no child should hunt
 * the whole olam before tasting the wagon, chariot, and car.
 */
import { createCart } from "./ProceduralCartFactory.js";
import { createChariot } from "./ProceduralChariotFactory.js";
import { createAutomobile } from "./ProceduralVehicleFactory.js";

export const VEHICLE_SPAWNS = [
  ["small", "cart", [-8, 0, -6], "Village Square"],
  ["supply", "cart", [-12, 0, 5], "Village Square"],
  ["merchant", "cart", [7, 0, -10], "Village Square"],
  ["farm", "cart", [11, 0, 8], "Village Square"],
  ["messenger", "chariot", [0, 0, -12], "Village Square"],
  ["utility", "car", [-6, 0, 10], "Village Square"]
];

export function createVehicleByKind(THREE, kind, type) {
  if (type === "chariot") return createChariot(THREE, kind);
  if (type === "car") return createAutomobile(THREE, kind);
  return createCart(THREE, kind);
}

export function spawnStartingVehicles(THREE, scene) {
  const vehicles = [];
  for (const [kind, type, pos, place] of VEHICLE_SPAWNS) {
    const vehicle = createVehicleByKind(THREE, kind, type);
    vehicle.garageLocation = place;
    vehicle.mesh.position.set(pos[0], pos[1], pos[2]);
    scene?.add?.(vehicle.mesh);
    vehicles.push(vehicle);
  }
  return vehicles;
}
