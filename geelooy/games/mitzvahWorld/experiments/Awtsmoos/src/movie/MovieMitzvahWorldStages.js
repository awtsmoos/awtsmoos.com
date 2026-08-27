// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMitzvahWorldStages.js
 * @description Creates weighted world-spec, essential, package, region, rich, atmosphere, and receipt stages.
 * The Awtsmoos reveals one world through ordered finite covenants without becoming divided by their names;
 * Awtsmoos.com lets progress, retry, fallback, cancellation, and diagnostics follow the selfsame frames.
 */

import {
	applyMovieWorldAtmosphere,
	awaitMovieWorldEssential,
	awaitMovieWorldRich,
	movieWorldRuntimeReceipt,
	positionMovieWorldRegion,
	transitionMovieWorldPackage
} from './MovieMitzvahWorldRuntime.js';
import { compileMovieWorldPrompt } from './MovieWorldPromptCompiler.js';
import { isMovieWorldSpec, normalizeMovieWorldSpec } from './MovieWorldSpec.js';

export function createMovieMitzvahWorldStages(runtime, world, context = {}) {
	const spec = resolveMovieWorldSpec(world, context);
	return [
		stage('spec', 'Compiling deterministic world', 1, async () => spec),
		stage('essential', 'Preparing essential MitzvahWorld systems', 3, async () => (
			awaitMovieWorldEssential(runtime)
		)),
		stage('package', `Opening ${spec.packageId}`, 2, async () => (
			transitionMovieWorldPackage(runtime, spec)
		)),
		stage('region', `Entering ${spec.label}`, 2, async () => (
			positionMovieWorldRegion(runtime, spec)
		)),
		stage('rich-world', 'Hydrating houses, water, trees, NPCs, and quests', 4, async () => (
			awaitMovieWorldRich(runtime)
		)),
		stage('atmosphere', 'Applying cinematic atmosphere and population intent', 1, async () => (
			applyMovieWorldAtmosphere(runtime, spec)
		)),
		stage('receipt', 'Publishing generated world receipt', 1, async () => (
			movieWorldRuntimeReceipt(runtime, spec)
		))
	];
}

export function resolveMovieWorldSpec(world, context = {}) {
	if (isMovieWorldSpec(world)) return normalizeMovieWorldSpec(world);
	if (world && typeof world === 'object' && world.regionId) {
		return normalizeMovieWorldSpec(world, context);
	}
	const prompt = typeof world === 'string'
		? world
		: world?.prompt || world?.label || world?.id || context.prompt;
	return compileMovieWorldPrompt(prompt, {
		label: world?.label || context.label,
		scope: context.sceneId || context.scope,
		seed: world?.seed || context.seed
	});
}

function stage(id, label, weight, load) {
	return { id, label, load, weight };
}
