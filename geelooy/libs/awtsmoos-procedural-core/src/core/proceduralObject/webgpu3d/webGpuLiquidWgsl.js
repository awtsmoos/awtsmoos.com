// B"H
// Boruch Hashem
// Blessed is He
/** The liquid shader composes deposition, pressure, curl, FLIP history, and compatibility. */

import { WEB_GPU_LIQUID_CONTRACTS_WGSL } from "./webGpuLiquidWgslContracts.js";
import { WEB_GPU_LIQUID_DIVERGENCE_WGSL } from "./webGpuLiquidDivergenceWgsl.js";
import { WEB_GPU_LIQUID_FLIP_TRANSFER_WGSL } from "./webGpuLiquidFlipTransferWgsl.js";
import { WEB_GPU_LIQUID_GRID_WGSL } from "./webGpuLiquidGridWgsl.js";
import { WEB_GPU_LIQUID_HISTORY_WGSL } from "./webGpuLiquidHistoryWgsl.js";
import { WEB_GPU_LIQUID_PARTICLE_WGSL } from "./webGpuLiquidParticleWgsl.js";
import { WEB_GPU_LIQUID_PRESSURE_WGSL } from "./webGpuLiquidPressureWgsl.js";
import { WEB_GPU_LIQUID_PROJECTION_WGSL } from "./webGpuLiquidProjectionWgsl.js";
import { WEB_GPU_LIQUID_VORTICITY_WGSL } from "./webGpuLiquidVorticityWgsl.js";

export const WEB_GPU_LIQUID_WGSL = [
	WEB_GPU_LIQUID_CONTRACTS_WGSL,
	WEB_GPU_LIQUID_GRID_WGSL,
	WEB_GPU_LIQUID_PARTICLE_WGSL,
	WEB_GPU_LIQUID_DIVERGENCE_WGSL,
	WEB_GPU_LIQUID_PRESSURE_WGSL,
	WEB_GPU_LIQUID_PROJECTION_WGSL,
	WEB_GPU_LIQUID_VORTICITY_WGSL,
	WEB_GPU_LIQUID_FLIP_TRANSFER_WGSL,
	WEB_GPU_LIQUID_HISTORY_WGSL
].join("\n");

export const WEB_GPU_LIQUID_ENTRY_POINTS = Object.freeze([
	"clear_grid",
	"deposit_particles",
	"apply_grid_forces",
	"normalize_grid",
	"compute_divergence",
	"jacobi_pressure_a",
	"jacobi_pressure_b",
	"project_grid_velocity",
	"compute_vorticity",
	"apply_vorticity_confinement",
	"transfer_grid_to_particles_flip",
	"store_grid_history",
	"transfer_grid_to_particles",
	"integrate_particles",
	"pack_surface_points"
]);
