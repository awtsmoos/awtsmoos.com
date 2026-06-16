// B"H
/** Automobiles: a surreal future layer, still born from boxes and wheels. */
import { box, finalizeVehicle, vehicleKit, wheel } from "./VehicleFactory.js";

export const AUTO_VARIANTS = {
  utility: { name: "Utility Car", speed: 24, body: [2.8, .65, 1.55], seats: 2, cargo: 4 },
  delivery: { name: "Delivery Truck", speed: 20, body: [4.2, .9, 1.8], seats: 2, cargo: 12 },
  maintenance: { name: "Village Maintenance Vehicle", speed: 22, body: [3.4, .75, 1.65], seats: 2, cargo: 8 }
};

export function createAutomobile(THREE, variant = "utility") {
  const spec = AUTO_VARIANTS[variant] || AUTO_VARIANTS.utility;
  const kit = vehicleKit(THREE);
  const root = new THREE.Group();
  root.name = spec.name;
  box(THREE, root, kit, "auto-body", spec.body, [0, .82, 0], kit.mats.blue);
  box(THREE, root, kit, "auto-cabin", [1.25, .75, 1.2], [-.35, 1.35, -.08], kit.mats.canvas);
  box(THREE, root, kit, "auto-grille", [.12, .45, 1.1], [0, .92, -1], kit.mats.iron);
  const wheels = [[-1.05,.48,-.78],[1.05,.48,-.78],[-1.05,.48,.78],[1.05,.48,.78]].map(p => wheel(THREE, root, kit, p, .42));
  const steering = [wheel(THREE, root, kit, [-.2, 1.42, -.55], .18)];
  return finalizeVehicle({ name: spec.name, vehicleType: "car", speed: spec.speed, acceleration: 26, turnRate: 2.15, brakingForce: 30, seatCount: spec.seats, wheelCount: 4, storageSlots: spec.cargo }, root, wheels, steering);
}
