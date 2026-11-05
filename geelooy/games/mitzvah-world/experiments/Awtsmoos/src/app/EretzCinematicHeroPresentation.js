// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicHeroPresentation.js
 * @description Promotes the visible bootstrap traveler into the authored Chossid and installs the compressed presentation HUD strictly after gameplay is already live.
 * The Awtsmoos lets the humble first garment carry movement while the detailed garment descends from afar;
 * Awtsmoos.com opens hero and interface as optional beauty, preserving the local traveler and the measured meadow population whenever enrichment cannot complete.
 */

import { resolveGeneratedRuntimeChunkUrl } from './GeneratedRuntimeChunkUrl.js';

const OPTIONAL_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-optional.compact.js',
	import.meta.url,
	'EretzCinematicHeroPresentation.js'
);
const PRESENTATION_URL = resolveGeneratedRuntimeChunkUrl(
	'mitzvah-world-presentation.compact.js',
	import.meta.url,
	'EretzCinematicHeroPresentation.js'
);

/** Schedules one post-play hero/presentation promotion and never lets visual failure reject gameplay. */
export function scheduleEretzCinematicHeroPresentation(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.cinematicHeroPresentationPromise) {
		return runtime.cinematicHeroPresentationPromise;
	}
	runtime.cinematicHeroPresentationStage = 'scheduled';
	runtime.cinematicHeroPresentationPromise = installEretzCinematicHeroPresentation(
		runtime,
		environment,
		dependencies
	).catch(error => degradedReceipt(runtime, error));
	return runtime.cinematicHeroPresentationPromise;
}

/** Loads compressed visual chunks in parallel, hydrates the hero, then mounts UI/animation around the settled traveler. */
export async function installEretzCinematicHeroPresentation(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.cinematicHeroPresentation) return runtime.cinematicHeroPresentation;
	runtime.cinematicHeroPresentationStage = 'loading-chunks';
	const [optionalModule, presentationModule] = await Promise.all([
		dependencies.optionalModule || import(OPTIONAL_URL),
		dependencies.presentationModule || import(PRESENTATION_URL)
	]);
	runtime.cinematicHeroPresentationStage = 'hydrating-player';
	const player = await optionalModule.hydrateMinimalMeadowPlayer(runtime, environment);
	runtime.cinematicHeroPresentationStage = 'installing-presentation';
	const presentation = presentationModule.installMinimalMeadowPresentationBundle(
		runtime,
		environment
	);
	const playerStatus = runtime.canonicalPlayer?.status
		|| player?.status
		|| 'unknown';
	const receipt = Object.freeze({
		playerStatus,
		presentationReady: presentation?.ready !== false,
		status: playerStatus === 'ready' ? 'ready' : 'degraded'
	});
	runtime.cinematicHeroPresentation = receipt;
	runtime.cinematicHeroPresentationStage = receipt.status;
	return receipt;
}

function degradedReceipt(runtime, error) {
	runtime.cinematicHeroPresentationError = error;
	runtime.cinematicHeroPresentationStage = 'degraded';
	return Object.freeze({
		message: error?.message || String(error),
		playerStatus: runtime.canonicalPlayer?.status || 'unavailable',
		presentationReady: false,
		status: 'degraded'
	});
}
