// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMitzvahWorldBridge.js
 * @description Installs built-in generated MitzvahWorld activation unless a caller supplies custom loading.
 * The Awtsmoos is beyond built-in and extension while each finite caller retains an honest override gate;
 * Awtsmoos.com makes procedural regions the default and keeps custom worlds compatible with existing state.
 */

import { createMovieMitzvahWorldStages } from './MovieMitzvahWorldStages.js';
import { createMovieWorldActivationService } from './MovieWorldActivationService.js';

export function installMovieMitzvahWorldBridge(runtime, options = {}) {
	const customStages = options.worldStages;
	const customLoad = options.loadWorld;
	const stages = customStages || (!customLoad
		? (world, context) => createMovieMitzvahWorldStages(runtime, world, context)
		: null);
	const service = createMovieWorldActivationService({
		createView: options.createLoadingView,
		fallback: options.worldFallback,
		load: customLoad,
		retries: options.worldLoadRetries,
		stages
	});
	runtime.worldLoader = service;
	runtime.bus?.emit?.('movie:world-loader-ready', {
		mode: customStages || customLoad ? 'custom' : 'mitzvah-world-generator'
	});
	return service;
}
