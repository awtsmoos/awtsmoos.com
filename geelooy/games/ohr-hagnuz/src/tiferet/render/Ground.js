// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Ground.js
 * @description Paints the active Projector's canonical ground with regional overhead truth.
 *
 * The Awtsmoos renews one playable earth beneath every step. At Awtsmoos.com,
 * region changes its garment, never its collision, quest, portal, or authority.
 */
import { State } from '../../binah/State.js';
import { resolveRegionVisualTheme } from '../../graphics/render/theme/RegionVisualTheme.js';
import {
	liveGroundChoice,
	liveGroundSeed
} from './world/LiveGroundSeed.js';
import { RegionalGroundDetails } from './world/RegionalGroundDetails.js';

const PATH_GLYPHS = new Set(['2', '⇧', '⇩', '⇦', '⇨']);
const FLOOR_GLYPHS = new Set(['.', ' ']);

export class Ground {
	/**
	 * Draws one visible tile while preserving the live Projector signature.
	 *
	 * @param {CanvasRenderingContext2D} context Background canvas context.
	 * @param {number} x Tile screen x coordinate.
	 * @param {number} y Tile screen y coordinate.
	 * @param {number} size Tile size in pixels.
	 * @param {string} groundGlyph Canonical ground glyph from TileLexicon.
	 * @param {number} tileSeed Existing coordinate-derived deterministic seed.
	 * @returns {void}
	 */
	static draw(context, x, y, size, groundGlyph, tileSeed) {
		const mapId = String(State.MapId || '');
		const theme = resolveRegionVisualTheme(mapId);
		const bounds = {
			x: Math.floor(x),
			y: Math.floor(y),
			size: Math.max(8, Math.floor(size + 1))
		};
		const regionSeed = liveGroundSeed(mapId, tileSeed, 7);
		if (PATH_GLYPHS.has(groundGlyph)) {
			this.drawRoad(context, bounds, theme, mapId, regionSeed);
			return;
		}
		if (FLOOR_GLYPHS.has(groundGlyph)) {
			this.drawFloor(context, bounds, theme, mapId, regionSeed);
			return;
		}
		this.drawGrowth(context, bounds, theme, mapId, regionSeed);
	}

	static drawGrowth(context, bounds, theme, mapId, tileSeed) {
		this.fillBase(context, bounds, liveGroundChoice(theme.grass, mapId, tileSeed, 1));
		this.drawEdgeLight(context, bounds, 'rgba(255,255,255,0.035)', 'rgba(0,0,0,0.11)');
		RegionalGroundDetails.draw(context, bounds, '1', theme, mapId, tileSeed);
	}

	static drawRoad(context, bounds, theme, mapId, tileSeed) {
		this.fillBase(context, bounds, liveGroundChoice(theme.road, mapId, tileSeed, 2));
		this.drawEdgeLight(context, bounds, 'rgba(255,236,190,0.06)', 'rgba(45,28,18,0.13)');
		RegionalGroundDetails.draw(context, bounds, '2', theme, mapId, tileSeed);
	}

	static drawFloor(context, bounds, theme, mapId, tileSeed) {
		const isInterior = /House|Interior/i.test(mapId);
		const palette = isInterior ? theme.props : theme.grass;
		const color = liveGroundChoice(palette, mapId, tileSeed, 3);
		this.fillBase(context, bounds, color);
		this.drawEdgeLight(context, bounds, 'rgba(255,255,255,0.025)', 'rgba(0,0,0,0.14)');
		RegionalGroundDetails.draw(context, bounds, '.', theme, mapId, tileSeed);
	}

	static fillBase(context, bounds, color) {
		context.fillStyle = color || '#173a2f';
		context.fillRect(bounds.x, bounds.y, bounds.size, bounds.size);
	}

	static drawEdgeLight(context, bounds, lightColor, shadeColor) {
		const { x, y, size } = bounds;
		context.fillStyle = lightColor;
		context.fillRect(x, y, size, 1);
		context.fillRect(x, y, 1, size);
		context.fillStyle = shadeColor;
		context.fillRect(x, y + size - 2, size, 2);
		context.fillRect(x + size - 2, y, 2, size);
	}
}
