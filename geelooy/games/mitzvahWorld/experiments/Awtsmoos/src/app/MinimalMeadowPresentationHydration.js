// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationHydration.js
 * @description Loads the full rich UI and animation graph without blocking first-control readiness.
 * The Awtsmoos lets the playable ground remain while its complete visible garment arrives;
 * Awtsmoos.com keeps parallel imports, install order, stage truth, receipts, and failure recovery explicit.
 */

export async function hydrateMinimalMeadowPresentation(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	runtime.richPresentationStage = 'loading';
	try {
		const modules = await resolvePresentationModules(dependencies);
		runtime.richPresentationStage = 'installing';
		const ui = modules.ui.installMinimalMeadowUi(
			runtime,
			environment.document || globalThis.document,
			environment
		);
		const animation = modules.animation.installMinimalMeadowAnimation(runtime);
		const receipt = Object.freeze({
			animation: Boolean(animation),
			ready: Boolean(ui && animation),
			ui: Boolean(ui)
		});
		runtime.richPresentationReceipt = receipt;
		runtime.richPresentationStage = receipt.ready ? 'ready' : 'failed';
		runtime.bus?.emit?.('world:rich-presentation-ready', receipt);
		return receipt;
	} catch (error) {
		runtime.richPresentationStage = 'failed';
		runtime.richPresentationError = Object.freeze({
			message: error?.message || String(error),
			name: error?.name || 'Error'
		});
		const receipt = Object.freeze({
			error: runtime.richPresentationError,
			ready: false
		});
		runtime.bus?.emit?.('world:rich-presentation-failed', receipt);
		return receipt;
	}
}

async function resolvePresentationModules(dependencies) {
	if (dependencies.ui && dependencies.animation) {
		return {
			animation: dependencies.animation,
			ui: dependencies.ui
		};
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	const [ui, animation] = await Promise.all([
		importer('./MinimalMeadowUi.js'),
		importer('./MinimalMeadowAnimationState.js')
	]);
	return { animation, ui };
}
