// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverDynamics.js
 * @description Couples authored hydrology to the shared bounded fluid-channel solver for living current.
 * The Awtsmoos carries one river through stable banks and changing vortices; Awtsmoos.com lets gameplay,
 * grass, animals, foam, sound, and future interaction sample one mutable current without inventing another river.
 */

import { createRiverFlowRuntime } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/RiverFlowPlanner.js';
import { sampleVillageRiverBaseFlow } from './VillageRiverBaseFlow.js';

export function createVillageRiverDynamics(hydrology) {
	const flow = createRiverFlowRuntime({
		fixedStep: 1 / 24,
		maxSubsteps: 2,
		profileSamples: 25,
		quality: 'low',
		sampleAt: t => profileSample(hydrology, t)
	});
	const baseSamples = hydrology.points.map(point => sampleVillageRiverBaseFlow(hydrology, point.t));
	return Object.freeze({
		advance: deltaSeconds => flow.advance(deltaSeconds),
		diagnostics: () => riverDiagnostics(flow, baseSamples),
		disturb: (t, lateral, impulse) => flow.disturb(t, lateral, impulse),
		sampleAt: (t, context = {}) => dynamicSample(hydrology, flow, t, context),
		stats: initialStats(flow, baseSamples)
	});
}

export function sampleVillageRiverDynamics(hydrology, t, context = {}) {
	return sampleVillageRiverBaseFlow(hydrology, t, context);
}

function dynamicSample(hydrology, flow, t, context) {
	const base = sampleVillageRiverBaseFlow(hydrology, t, context);
	const lateral = lateralCoordinate(base.width, context);
	const state = flow.sample(base.t, lateral, {});
	const normal = { x: -base.tangent.z, z: base.tangent.x };
	const velocity = {
		x: base.tangent.x * state.flow + normal.x * state.crossFlow,
		y: base.velocity.y,
		z: base.tangent.z * state.flow + normal.z * state.crossFlow
	};
	const surfaceY = base.surfaceY + state.surfaceOffset;
	const worldY = Number(context.worldY);
	const submersion = Number.isFinite(worldY) ? Math.max(0, surfaceY - worldY) : base.submersion;
	return Object.freeze({
		...base,
		bankShear: clamp01(base.bankShear * 0.65 + state.speed / 3.2 * 0.35),
		cascadeEnergy: Math.max(base.cascadeEnergy, state.cascade),
		depth: state.depth,
		foam: state.foam,
		speed: Math.hypot(velocity.x, velocity.z),
		submersion,
		surfaceOffset: state.surfaceOffset,
		surfaceY,
		turbulence: clamp01(base.turbulence * 0.5 + Math.abs(state.vorticity) * 0.5),
		velocity: Object.freeze(velocity),
		vorticity: state.vorticity
	});
}

function profileSample(hydrology, t) {
	const sample = sampleVillageRiverBaseFlow(hydrology, t);
	return {
		cascade: sample.cascadeEnergy,
		depth: sample.depth,
		speed: sample.speed
	};
}

function lateralCoordinate(width, context) {
	const signed = Number(context.lateralSigned ?? context.lateralOffset ?? 0);
	return clamp01(0.5 + signed / Math.max(0.2, width * 2));
}

function initialStats(flow, samples) {
	return Object.freeze({
		maximumCascadeEnergy: maximum(samples, 'cascadeEnergy'),
		maximumSpeed: maximum(samples, 'speed'),
		maximumTurbulence: maximum(samples, 'turbulence'),
		model: 'shared-fluid-channel-v2',
		sampleCount: samples.length,
		sections: flow.diagnostics().sections
	});
}

function riverDiagnostics(flow, samples) {
	return Object.freeze({
		...initialStats(flow, samples),
		fluid: flow.diagnostics()
	});
}

function maximum(values, key) {
	return values.reduce((result, value) => Math.max(result, Number(value[key]) || 0), 0);
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
