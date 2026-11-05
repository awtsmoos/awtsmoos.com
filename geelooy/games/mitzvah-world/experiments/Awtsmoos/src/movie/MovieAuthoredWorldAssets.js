// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoredWorldAssets.js
 * @description Preloads canonical surfaces, one animated Chossid, and real nature for the authored cinema valley.
 * The Awtsmoos clothes earth and traveler from their own sources; Awtsmoos.com makes production wait
 * for textured houses, bound bones, real plants, and strict surfaces rather than accepting startup substitutes.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { loadFirstImage } from '../app/EretzAssetLoader.js';
import {
	ESSENTIAL_MILESTONES,
	completeMitzvahWorldEssentialMilestone,
	peekMitzvahWorldEssentialLedger
} from '../app/MitzvahWorldEssentialBoot.js';
import { GRASS_URLS } from '../world/TerrainTextureCatalog.js';
import { createRealNatureSystem } from '../world/nature/RealNatureSystem.js';
import { hydrateMovieAuthoredPlayer } from './MovieAuthoredWorldPlayer.js';
import { hydrateMovieAuthoredWorldTextures } from './MovieAuthoredWorldTextureHydrator.js';

export async function prepareMovieAuthoredAssetOptions(options = {}) {
	const grass = await loadFirstImage(GRASS_URLS, options.textureTimeoutMs || 30000);
	if (!grass) throw new Error('Authored Movie world could not decode canonical grass.');
	return {
		...(options.assets || {}),
		houseLoader: () => loadStrictHouseAssets(options.textureTimeoutMs)
	};
}

export async function enrichMovieAuthoredWorld(core, options = {}) {
	const { runtime, qualityProfile } = core;
	const player = await hydrateMovieAuthoredPlayer(runtime, options);
	// The strict authored-player gate above has just proven the canonical
	// chossid.glb decoded with animation clips bound to its channels — the
	// exact fact the essential gate's CANONICAL_CHOSSID_DECODED milestone
	// names, previously published only on the staged single-player path.
	publishCanonicalChossidFact(options.environment || globalThis, player);
	const realNature = await createRealNatureSystem({
		cancelFrame: options.cancelFrame,
		groundSampler: runtime.groundSampler,
		group: runtime.terrain.group,
		quality: qualityProfile.quality,
		requestFrame: options.requestFrame,
		yieldControl: options.yieldControl
	});
	const nature = realNature.snapshot();
	if (nature.failures.length || nature.installed < 5) {
		realNature.destroy();
		throw new Error(`Authored Movie nature failed: ${JSON.stringify(nature)}`);
	}
	runtime.realNature = realNature;
	const textures = await hydrateMovieAuthoredWorldTextures(runtime.scene, options);
	return Object.freeze({ nature, player, status: 'ready', textures });
}

/**
 * Testifies the canonical-chossid fact only when a guarded ledger already
 * lives in this environment; unguarded contexts publish nothing and never
 * create a gate by accident. Testimony must never break enrichment.
 */
function publishCanonicalChossidFact(environment, player) {
	if (!peekMitzvahWorldEssentialLedger(environment)) return;
	try {
		completeMitzvahWorldEssentialMilestone(
			environment,
			ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED,
			{
				importerStage: 'movie-authored-player',
				resourceStatus: `clips-${player?.receipt?.animations ?? 0}`
			}
		);
	} catch { /* the world outranks its own testimony */ }
}

async function loadStrictHouseAssets(timeoutMs) {
	const assets = await loadHouseAssets(urls => loadFirstImage(urls, timeoutMs || 30000));
	if (assets.houseMaterialDegradation.length) {
		throw new Error(`Authored house textures failed: ${JSON.stringify(assets.houseMaterialDegradation)}`);
	}
	return assets;
}
