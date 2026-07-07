// B"H
/**
 * @file VehicleTypes.js
 * @description Data-driven vehicle defaults shared by factories, runtime, and tests.
 */

export const VEHICLE_INPUT_KEYS = Object.freeze({
  toggleMount: "KeyU",
  legacyToggleMount: "KeyE",
  forward: ["KeyW", "ArrowUp"],
  reverse: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  brake: ["Space"]
});

export const VEHICLE_TYPE_DEFAULTS = Object.freeze({
  cart: Object.freeze({
    maxSpeed: 9,
    reverseSpeed: 3,
    acceleration: 13,
    brakeForce: 18,
    turnRate: 1.55,
    friction: 5.5,
    driftGrip: 0.86,
    suspension: 0.08
  }),
  chariot: Object.freeze({
    maxSpeed: 16,
    reverseSpeed: 4,
    acceleration: 22,
    brakeForce: 24,
    turnRate: 1.9,
    friction: 4.5,
    driftGrip: 0.8,
    suspension: 0.11
  }),
  car: Object.freeze({
    maxSpeed: 24,
    reverseSpeed: 8,
    acceleration: 28,
    brakeForce: 34,
    turnRate: 2.25,
    friction: 3.8,
    driftGrip: 0.72,
    suspension: 0.16
  })
});

/** @param {object} vehicle B"H vehicle entity. */
export function vehiclePhysicsSpec(vehicle = {}) {
  const base = VEHICLE_TYPE_DEFAULTS[vehicle.vehicleType] || VEHICLE_TYPE_DEFAULTS.cart;
  return {
    ...base,
    maxSpeed: Number(vehicle.speed ?? base.maxSpeed),
    acceleration: Number(vehicle.acceleration ?? base.acceleration),
    brakeForce: Number(vehicle.brakingForce ?? base.brakeForce),
    turnRate: Number(vehicle.turnRate ?? base.turnRate)
  };
}
