// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureBundle.js
 * @description Installs essential gameplay while optional module graphs remain dynamically sealed.
 * The Awtsmoos grants stores, combat, quests, and recovery before distant beauty enters sight;
 * Awtsmoos.com keeps models, rich shaders, friendly crowds, and visual proof beyond the first light.
 */
import { installMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js';
import { installMinimalMeadowWorldSystems } from './MinimalMeadowWorldSystems.js';

export async function installMinimalMeadowFeatures(
	runtime,
	environment = globalThis
) {
	const ui = installMinimalMeadowUi(
		runtime,
		environment.document || globalThis.document,
		environment
	);
	const animation = installMinimalMeadowAnimation(runtime);
	const world = await installMinimalMeadowWorldSystems(runtime, environment);
	const essential = essentialReceipt(runtime, ui, animation, world);
	if (!essential.ready) {
		throw new Error(`MINIMAL_MEADOW_ESSENTIAL_MISSING:${essential.missing.join(',')}`);
	}
	const optionalPromise = hydrateOptional(runtime, environment);
	runtime.optionalFeaturePromise = optionalPromise;
	return Object.freeze({
		essential,
		optionalPromise,
		ready: true
	});
}

function essentialReceipt(runtime, ui, animation, world) {
	const values = {
		animation: Boolean(animation),
		combat: Boolean(runtime.combat),
		equipment: Boolean(runtime.equipment),
		inventory: Boolean(runtime.inventoryStore),
		quest: Boolean(runtime.questStore || runtime.quest),
		recovery: Boolean(runtime.recovery),
		streaming: Boolean(runtime.expansion?.streaming),
		ui: Boolean(ui),
		world: Boolean(world)
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

async function hydrateOptional(runtime, environment) {
	const modules = await Promise.all([
		import('./MinimalMeadowPlayerHydration.js'),
		import('./MinimalMeadowRendererEnhancement.js'),
		import('./MinimalMeadowFriendlyNpcs.js'),
		import('./MinimalMeadowVisualReadiness.js')
	]);
	const results = await Promise.allSettled([
		modules[0].hydrateMinimalMeadowPlayer(runtime),
		modules[1].enhanceMinimalMeadowRenderer(runtime, environment),
		runtime.richWorldPromise,
		modules[2].installMinimalMeadowFriendlyNpcs(runtime, environment),
		modules[3].awaitMinimalMeadowVisualStability(runtime)
	]);
	const receipt = Object.freeze({
		failures: Object.freeze(results.flatMap(result => {
			return result.status === 'rejected'
				? [result.reason?.message || String(result.reason)]
				: [];
		})),
		ready: true,
		results: Object.freeze(results.map(result => result.status))
	});
	runtime.bus?.emit?.('world:optional-ready', receipt);
	return receipt;
}
