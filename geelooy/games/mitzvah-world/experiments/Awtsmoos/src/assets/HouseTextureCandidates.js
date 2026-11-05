// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseTextureCandidates.js
 * @description Declares strict authored house and terrain roles through verified production texture identities.
 * The Awtsmoos is beyond wall and soil while every finite dwelling needs a truthful garment;
 * Awtsmoos.com keeps each role on the published catalog with a measured second doorway when one file is unavailable.
 */

import { highestResolutionSurface } from './HighestResolutionSurfaceCatalog.js';
import { remoteFullResolutionTextureUrl } from './RemoteTextureCatalog.js';

const full = remoteFullResolutionTextureUrl;

export const HOUSE_TEXTURE_CANDIDATES = Object.freeze([
	entry('whiteBrickImage', 'white-brick-house-wall', ['white brick 1.png', 'limestone bricks 1.png']),
	entry('redBrickImage', 'red-brick-lava-platform', ['red brick 3.png', 'weathered Red bricks 1.png']),
	entry('redBrick1Image', 'red-brick-variant-1', ['red brick 1.png', 'new red bricks 2.png']),
	entry('redBrick2Image', 'red-brick-variant-2', ['red brick 2.png', 'weathered Red bricks 3.png']),
	entry('yellowBrickImage', 'yellow-brick-road', ['yellow brick 1.png', 'limestone bricks 2.png']),
	entry('goldImage', 'gold-coin', ['gold 2.png', 'copper 1.png']),
	entry('stoneImage', 'stone-house-floor', ['stone 1.png', 'stone floor 2.png']),
	entry('woodImage', 'wood-door-roof', ['oak wood 3.png', 'wooden oak planks 1.png']),
	entry('dirt1Image', 'terrain-dirt-1', ['dirt 1.png', 'dirt 5.png']),
	entry('dirt2Image', 'terrain-dirt-2', ['dirt 2.png', 'dirt 6.png']),
	entry('dirtGrass1Image', 'terrain-dirt-grass-1', ['dirt grass 1.png', 'grass 4.png']),
	entry('dirtGrass2Image', 'terrain-dirt-grass-2', ['dirt grass 2.png', 'dirt grass 3.png']),
	customEntry('terrainMixImage', 'terrain-dirt-chai-pot', [
		highestResolutionSurface('dirt'),
		full('dirt 2.png')
	])
]);

export function houseTextureCandidateEntries() {
	return HOUSE_TEXTURE_CANDIDATES.map(value => ({
		...value,
		urls: [...value.urls]
	}));
}

function entry(key, kind, filenames) {
	return customEntry(key, kind, filenames.map(full));
}

function customEntry(key, kind, urls) {
	return Object.freeze({
		key,
		kind,
		url: urls[0],
		urls: Object.freeze([...urls])
	});
}
