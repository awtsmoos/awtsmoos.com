// B"H
import assert from "node:assert/strict";
import { stepVehiclePhysics } from "../../systems/vehicles/VehiclePhysics.js";

const start = { x: 0, z: 0, yaw: 0, velocity: 0 };
const spec = { maxSpeed: 24, reverseSpeed: 8, acceleration: 28, brakeForce: 34, turnRate: 2.25, friction: 3.8, driftGrip: 0.72 };
const driven = stepVehiclePhysics(start, spec, { throttle: 1, steer: 0, brake: 0 }, 0.5);
assert(driven.velocity > 0, "vehicle accelerates forward");
assert(driven.z > 0, "vehicle moves along forward axis");

const turned = stepVehiclePhysics(driven, spec, { throttle: 1, steer: 1, brake: 0 }, 0.5);
assert(turned.yaw > driven.yaw, "steering changes yaw while moving");
assert.notEqual(turned.x, driven.x, "drift/steer changes lateral position");

const braked = stepVehiclePhysics(turned, spec, { throttle: 0, steer: 0, brake: 1 }, 0.5);
assert(Math.abs(braked.velocity) < Math.abs(turned.velocity), "braking reduces speed");

console.log(JSON.stringify({ ok: true, test: "vehiclePhysicsSmoke", driven, turned, braked }, null, 2));
