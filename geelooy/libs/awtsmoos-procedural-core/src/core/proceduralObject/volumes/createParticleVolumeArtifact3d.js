// B"H
// Boruch Hashem
// Blessed is He
/** Particles descend into dense diagnostics and sparse renderer-neutral bricks. */
import { createScalarGrid3d } from "./grid3d.js";
import { createSparseScalarBrickGrid3dFromDense } from "./sparseBrickGrid3d.js";
import { planParticleVolumeGrid3d } from "./particleVolumeGridPlan3d.js";
import { splatParticlesToVolume3d } from "./splatParticlesToVolume3d.js";

function sparse(grid, options) {
	return createSparseScalarBrickGrid3dFromDense(grid, {
		brickSize: options.brickSize ?? 8,
		threshold: options.threshold ?? 1e-5,
		background: 0
	});
}

/** Creates density, absorption, heat, and emission channels from particles. */
export function createParticleVolumeArtifact3d(system, options = {}) {
	const plan = planParticleVolumeGrid3d(system.particles, options);
	const fields = splatParticlesToVolume3d(system.particles, plan, options);
	const absorption = createScalarGrid3d({
		...fields.density,
		values: fields.density.values.map(value => value * Number(options.absorptionScale ?? 0.7))
	});
	return Object.freeze({
		schema: "awtsmoos.particle-volume-artifact-3d",
		sourceSystemId: system.id,
		tick: system.tick,
		gridPlan: plan,
		dense: fields,
		density: sparse(fields.density, options),
		absorption: sparse(absorption, options),
		temperature: sparse(fields.temperature, options),
		emission: sparse(fields.emission, options),
		phaseFunction: Object.freeze({
			type: options.phaseFunction ?? "henyey-greenstein",
			anisotropy: Number(options.anisotropy ?? 0.35)
		})
	});
}
