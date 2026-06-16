// B"H
/** Runtime: the road enters the world and the world becomes wider. */
import { spawnStartingVehicles } from "./VehicleSpawnSystem.js";
import { installVehicleInteraction, updateVehicleInteraction } from "./VehicleInteractionSystem.js";
import { updateVehicleCamera } from "./VehicleCameraSystem.js";
import { updateVehicleSound } from "./VehicleSoundSystem.js";
import { buildRoads } from "./VehicleRoadSystem.js";
import { updateVehicleDiscovery } from "./VehicleDiscoverySystem.js";
import { VehicleOwnershipSystem } from "./VehicleOwnershipSystem.js";
import { createHorseAnchor, updateHorseAnchors } from "./HorseAnchorSystem.js";

export function installVehicleRuntime(THREE) {
  const state = { THREE, vehicles: [], ownership: new VehicleOwnershipSystem(), keys: {}, last: performance.now() };
  Object.assign(state, findWorldRefs());
  if (!state.scene) return retry(THREE, "waiting-for-scene");
  buildRoads(THREE, state.scene);
  state.vehicles = spawnStartingVehicles(THREE, state.scene);
  state.vehicles.forEach(v => { state.ownership.register(v); if (v.vehicleType === "chariot") createHorseAnchor(v); });
  installVehicleInteraction(state);
  globalThis.__MITZVAH_VEHICLES__ = state;
  requestAnimationFrame(() => tick(state));
  return state;
}

function retry(THREE, reason) {
  globalThis.__MITZVAH_VEHICLES__ = { status: reason };
  setTimeout(() => installVehicleRuntime(THREE), 900);
}

function findWorldRefs() {
  const w = globalThis;
  const olam = w.__AWTSMOOS_OLAM__ || w.olam || w.ikar?.olam || w.mana?.activeOlam || {};
  return { scene: w.scene || olam.scene || olam.heesCheel?.scene, camera: w.camera || olam.camera || olam.heesCheel?.camera, player: w.player || olam.player || olam.nivrah || w.__AWTSMOOS_PLAYER__ };
}

function tick(state) {
  const now = performance.now(), dt = Math.min(.05, (now - state.last) / 1000); state.last = now;
  Object.assign(state, findWorldRefs());
  updateHorseAnchors(state); drive(state, dt);
  updateVehicleInteraction(state); updateVehicleCamera(state, dt); updateVehicleSound(state); updateVehicleDiscovery(state);
  requestAnimationFrame(() => tick(state));
}

function drive(state, dt) {
  const v = state.activeVehicle; if (!v) return;
  const k = state.keys, f = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
  const turn = (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0);
  v.velocity += f * v.acceleration * dt;
  if (!f) v.velocity *= Math.max(0, 1 - v.brakingForce * .04 * dt);
  v.velocity = Math.max(-v.speed * .4, Math.min(v.speed, v.velocity));
  v.mesh.rotation.y += turn * v.turnRate * dt * Math.max(.35, Math.abs(v.velocity) / Math.max(1, v.speed));
  v.mesh.position.x += Math.sin(v.mesh.rotation.y) * v.velocity * dt;
  v.mesh.position.z += Math.cos(v.mesh.rotation.y) * v.velocity * dt;
  v.wheels.forEach(w => w.rotation.x -= v.velocity * dt * 2.2);
  v.steering.forEach(s => s.rotation.y = -turn * .45);
  v.state = Math.abs(v.velocity) > .15 ? "moving" : "occupied";
}
