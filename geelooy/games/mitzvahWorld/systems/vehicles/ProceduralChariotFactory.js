// B"H
/** Chariots: swifter vessels where wonder leans forward. */
import { box, finalizeVehicle, vehicleKit, wheel } from "./VehicleFactory.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

export const CHARIOT_VARIANTS = {
  village: { name: "Village Chariot", speed: 15, color: "wood" },
  messenger: { name: "Messenger Chariot", speed: 18, color: "blue" },
  royal: { name: "Royal Chariot", speed: 17, color: "gold" }
};

export function createChariot(THREE, variant = "village") {
  const spec = CHARIOT_VARIANTS[variant] || CHARIOT_VARIANTS.village;
  const kit = vehicleKit(THREE);
  const root = new THREE.Group();
  root.name = spec.name;
  const mat = kit.mats[spec.color] || kit.mats.wood;
  box(THREE, root, kit, "chariot-cab", [2.1, 0.7, 1.45], [0, 0.92, 0.25], mat);
  box(THREE, root, kit, "chariot-rail", [2.35, 0.18, 1.75], [0, 1.45, 0.2], kit.mats.darkWood);
  box(THREE, root, kit, "horse-anchor", [0.22, 0.18, 2.7], [0, 1.05, -1.7], kit.mats.iron);
  const wheels = [[-1.18, .55, .72], [1.18, .55, .72]].map(p => wheel(THREE, root, kit, p, 0.68));
  wheels.push(wheel(THREE, root, kit, [-0.68, .38, -1.1], 0.34), wheel(THREE, root, kit, [0.68, .38, -1.1], 0.34));
  const steering = [box(THREE, root, kit, "reins", [0.08, 0.08, 1.8], [0, 1.55, -1.0], kit.mats.iron)];
  return finalizeVehicle({ name: spec.name, vehicleType: "chariot", speed: spec.speed, acceleration: 18, turnRate: 1.8, brakingForce: 21, seatCount: 1, wheelCount: 4, storageSlots: 2 }, root, wheels, steering);
}
