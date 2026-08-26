// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureOperations.js
 * @description Assembles standard Nature results for mutable river motion, immutable river reaches, and immutable water basins.
 * The Awtsmoos renews current, channel, pond, and shore before one facade chooses a doorway; Awtsmoos.com keeps their
 * operation assembly together while the physical and spatial authorities remain separate keilim carrying distinct light.
 */

import { createRiverFlowRuntime } from '../ecosystem/RiverFlowPlanner.js';
import { createRiverReachPlan } from '../ecosystem/RiverReachPlan.js';
import { createWaterBasinPlan } from '../ecosystem/WaterBasinPlan.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { waterRealismPolicy } from './NatureRealismPolicy.js';
import { waterSolverQuality } from './WaterNaturePresets.js';
import { waterPhysicalOptions } from './WaterNatureRequest.js';

/** Creates the legacy mutable river-runtime Nature result without changing its seed identity. */
export function createWaterRuntimeNatureResult(defaults, request) {
	const context = createNatureCallContext(
		defaults,
		request.options,
		'water',
		request.presetName
	);
	const realism = waterRealismPolicy(context.realism);
	const runtime = createRiverFlowRuntime({
		...waterPhysicalOptions(request, realism),
		quality: waterSolverQuality(context.quality)
	});
	return createNatureResult('river-runtime', context, runtime, {
		...runtime.diagnostics(),
		preset: request.presetName
	});
}

/** Creates an immutable world-space river-reach Nature result. */
export function createWaterReachNatureResult(defaults, request) {
	const context = createNatureCallContext(
		defaults,
		request.options,
		'water',
		`${request.presetName}:reach`
	);
	const realism = waterRealismPolicy(context.realism);
	const plan = createRiverReachPlan({
		...waterPhysicalOptions(request, realism),
		seed: context.seed
	});
	return createNatureResult('river-reach-plan', context, plan, {
		...plan.summary,
		pathSeed: plan.seed,
		preset: request.presetName
	});
}

/** Creates an immutable pond, lake, or wetland spatial Nature result. */
export function createWaterBasinNatureResult(defaults, kind, options = {}) {
	const basinKind = String(kind || 'pond').toLowerCase();
	const context = createNatureCallContext(
		defaults,
		options,
		'water',
		`${basinKind}:basin`
	);
	const plan = createWaterBasinPlan(basinKind, {
		...options,
		seed: context.seed
	});
	return createNatureResult('water-basin-plan', context, plan, {
		...plan.summary,
		kind: basinKind,
		shapeSeed: plan.seed
	});
}
