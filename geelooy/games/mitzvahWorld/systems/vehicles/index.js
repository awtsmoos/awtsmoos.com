// B"H
/**
 * @file index.js
 * @description Public vehicle runtime facade.
 */
export { installVehicleRuntime } from "./VehicleRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { createAutomobile, AUTO_VARIANTS } from "./ProceduralVehicleFactory.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { spawnStartingVehicles, createVehicleByKind, VEHICLE_SPAWNS } from "./VehicleSpawnSystem.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { stepVehiclePhysics, driveVehicle } from "./VehiclePhysics.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { enterVehicle, exitVehicle, toggleVehicleMount, nearestVehicle } from "./VehicleMounting.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { vehicleInputFromKeys, installVehicleInput } from "./VehicleInput.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export { vehicleDiagnostics } from "./VehicleDiagnostics.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
