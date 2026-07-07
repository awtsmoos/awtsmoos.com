// B"H
/**
 * @file VehicleRuntime.js
 * @description Shared page-side vehicle runtime for mounted procedural driving.
 */
import { spawnStartingVehicles } from "./VehicleSpawnSystem.js";
import { installVehicleInteraction, updateVehicleInteraction } from "./VehicleInteractionSystem.js";
import { updateVehicleCamera } from "./VehicleCamera.js";
import { updateVehicleSound } from "./VehicleSoundSystem.js";
import { buildRoads } from "./VehicleRoadSystem.js";
import { updateVehicleDiscovery } from "./VehicleDiscoverySystem.js";
import { VehicleOwnershipSystem } from "./VehicleOwnershipSystem.js";
import { createHorseAnchor, updateHorseAnchors } from "./HorseAnchorSystem.js";
import { installVehicleInput, vehicleInputFromKeys } from "./VehicleInput.js";
import { driveVehicle } from "./VehiclePhysics.js";
import { installVehicleDiagnostics } from "./VehicleDiagnostics.js";

const MAX_SCENE_RETRIES = 8;

function activeWorld() {
  return globalThis.__AWTSMOOS_GET_ACTIVE_OLAM__?.()
    || globalThis.__AWTSMOOS_OLAM__
    || globalThis.olam
    || globalThis.ikar?.olam
    || globalThis.mana?.activeOlam
    || globalThis.mana?.olam
    || {};
}

function findWorldRefs() {
  const olam = activeWorld();
  return {
    scene: globalThis.scene || olam.scene || olam.heesCheel?.scene,
    camera: globalThis.camera || olam.camera || olam.heesCheel?.camera,
    player: globalThis.player || olam.player || olam.nivrah || globalThis.__AWTSMOOS_PLAYER__
  };
}

function delayRetry(THREE, reason) {
  const prior = globalThis.__MITZVAH_VEHICLES__ || {};
  const retries = (prior.retries || 0) + 1;
  const status = retries >= MAX_SCENE_RETRIES ? "worker-owned-scene" : reason;
  globalThis.__MITZVAH_VEHICLES__ = { ...prior, status, retries, pageRuntimeReady:false };
  if (retries < MAX_SCENE_RETRIES) setTimeout(() => installVehicleRuntime(THREE), 1100);
  return globalThis.__MITZVAH_VEHICLES__;
}

function drive(state, dt) {
  if (!state.activeVehicle) return;
  driveVehicle(state.activeVehicle, vehicleInputFromKeys(state.keys), dt);
}

function tick(state) {
  const now = performance.now();
  const dt = Math.min(0.05, (now - state.last) / 1000);
  state.last = now;
  Object.assign(state, findWorldRefs());
  updateHorseAnchors(state);
  drive(state, dt);
  updateVehicleInteraction(state);
  updateVehicleCamera(state, dt);
  updateVehicleSound(state);
  updateVehicleDiscovery(state);
  requestAnimationFrame(() => tick(state));
}

/**
 * B"H
 * Installs page-side vehicle controls when a page-owned Olam scene exists.
 * Worker-owned scenes are supported by the postbuild layer and do not spin here.
 *
 * @param {object} THREE Three.js namespace.
 * @returns {object} Runtime state or a bounded waiting diagnostic.
 */
export function installVehicleRuntime(THREE) {
  const existing = globalThis.__MITZVAH_VEHICLES__;
  if (existing?.status === "ready" && existing.scene) return existing;

  const state = {
    THREE,
    status: "booting",
    pageRuntimeReady: false,
    vehicles: [],
    ownership: new VehicleOwnershipSystem(),
    keys: {},
    last: performance.now()
  };
  Object.assign(state, findWorldRefs());
  if (!state.scene) return delayRetry(THREE, "waiting-for-scene");

  state.roads = buildRoads(THREE, state.scene);
  state.vehicles = spawnStartingVehicles(THREE, state.scene);
  state.vehicles.forEach(vehicle => {
    state.ownership.register(vehicle);
    if (vehicle.vehicleType === "chariot") createHorseAnchor(vehicle);
  });

  installVehicleInput(state);
  installVehicleInteraction(state);
  installVehicleDiagnostics(state);
  state.status = "ready";
  state.pageRuntimeReady = true;
  globalThis.__MITZVAH_VEHICLES__ = state;
  requestAnimationFrame(() => tick(state));
  return state;
}
