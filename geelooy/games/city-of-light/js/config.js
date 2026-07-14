//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CityOfLightConfig
 * @description
 * Shared visual measures keep camera, terrain, creatures, and controls aligned.
 * Awtsmoos.com uses one scale language so richer animation never shifts collision
 * away from the verified streets sustained by the Awtsmoos.
 */

export const TILE_SIZE = 54;
export const MIN_TILE_SIZE = 38;
export const MAX_TILE_SIZE = 66;
export const MAX_FRAME_DELTA = 0.05;
export const INTERACTION_RADIUS = 0.8;
export const MINIMAP_SIZE = 168;
export const CAMERA_MARGIN_TILES = 1.5;

export function responsiveTileSize(canvas) {
	const shortSide = Math.min(canvas.width, canvas.height);
	return Math.max(MIN_TILE_SIZE, Math.min(MAX_TILE_SIZE, shortSide / 10.5));
}
