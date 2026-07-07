// B"H
import assert from "node:assert/strict";
import { enterVehicle, exitVehicle, nearestVehicle } from "../../systems/vehicles/VehicleMounting.js";

const vec = (x, y, z) => ({
  x, y, z,
  distanceTo(other) { return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z); },
  copy(other) { this.x = other.x; this.y = other.y; this.z = other.z; return this; }
});

const vehicle = {
  id: "car-a",
  name: "Utility Car",
  occupancy: [],
  mesh: { position: vec(1, 0, 0), rotation: { y: 0 } },
  enter(id) { this.occupancy.push(id); },
  exit(id) { this.occupancy = this.occupancy.filter(value => value !== id); },
  velocity: 2
};
const state = { vehicles: [vehicle], player: { position: vec(0, 0, 0), visible: true } };

assert.equal(nearestVehicle(state), vehicle, "nearest vehicle is found");
assert.equal(enterVehicle(state, vehicle), true, "enter succeeds");
assert.equal(state.activeVehicle, vehicle);
assert.equal(state.player.visible, false);
assert.deepEqual(vehicle.occupancy, ["player"]);

assert.equal(exitVehicle(state), true, "exit succeeds");
assert.equal(state.activeVehicle, null);
assert.equal(state.player.visible, true);
assert.equal(vehicle.velocity, 0);
assert(vehicle.occupancy.length === 0);
assert(state.player.position.x > vehicle.mesh.position.x, "player exits beside vehicle");

console.log(JSON.stringify({ ok: true, test: "vehicleMountingSmoke", player: state.player.position }, null, 2));
