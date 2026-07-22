// B"H
// Boruch Hashem
// Blessed is He
/** Sparse bind-group entries expose only the resident vessels each WGSL entry point touches. */

function entry(binding, buffer) {
	return Object.freeze({ binding, resource: Object.freeze({ buffer }) });
}

function pressureEntries(resources) {
	return [
		entry(0, resources.uniformBuffer),
		entry(5, resources.gridVelocityBuffer),
		entry(6, resources.divergenceBuffer),
		entry(7, resources.pressureABuffer),
		entry(8, resources.pressureBBuffer)
	];
}

export function webGpuBindGroupEntries3d(entryPoint, resources) {
	switch (entryPoint) {
		case "deposit_particles":
			return [
				entry(0, resources.uniformBuffer),
				entry(1, resources.currentParticleBuffer),
				entry(3, resources.gridBuffer)
			];
		case "transfer_grid_to_particles_flip":
			return [
				entry(0, resources.uniformBuffer),
				entry(1, resources.currentParticleBuffer),
				entry(2, resources.nextParticleBuffer),
				entry(4, resources.surfacePointBuffer),
				entry(5, resources.gridVelocityBuffer),
				entry(9, resources.previousGridVelocityBuffer)
			];
		case "transfer_grid_to_particles":
			return [
				entry(0, resources.uniformBuffer),
				entry(1, resources.currentParticleBuffer),
				entry(2, resources.nextParticleBuffer),
				entry(4, resources.surfacePointBuffer),
				entry(5, resources.gridVelocityBuffer)
			];
		case "integrate_particles":
			return [
				entry(0, resources.uniformBuffer),
				entry(1, resources.currentParticleBuffer),
				entry(2, resources.nextParticleBuffer)
			];
		case "clear_grid":
		case "apply_grid_forces":
			return [
				entry(0, resources.uniformBuffer),
				entry(3, resources.gridBuffer)
			];
		case "normalize_grid":
			return [
				entry(0, resources.uniformBuffer),
				entry(3, resources.gridBuffer),
				entry(5, resources.gridVelocityBuffer)
			];
		case "compute_divergence":
		case "jacobi_pressure_a":
		case "jacobi_pressure_b":
			return pressureEntries(resources);
		case "project_grid_velocity":
			return [
				entry(0, resources.uniformBuffer),
				entry(5, resources.gridVelocityBuffer),
				entry(7, resources.pressureABuffer)
			];
		case "compute_vorticity":
		case "apply_vorticity_confinement":
			return [
				entry(0, resources.uniformBuffer),
				entry(5, resources.gridVelocityBuffer),
				entry(10, resources.vorticityBuffer)
			];
		case "store_grid_history":
			return [
				entry(0, resources.uniformBuffer),
				entry(5, resources.gridVelocityBuffer),
				entry(9, resources.previousGridVelocityBuffer)
			];
		case "pack_surface_points":
			return [
				entry(0, resources.uniformBuffer),
				entry(1, resources.nextParticleBuffer),
				entry(4, resources.surfacePointBuffer)
			];
		default:
			throw new Error(`Unsupported WebGPU liquid entry point: ${entryPoint}`);
	}
}
