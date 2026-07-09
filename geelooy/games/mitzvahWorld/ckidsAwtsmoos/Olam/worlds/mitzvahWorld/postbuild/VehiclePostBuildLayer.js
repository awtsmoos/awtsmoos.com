// B"H
/**
 * @file VehiclePostBuildLayer.js
 * @description Adds procedural vehicles to the actual Olam scene during postbuild.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import {
  spawnStartingVehicles
} from "../../../../../systems/vehicles/VehicleSpawnSystem.js?compact=true&v=vehicles-u-mount-20260706-bh1";
import {
  buildRoads
} from "../../../../../systems/vehicles/VehicleRoadSystem.js?compact=true&v=vehicles-u-mount-20260706-bh1";

const KEY = "__awtsmoosVehiclePostBuildLayer";

function sceneOf(context, olam) {
  return context?.scene || olam?.scene || null;
}

function publish(olam, layer) {
  const report = {
    ok: true,
    source: "worker-postbuild",
    vehicleCount: layer.vehicles.length,
    roadCount: layer.roads.length,
    vehicles: layer.vehicles.map(vehicle => ({
      id: vehicle.id,
      name: vehicle.name,
      type: vehicle.vehicleType,
      position: vehicle.mesh?.position
        ? [vehicle.mesh.position.x, vehicle.mesh.position.y, vehicle.mesh.position.z]
        : null
    }))
  };
  olam.__MITZVAH_VEHICLES__ = layer;
  olam.__MITZVAH_VEHICLE_REPORT__ = report;
  return report;
}

/**
 * B"H
 * Installs cars, carts, and chariots into the real worker-owned scene.
 *
 * @param {object} context Postbuild context.
 * @returns {object|null} Vehicle layer.
 */
export async function ensureVehiclePostBuildLayer(context = {}) {
  const olam = context.olam || context;
  const scene = sceneOf(context, olam);
  if (!scene || !olam) return null;
  if (olam[KEY]) return olam[KEY];

  const roads = buildRoads(THREE, scene);
  const vehicles = spawnStartingVehicles(THREE, scene);
  const layer = { ok: true, roads, vehicles, report: null, at: Date.now() };
  layer.report = publish(olam, layer);
  scene.userData ||= {};
  scene.userData.mitzvahVehicles = layer.report;
  olam[KEY] = layer;
  return layer;
}

export default ensureVehiclePostBuildLayer;
