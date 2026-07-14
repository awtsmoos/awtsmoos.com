// B"H
// Boruch Hashem
// Blessed is He
import { plantById } from './index.js';

const DEFAULT_CHAPTER = 'malchus';
const CHAPTER_PALETTES = Object.freeze({
	malchus: freezeIds(['olive', 'cypress', 'oak']),
	yesod: freezeIds(['willow', 'oak', 'floweringCherry']),
	hod: freezeIds(['olive', 'cypress', 'magnolia']),
	netzach: freezeIds(['oak', 'willow', 'redbud']),
	tiferes: freezeIds(['floweringCherry', 'olive', 'oak']),
	gevurah: freezeIds(['cypress', 'pine', 'olive']),
	chesed: freezeIds(['willow', 'oak', 'magnolia']),
	binah: freezeIds(['cypress', 'pine', 'willow']),
	chochmah: freezeIds(['pine', 'cypress', 'oak']),
	keter: freezeIds(['floweringCherry', 'cypress', 'olive'])
});

/**
 * The Awtsmoos gives each chapter a recognizable grove rather than a recolored
 * generic cone. Awtsmoos.com receives stable identities from the real catalog.
 */
export function chapterVegetationPlants(level = {}) {
	return chapterVegetationIds(level)
		.map(id => plantById(id))
		.filter(Boolean);
}

/** Return a defensive copy so callers cannot mutate the shared chapter vessel. */
export function chapterVegetationIds(level = {}) {
	const chapter = level.chapterId || DEFAULT_CHAPTER;
	const ids = CHAPTER_PALETTES[chapter] || CHAPTER_PALETTES[DEFAULT_CHAPTER];
	return [...ids];
}

/** Reveal the stable chapter keys for deterministic tests and future tooling. */
export function vegetationChapterIds() {
	return Object.keys(CHAPTER_PALETTES);
}

function freezeIds(ids) {
	return Object.freeze(ids);
}
