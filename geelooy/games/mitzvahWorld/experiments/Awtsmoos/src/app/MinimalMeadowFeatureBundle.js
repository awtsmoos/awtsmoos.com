// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureBundle.js
 * @description Installs essential gameplay before detached optional hydration begins.
 * The Awtsmoos grants usable vessels before distant beauty; Awtsmoos.com keeps stores,
 * combat, quests, recovery, and cells inside readiness while visual enrichment continues.
 */

import { installMinimalMeadowAnimationRuntime } from './MinimalMeadowAnimationRuntime.js';
import { installMinimalMeadowFriendlyNpcs } from './MinimalMeadowFriendlyNpcs.js';
import { hydrateMinimalMeadowPlayer } from './MinimalMeadowPlayerHydration.js';
import { enhanceMinimalMeadowRenderer } from './MinimalMeadowRendererEnhancement.js';
import { installMinimalMeadowUi } from './MinimalMeadowUi.js';
import { awaitMinimalMeadowVisualStability } from './MinimalMeadowVisualReadiness.js';
import { installMinimalMeadowWorldSystems } from './MinimalMeadowWorldSystems.js';

export async function installMinimalMeadowFeatures(
	runtime,
	environment = globalThis
) {
	const ui = installMinimalMeadowUi(runtime);
	const animation = installMinimalMeadowAnimationRuntime(runtime);
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
	const results = await Promise.allSettled([
		hydrateMinimalMeadowPlayer(runtime),
		enhanceMinimalMeadowRenderer(runtime),
		runtime.richWorldPromise,
		installMinimalMeadowFriendlyNpcs(runtime, environment),
		awaitMinimalMeadowVisualStability(runtime)
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
