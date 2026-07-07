// B"H
/**
 * @file index.js
 * @description Public vehicle runtime facade.
 */
export { installVehicleRuntime } from "./VehicleRuntime.js";
export { createAutomobile, AUTO_VARIANTS } from "./ProceduralVehicleFactory.js";
export { spawnStartingVehicles, createVehicleByKind, VEHICLE_SPAWNS } from "./VehicleSpawnSystem.js";
export { stepVehiclePhysics, driveVehicle } from "./VehiclePhysics.js";
export { enterVehicle, exitVehicle, toggleVehicleMount, nearestVehicle } from "./VehicleMounting.js";
export { vehicleInputFromKeys, installVehicleInput } from "./VehicleInput.js";
export { vehicleDiagnostics } from "./VehicleDiagnostics.js";
