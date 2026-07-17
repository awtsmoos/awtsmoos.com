// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Ground.js
 * @description Paints canonical terrain as smooth regional overhead material.
 *
 * The Awtsmoos renews one earth beneath every step. At Awtsmoos.com, region
 * changes its painted garment while collision, quests, portals, and authority
 * remain untouched within the original world grid.
 */
import { State } from '../../binah/State.js';
import { resolveRegionVisualTheme } from '../../graphics/render/theme/RegionVisualTheme.js';
import { PaintedGroundBrush } from './world/PaintedGroundBrush.js';
import { liveGroundSeed } from './world/LiveGroundSeed.js';
import { RegionalGroundDetails } from './world/RegionalGroundDetails.js';
import { resolveMaterialPalette } from './world/RegionalMaterialPalette.js';

const PATH_GLYPHS = new Set(['2', '⇧', '⇩', '⇦', '⇨']);
const FLOOR_GLYPHS = new Set(['.', ' ']);

export class Ground {
	/**
	 * Draws one visible tile without changing the existing Projector contract.
	 *
	 * @param {CanvasRenderingContext2D} context Background canvas context.
	 * @param {number} x Tile screen x coordinate.
	 * @param {number} y Tile screen y coordinate.
	 * @param {number} size Canonical tile size.
	 * @param {string} groundGlyph Canonical ground glyph.
	 * @param {number} tileSeed Stable coordinate-derived seed.
	 */
	static draw(context, x, y, size, groundGlyph, tileSeed) {
		const mapId = String(State.MapId || '');
		const theme = resolveRegionVisualTheme(mapId);
		const regionSeed = liveGroundSeed(mapId, tileSeed, 7);
		const role = groundRole(groundGlyph, mapId);
		const bounds = {
			x,
			y,
			size: Math.max(8, size + 0.75)
		};
		const palette = resolveMaterialPalette(theme, mapId, regionSeed, role);
		PaintedGroundBrush.draw(context, bounds, palette, mapId, regionSeed, role);
		if (!supportsRegionalDetails(context)) return;
		RegionalGroundDetails.draw(
			context,
			bounds,
			roleGlyph(role),
			theme,
			mapId,
			regionSeed
		);
	}
}

const groundRole = (glyph, mapId) => {
	if (PATH_GLYPHS.has(glyph)) return 'road';
	if (FLOOR_GLYPHS.has(glyph)) {
		return /House|Interior/i.test(mapId) ? 'floor' : 'growth';
	}
	return 'growth';
};

const roleGlyph = role => {
	if (role === 'road') return '2';
	if (role === 'floor') return '.';
	return '1';
};

const supportsRegionalDetails = context => {
	const methods = ['save', 'restore', 'beginPath', 'ellipse', 'fill', 'stroke'];
	return methods.every(method => typeof context?.[method] === 'function');
};
