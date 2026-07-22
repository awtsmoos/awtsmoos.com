// B"H
// Boruch Hashem
// Blessed is He
/** Persistent realism advances PIC/FLIP, secondary physics, optics, and buffers. */

import { stepParticleGridLiquid3d } from "../../liquid3d/stepParticleGridLiquid3d.js";
import { createLiquidOpticalProfile3d } from "../createLiquidOpticalProfile3d.js";
import { createLiquidSecondaryParticleSystems3d } from "../createLiquidSecondaryParticleSystems3d.js";
import { advanceSecondaryParticleSystem3d } from "./advanceSecondaryParticleSystem3d.js";
import { compilePersistentLiquidRenderArtifacts3d } from "./compilePersistentLiquidRenderArtifacts3d.js";
import { mergeSecondaryParticleSystems3d } from "./mergeSecondaryParticleSystems3d.js";
import { liquidDomainBounds } from "./secondaryParticleBounds.js";

/** Advances one complete realtime liquid frame. */
export function stepPersistentRealtimeLiquid3d(state, options = {}) {
	const deltaTime = Math.max(1e-6, Number(options.deltaTime ?? options.physics?.deltaTime ?? 1 / 60));
	const physics = stepParticleGridLiquid3d(state.liquidState, {
		...options.physics,
		deltaTime
	});
	const nextTime = state.time + deltaTime;
	const bounds = liquidDomainBounds(physics.state, Number(options.domainMargin ?? 0));
	const emitted = createLiquidSecondaryParticleSystems3d(
		physics.state,
		options.secondaryParticles
	).systems;
	const systems = {};
	for (const role of ["spray", "foam", "bubble", "mist"]) {
		const advanced = advanceSecondaryParticleSystem3d(
			state.secondarySystems[role],
			role,
			deltaTime,
			nextTime,
			bounds,
			options.secondaryDynamics
		);
		systems[role] = mergeSecondaryParticleSystems3d(
			advanced,
			emitted[role],
			role,
			options.budgets
		);
	}
	const primaryCount = Math.max(1, physics.state.particleSystem.particles.length);
	const optics = createLiquidOpticalProfile3d(physics.state, {
		...options.optics,
		foamCoverage: systems.foam.particles.length / primaryCount
	});
	const render = compilePersistentLiquidRenderArtifacts3d(systems, options);
	return Object.freeze({
		schema: state.schema,
		liquidState: physics.state,
		frame: state.frame + 1,
		time: nextTime,
		secondarySystems: Object.freeze(systems),
		optics,
		render,
		report: Object.freeze({
			physics: physics.report,
			emitted: Object.freeze(Object.fromEntries(
				Object.entries(emitted).map(([role, system]) => [role, system.particles.length])
			)),
			counts: render.counts
		})
	});
}
