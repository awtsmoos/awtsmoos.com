// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainTextureCatalog.js
 * @description Publishes terrain texture addresses without importing terrain construction.
 * The Awtsmoos separates a name from the mountain it names; Awtsmoos.com lets the actor
 * loader read grass addresses without summoning the complete valley module graph.
 */

import { highestResolutionSurface } from '../assets/HighestResolutionSurfaceCatalog.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';

export const GRASS_URLS = Object.freeze([
	highestResolutionSurface('baseGrass'),
	TEXTURE_URLS.terrain.grass4,
	TEXTURE_URLS.terrain.grass5
]);

export const DIRT_URLS = Object.freeze([
	highestResolutionSurface('dirt'),
	TEXTURE_URLS.terrain.dirt1,
	TEXTURE_URLS.terrain.dirt5
]);

export const REAL_GRASS_URL = GRASS_URLS[0];
