// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMitzvahWorldStages.js
 * @description Creates deterministic loading stages from explicit world JSON or an opaque legacy region ID.
 * The Awtsmoos reveals one world through ordered finite covenants without becoming divided by their names;
 * Awtsmoos.com lets progress, retry, atmosphere, and diagnostics follow declared data rather than inferred claims.
 */

import {
	applyMovieWorldAtmosphere,
	awaitMovieWorldEssential,
	awaitMovieWorldRich,
	movieWorldRuntimeReceipt,
	positionMovieWorldRegion,
	transitionMovieWorldPackage
} from './MovieMitzvahWorldRuntime.js';
import { compileMovieWorldJson } from './MovieWorldJsonCompiler.js';
import { isMovieWorldSpec, normalizeMovieWorldSpec } from './MovieWorldSpec.js';

export function createMovieMitzvahWorldStages(runtime, world, context = {}) {
	const spec = resolveMovieWorldSpec(world, context);
	return [
		stage('spec', 'Normalizing deterministic world JSON', 1, async () => spec),
		stage('essential', 'Preparing essential MitzvahWorld systems', 3, async () => awaitMovieWorldEssential(runtime)),
		stage('package', `Opening ${spec.packageId}`, 2, async () => transitionMovieWorldPackage(runtime, spec)),
		stage('region', `Entering ${spec.label}`, 2, async () => positionMovieWorldRegion(runtime, spec)),
		stage('rich-world', 'Hydrating houses, water, trees, NPCs, and quests', 4, async () => awaitMovieWorldRich(runtime)),
		stage('atmosphere', 'Applying declared atmosphere and population intent', 1, async () => applyMovieWorldAtmosphere(runtime, spec)),
		stage('receipt', 'Publishing generated world receipt', 1, async () => movieWorldRuntimeReceipt(runtime, spec))
	];
}

export function resolveMovieWorldSpec(world, context = {}) {
	if (isMovieWorldSpec(world)) return normalizeMovieWorldSpec(world);
	if (typeof world === 'string') {
		return compileMovieWorldJson({
			id: world,
			label: context.label || world,
			regionId: world,
			seed: context.seed
		}, context);
	}
	if (world && typeof world === 'object' && !Array.isArray(world)) {
		return compileMovieWorldJson(world, context);
	}
	return compileMovieWorldJson({
		regionId: context.regionId || 'village-heart',
		seed: context.seed
	}, context);
}

function stage(id, label, weight, load) {
	return { id, label, load, weight };
}
