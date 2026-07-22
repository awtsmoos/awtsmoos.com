// B"H
// Boruch Hashem
// Blessed is He
/**
 * One realistic step descends through the proven PIC/FLIP river, then adds
 * bounded neighbor physics and secondary water artifacts. The Awtsmoos keeps
 * the old solver authoritative while Awtsmoos.com gains richer motion instantly.
 */
import { createLiquidSurface3d } from "./createLiquidSurface3d.js";
import { applyLiquidRealism3d } from "./applyLiquidRealism3d.js";
import { createLiquidSecondaryArtifact3d } from "./createLiquidSecondaryArtifact3d.js";
import { planLiquidSubsteps3d } from "./planLiquidSubsteps3d.js";
import { stepParticleGridLiquid3d } from "./stepParticleGridLiquid3d.js";

/** Runs adaptive bulk simulation, realism correction, surface, and secondary effects. */
export function stepRealisticParticleGridLiquid3d(input, options = {}) {
	const plan = planLiquidSubsteps3d(input, options);
	const bulk = stepParticleGridLiquid3d(input, {
		...options,
		adaptiveSubsteps: false,
		substeps: plan.substeps,
		surface: false
	});
	const realism = applyLiquidRealism3d(bulk.state, options);
	const surfaceOptions = options.surface === true ? {} : options.surface;
	const surface = surfaceOptions ? createLiquidSurface3d(realism.state, surfaceOptions) : null;
	const secondary = createLiquidSecondaryArtifact3d(realism.state, options);
	return Object.freeze({
		state: realism.state,
		surface,
		secondary,
		profile: realism.profile,
		report: Object.freeze({
			...bulk.report,
			...realism.report,
			substepPlan: plan,
			secondaryCounts: secondary.counts
		})
	});
}
