// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieWorldPromptCompiler.js
 * @description Compiles story language into a deterministic MinimalMeadow world specification.
 * The Awtsmoos is beyond word and landscape while every phrase may reveal a fitting finite chamber;
 * Awtsmoos.com joins prompt, seed, region catalog, quest pressure, ambience, population, and camera.
 */

import { MINIMAL_MEADOW_DEMON_QUEST } from '../app/MinimalMeadowQuestDefinition.js';
import { MINIMAL_MEADOW_REGIONS } from '../app/MinimalMeadowRegionCatalog.js';
import { createMovieProceduralRandom, hashMovieProceduralText } from './MovieProceduralSeed.js';
import {
	hasMovieWorldWords,
	movieWorldAmbience,
	movieWorldAssets,
	movieWorldCameraRigs,
	movieWorldTimeOfDay,
	movieWorldVegetation,
	movieWorldWeather
} from './MovieWorldPromptHeuristics.js';
import { normalizeMovieWorldSpec } from './MovieWorldSpec.js';

const REGION_HINTS = Object.freeze({
	'cedar-terraces': ['cedar', 'forest', 'wood', 'trees'],
	'eastern-road': ['road', 'journey', 'merchant', 'travel'],
	'letter-quarry': ['letter', 'hebrew', 'quarry', 'stone'],
	'northern-hill': ['hill', 'watch', 'summit', 'horizon'],
	'river-rise': ['river', 'water', 'bridge', 'current'],
	'village-heart': ['village', 'home', 'house', 'market', 'family'],
	'warden-summit': ['warden', 'battle', 'demon', 'guardian'],
	'wet-meadow': ['meadow', 'reeds', 'flowers', 'marsh'],
	'western-slope': ['training', 'ash', 'slope', 'western']
});

export function compileMovieWorldPrompt(prompt, options = {}) {
	const text = String(prompt || options.prompt || 'village heart');
	const lower = text.toLowerCase();
	const seed = Number(options.seed) || hashMovieProceduralText(text);
	const random = createMovieProceduralRandom(seed, options.scope || 'movie-world');
	const region = chooseRegion(lower, random);
	const pressure = region.encounterPressure || 'low';
	const combat = hasMovieWorldWords(
		lower,
		['battle', 'fight', 'demon', 'danger', 'quest', 'warden']
	);
	const quiet = hasMovieWorldWords(
		lower,
		['peace', 'quiet', 'prayer', 'family', 'home', 'rest']
	);
	return normalizeMovieWorldSpec({
		assets: movieWorldAssets(lower, region),
		atmosphere: {
			ambience: movieWorldAmbience(lower, region),
			mood: combat ? 'urgent' : quiet ? 'contemplative' : 'hopeful',
			timeOfDay: movieWorldTimeOfDay(lower, random),
			weather: movieWorldWeather(lower, random)
		},
		camera: {
			energy: combat ? 'kinetic' : quiet ? 'still' : 'measured',
			preferredRigs: movieWorldCameraRigs(combat, quiet, random),
			shotScale: combat ? 'dynamic' : 'cinematic'
		},
		label: options.label || region.name,
		packageId: region.packageId,
		population: {
			crowd: quiet ? random.integer(2, 8) : random.integer(6, 22),
			enemies: combat ? random.integer(1, pressure === 'high' ? 8 : 4) : 0,
			npcs: random.integer(3, quiet ? 10 : 16),
			vegetation: movieWorldVegetation(region.id)
		},
		prompt: text,
		quest: combat ? { enabled: true, id: MINIMAL_MEADOW_DEMON_QUEST.id } : null,
		regionId: region.id,
		seed
	});
}

function chooseRegion(text, random) {
	const scored = MINIMAL_MEADOW_REGIONS.map(region => ({
		region,
		score: (REGION_HINTS[region.id] || []).filter(word => text.includes(word)).length
	}));
	const maximum = Math.max(...scored.map(item => item.score));
	const candidates = scored.filter(item => item.score === maximum).map(item => item.region);
	return random.pick(candidates.length ? candidates : MINIMAL_MEADOW_REGIONS);
}
