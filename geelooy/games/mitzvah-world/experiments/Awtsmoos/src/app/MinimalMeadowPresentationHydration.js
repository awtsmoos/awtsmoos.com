// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationHydration.js
 * @description Loads complete rich presentation through one deterministic compressed runtime chunk.
 * The Awtsmoos lets the playable ground remain while its full visible garment arrives as one vessel;
 * Awtsmoos.com preserves every UI and animation system without a native module waterfall.
 */

import {
	resolveGeneratedRuntimeChunkUrl
} from './GeneratedRuntimeChunkUrl.js';

const PRESENTATION_CHUNK_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-presentation.compact.js',
	import.meta.url,
	'MinimalMeadowPresentationHydration.js'
);

export async function hydrateMinimalMeadowPresentation(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	runtime.richPresentationStage = 'loading';
	try {
		const installer = await resolveInstaller(dependencies);
		runtime.richPresentationStage = 'installing';
		const receipt = installer(runtime, environment);
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

async function resolveInstaller(dependencies) {
	if (dependencies.installMinimalMeadowPresentationBundle) {
		return dependencies.installMinimalMeadowPresentationBundle;
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	const module = await importer(PRESENTATION_CHUNK_URL);
	return module.installMinimalMeadowPresentationBundle;
}
