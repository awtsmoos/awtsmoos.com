// B"H
// Boruch Hashem
// Blessed is He

/** Boots the historical complete valley as a strict, fully clothed cinema runtime. */
import { BootPhaseTracker } from '../app/BootPhaseTracker.js';
import { createPlayableEretzRuntime } from '../bundles/PlayableRuntimeBundleEntry.js';
import {
	enrichMovieAuthoredWorld,
	prepareMovieAuthoredAssetOptions
} from './MovieAuthoredWorldAssets.js';

export async function createMovieAuthoredWorldRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const boot = new BootPhaseTracker(undefined, environment);
	globalThis.AwtsmoosBootTracker = boot;
	try {
		boot.begin('movie-authored-assets');
		const assets = await prepareMovieAuthoredAssetOptions(options);
		const core = await createPlayableEretzRuntime(hosts, {
			...options,
			assets,
			environment,
			quality: options.quality || 'cinematic',
			startLoop: false
		}, boot);
		const { diagnostics, runtime } = core;
		diagnostics.movieRuntimeKind = 'authored-eretz';
		runtime.movieAuthoredWorldReady = enrichMovieAuthoredWorld(core, options);
		diagnostics.enrichmentPromise = runtime.movieAuthoredWorldReady;
		environment.AwtsmoosDiagnostics = diagnostics;
		boot.complete();
		return diagnostics;
	} catch (error) {
		boot.fail(error);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) globalThis.AwtsmoosBootTracker = null;
	}
}

export default createMovieAuthoredWorldRuntime;
