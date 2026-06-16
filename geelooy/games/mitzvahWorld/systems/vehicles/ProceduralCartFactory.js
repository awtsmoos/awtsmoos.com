// B"H
/** Carts from simple forms: wood remembers it can become a journey. */
import { box, finalizeVehicle, vehicleKit, wheel } from "./VehicleFactory.js";

export const CART_VARIANTS = {
  small: { name: "Small Cart", speed: 10, body: [2.4, 0.5, 1.5], seats: 1 },
  merchant: { name: "Merchant Wagon", speed: 12, body: [3.6, 0.7, 1.8], seats: 2 },
  farm: { name: "Farm Wagon", speed: 11, body: [3.8, 0.65, 2.0], seats: 2 },
  supply: { name: "Supply Wagon", speed: 12.5, body: [4.1, 0.75, 2.1], seats: 3 }
};

export function createCart(THREE, variant = "small") {
  const spec = CART_VARIANTS[variant] || CART_VARIANTS.small;
  const kit = vehicleKit(THREE);
  const root = new THREE.Group();
  root.name = spec.name;
  box(THREE, root, kit, "cart-body", spec.body, [0, 0.85, 0], kit.mats.wood);
  box(THREE, root, kit, "cart-bed", [spec.body[0] * 0.92, 0.18, spec.body[2] * 0.85], [0, 1.25, 0], kit.mats.darkWood);
  box(THREE, root, kit, "front-bench", [1.1, 0.28, 1.2], [0, 1.58, -0.65], kit.mats.canvas);
  const wheels = [[-1.15, .45, -.82], [1.15, .45, -.82], [-1.15, .45, .82], [1.15, .45, .82]].map(p => wheel(THREE, root, kit, p));
  const steering = [box(THREE, root, kit, "steering-bar", [0.12, 0.12, 1.25], [0, 1.65, -1.05], kit.mats.iron)];
  return finalizeVehicle({ name: spec.name, vehicleType: "cart", speed: spec.speed, acceleration: 11, turnRate: 1.25, brakingForce: 16, seatCount: spec.seats, wheelCount: 4, storageSlots: 6 }, root, wheels, steering);
}
