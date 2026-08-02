// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowOptionalHydration.js
 * @description Hydrates full player, renderer, world, NPC, and visual quality behind playable authority.
 * The Awtsmoos lets every complete garment arrive without standing in the doorway;
 * Awtsmoos.com keeps parallel imports, dependency order, all-settled truth, and failure receipts explicit.
 */

export async function hydrateMinimalMeadowOptionalFeatures(
	runtime,
	environment,
	dependencies
) {
	const modules = await resolveOptionalModules(dependencies);
	const afterHandoff = callback => dependencies.handoffPromise.then(callback);
	const results = await Promise.allSettled([
		modules.player.hydrateMinimalMeadowPlayer(runtime, environment),
		modules.renderer.enhanceMinimalMeadowRenderer(runtime, environment),
		afterHandoff(() => runtime.richWorldPromise),
		afterHandoff(() => {
			return modules.friendly.installMinimalMeadowFriendlyNpcs(
				runtime,
				environment
			);
		}),
		afterHandoff(() => {
			return modules.visual.awaitMinimalMeadowVisualStability(runtime);
		})
	]);
	const receipt = optionalReceipt(results);
	runtime.optionalFeatureReceipt = receipt;
	runtime.bus?.emit?.('world:optional-ready', receipt);
	return receipt;
}

async function resolveOptionalModules(dependencies) {
	if (dependencies.modules) return dependencies.modules;
	const importer = dependencies.importer || (specifier => import(specifier));
	const [player, renderer, friendly, visual] = await Promise.all([
		importer('./MinimalMeadowPlayerHydration.js'),
		importer('./MinimalMeadowRendererEnhancement.js'),
		importer('./MinimalMeadowFriendlyNpcs.js'),
		importer('./MinimalMeadowVisualReadiness.js')
	]);
	return { friendly, player, renderer, visual };
}

function optionalReceipt(results) {
	return Object.freeze({
		failures: Object.freeze(results.flatMap(result => {
			return result.status === 'rejected'
				? [result.reason?.message || String(result.reason)]
				: [];
		})),
		ready: true,
		results: Object.freeze(results.map(result => result.status))
	});
}
