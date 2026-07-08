// B"H
/**
 * @file VehiclePhysics.js
 * @description Pure vehicle acceleration, steering, braking, drift, and smoothing.
 */
import { vehiclePhysicsSpec } from "./VehicleTypes.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const approachZero = (value, amount) => {
  if (Math.abs(value) <= amount) return 0;
  return value - Math.sign(value) * amount;
};

/**
 * B"H
 * Steps scalar vehicle physics without touching THREE objects.
 *
 * @param {object} current Position/yaw/velocity state.
 * @param {object} spec Physics coefficients.
 * @param {object} input Normalized input.
 * @param {number} dt Seconds.
 * @returns {object} Next physics state.
 */
export function stepVehiclePhysics(current = {}, spec = {}, input = {}, dt = 0) {
  const seconds = clamp(dt, 0, 0.05);
  const throttle = clamp(input.throttle, -1, 1);
  const steer = clamp(input.steer, -1, 1);
  const brake = clamp(input.brake, 0, 1);
  const maxSpeed = Math.max(0.1, Number(spec.maxSpeed || spec.speed || 8));
  const reverseSpeed = Math.max(0.1, Number(spec.reverseSpeed || maxSpeed * 0.35));
  let velocity = Number(current.velocity || 0);

  velocity += throttle * Number(spec.acceleration || 12) * seconds;
  if (brake) velocity = approachZero(velocity, Number(spec.brakeForce || 18) * seconds);
  if (!throttle && !brake) velocity = approachZero(velocity, Number(spec.friction || 4) * seconds);
  velocity = clamp(velocity, -reverseSpeed, maxSpeed);

  const speed01 = clamp(Math.abs(velocity) / maxSpeed, 0, 1);
  const drift = (1 - Number(spec.driftGrip ?? 0.8)) * speed01 * steer;
  const yaw = Number(current.yaw || 0) + steer * Number(spec.turnRate || 1.5) * seconds * Math.max(0.24, speed01);
  const travelYaw = yaw + drift * 0.22;
  const x = Number(current.x || 0) + Math.sin(travelYaw) * velocity * seconds;
  const z = Number(current.z || 0) + Math.cos(travelYaw) * velocity * seconds;
  const suspensionPhase = Number(current.suspensionPhase || 0) + Math.abs(velocity) * seconds * 4;
  const suspensionY = Math.sin(suspensionPhase) * Number(spec.suspension || 0.08) * speed01;

  return { x, z, yaw, velocity, steer, speed01, drift, suspensionPhase, suspensionY };
}

/**
 * B"H
 * Applies pure physics to a live vehicle entity.
 *
 * @param {object} vehicle Vehicle entity with mesh.
 * @param {object} input Normalized vehicle input.
 * @param {number} dt Seconds.
 * @returns {object|null} Next physics state.
 */
export function driveVehicle(vehicle, input, dt) {
  if (!vehicle?.mesh) return null;
  const mesh = vehicle.mesh;
  const current = {
    x: mesh.position.x,
    z: mesh.position.z,
    yaw: mesh.rotation.y,
    velocity: vehicle.velocity,
    suspensionPhase: vehicle.suspensionPhase
  };
  const next = stepVehiclePhysics(current, vehiclePhysicsSpec(vehicle), input, dt);
  vehicle.velocity = next.velocity;
  vehicle.suspensionPhase = next.suspensionPhase;
  mesh.position.x = next.x;
  mesh.position.z = next.z;
  mesh.position.y = (vehicle.baseY ?? mesh.position.y ?? 0) + next.suspensionY;
  mesh.rotation.y = next.yaw;
  vehicle.wheels?.forEach(wheel => { wheel.rotation.x -= next.velocity * dt * 2.2; });
  vehicle.steering?.forEach(part => { part.rotation.y = -next.steer * 0.45; });
  vehicle.state = Math.abs(next.velocity) > 0.15 ? "moving" : "occupied";
  return next;
}
