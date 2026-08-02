// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureBundle.js
 * @description Starts rich presentation and full world authority in parallel without blocking play.
 * The Awtsmoos lets every complete garment arrive beyond the first usable breath;
 * Awtsmoos.com preserves UI, animation, systems, models, shaders, NPCs, proof, and atomic handoff.
 */

import {
	hydrateMinimalMeadowOptionalFeatures
} from './MinimalMeadowOptionalHydration.js';
import {
	hydrateMinimalMeadowPresentation
} from './MinimalMeadowPresentationHydration.js';

export function installMinimalMeadowFeatures(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	const hydratePresentation = dependencies.hydratePresentation
		|| hydrateMinimalMeadowPresentation;
	const installWorldSystems = dependencies.installWorldSystems
		|| defaultWorldInstaller;
	const hydrateOptional = dependencies.hydrateOptional
		|| hydrateMinimalMeadowOptionalFeatures;
	const presentationPromise = Promise.resolve().then(() => {
		return hydratePresentation(runtime, environment, dependencies.presentation);
	});
	const handoffPromise = Promise.resolve().then(() => {
		return installWorldSystems(runtime, environment);
	});
	const optionalPromise = Promise.resolve().then(() => {
		return hydrateOptional(runtime, environment, {
			handoffPromise,
			importer: dependencies.importer,
			modules: dependencies.optionalModules
		});
	});
	Object.assign(runtime, {
		optionalFeaturePromise: optionalPromise,
		richPresentationPromise: presentationPromise
	});
	return Object.freeze({
		essential: bootstrapEssentialReceipt(runtime),
		handoffPromise,
		optionalPromise,
		presentationPromise,
		ready: true
	});
}

function bootstrapEssentialReceipt(runtime) {
	const values = {
		combat: Boolean(runtime.combat),
		equipment: Boolean(runtime.equipment),
		inventory: Boolean(runtime.inventoryStore),
		quest: Boolean(runtime.questStore || runtime.quest),
		recovery: Boolean(runtime.recovery),
		streaming: Boolean(runtime.expansion?.streaming),
		ui: Boolean(runtime.ui),
		world: Boolean(runtime.scene && runtime.state)
	};
	const missing = Object.entries(values)
		.filter(([, ready]) => !ready)
		.map(([name]) => name);
	return Object.freeze({
		...values,
		missing: Object.freeze(missing),
		ready: missing.length === 0
	});
}

async function defaultWorldInstaller(runtime, environment) {
	const module = await import('./MinimalMeadowWorldSystems.js');
	return module.installMinimalMeadowWorldSystems(runtime, environment);
}
