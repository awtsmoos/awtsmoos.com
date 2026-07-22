// B"H
// Boruch Hashem
// Blessed is He
/** The complete liquid shader composes aligned contracts, grid work, and particle work. */

import { WEB_GPU_LIQUID_CONTRACTS_WGSL } from "./webGpuLiquidWgslContracts.js";
import { WEB_GPU_LIQUID_GRID_WGSL } from "./webGpuLiquidGridWgsl.js";
import { WEB_GPU_LIQUID_PARTICLE_WGSL } from "./webGpuLiquidParticleWgsl.js";

export const WEB_GPU_LIQUID_WGSL = [
	WEB_GPU_LIQUID_CONTRACTS_WGSL,
	WEB_GPU_LIQUID_GRID_WGSL,
	WEB_GPU_LIQUID_PARTICLE_WGSL
].join("\n");

export const WEB_GPU_LIQUID_ENTRY_POINTS = Object.freeze([
	"clear_grid",
	"deposit_particles",
	"apply_grid_forces",
	"normalize_grid",
	"transfer_grid_to_particles",
	"integrate_particles",
	"pack_surface_points"
]);
