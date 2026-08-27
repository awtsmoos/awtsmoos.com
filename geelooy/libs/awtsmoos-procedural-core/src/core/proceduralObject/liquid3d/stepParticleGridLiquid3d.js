// B"H
// Boruch Hashem
// Blessed is He
/** Repeated bounded substeps renew one deterministic liquid state. */

import { createParticleSystem } from "../particles/createParticleSystem.js";
import { createLiquidSecondaryParticleEvents3d } from "./createLiquidSecondaryParticleEvents3d.js";
import { createLiquidSurface3d } from "./createLiquidSurface3d.js";
import { createParticleGridLiquidState } from "./createParticleGridLiquidState.js";
import { measureLiquidState3d } from "./measureLiquidState3d.js";
import { planLiquidSubsteps3d } from "./planLiquidSubsteps3d.js";
import { runPlannedLiquidFrame3d } from "./runPlannedLiquidFrame3d.js";

function secondaryOptions(options) {
	if (options.secondaryParticles === false) return null;
	return typeof options.secondaryParticles === "object"
		? options.secondaryParticles
		: {};
}

function createNextState(state, result, plan) {
	const particleSystem = createParticleSystem({
		...result.particleSystem,
		tick: state.particleSystem.tick + 1,
		time: state.particleSystem.time + plan.deltaTime
	});
	return createParticleGridLiquidState({
		...state,
		tick: state.tick + 1,
		time: state.time + plan.deltaTime,
		particleSystem,
		massGrid: result.massGrid,
		velocityGrid: result.velocityGrid,
		previousVelocityGrid: result.previousVelocityGrid,
		blend: result.blend
	});
}

function createFrameReport(nextState, result, plan) {
	return Object.freeze({
		...measureLiquidState3d(nextState, { deltaTime: plan.deltaTime }),
		...result.report,
		substeps: plan.substeps,
		substepPlan: plan,
		qualityProfile: plan.profile.name
	});
}

/**
 * Advances PIC/FLIP liquid with CFL-bounded work and derived secondary events.
 * @returns {{state:Object,surface:Object|null,secondaryParticleEvents:Object[],report:Object}}
 * @complexity O(substeps × (particles + grid cells + pressure iterations)).
 * @deterministic Always for equal canonical state and options.
 * @sideEffects None.
 * @resourceBehavior Work and secondary events are explicitly bounded.
 */
export function stepParticleGridLiquid3d(input, options = {}) {
	const state = createParticleGridLiquidState(input);
	const plan = planLiquidSubsteps3d(state, options);
	const result = runPlannedLiquidFrame3d(state, options, plan);
	const nextState = createNextState(state, result, plan);
	const report = createFrameReport(nextState, result, plan);
	const eventOptions = secondaryOptions(options);
	const surfaceOptions = options.surface === true ? {} : options.surface;
	return Object.freeze({
		state: nextState,
		surface: surfaceOptions
			? createLiquidSurface3d(nextState, surfaceOptions)
			: null,
		secondaryParticleEvents: eventOptions
			? createLiquidSecondaryParticleEvents3d(nextState, report, eventOptions)
			: Object.freeze([]),
		report
	});
}
