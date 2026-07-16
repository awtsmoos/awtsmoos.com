// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionalGroundDetails.js
 * @description Paints bounded, non-blocking overhead accents for the live world.
 *
 * The Awtsmoos dresses one earth in marsh reed-shadow, desert grain, frost,
 * ember, and light. Awtsmoos.com keeps every mark flat, honest, and walkable.
 */
import {
	liveGroundChoice,
	liveGroundUnit
} from './LiveGroundSeed.js';

export class RegionalGroundDetails {
	/**
	 * Paints a small fixed budget of visual accents without changing collision.
	 *
	 * @param {CanvasRenderingContext2D} context Live background context.
	 * @param {{x:number,y:number,size:number}} bounds Tile screen bounds.
	 * @param {string} groundGlyph Canonical ground role.
	 * @param {object} theme Resolved regional visual theme.
	 * @param {string} mapId Canonical map identity.
	 * @param {number} tileSeed Stable tile-coordinate seed.
	 * @returns {void}
	 */
	static draw(context, bounds, groundGlyph, theme, mapId, tileSeed) {
		if (groundGlyph === '2') {
			this.drawRoad(context, bounds, theme, mapId, tileSeed);
			return;
		}
		if (groundGlyph === '.' || groundGlyph === ' ') {
			this.drawFloor(context, bounds, theme, mapId, tileSeed);
			return;
		}
		this.drawGrowth(context, bounds, theme, mapId, tileSeed);
	}

	static drawGrowth(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		for (let index = 0; index < 3; index += 1) {
			const offset = index * 11;
			const bladeX = x + size * (.16 + liveGroundUnit(mapId, tileSeed, offset) * .68);
			const bladeY = y + size * (.24 + liveGroundUnit(mapId, tileSeed, offset + 1) * .58);
			context.fillStyle = liveGroundChoice(theme.tree, mapId, tileSeed, offset + 2);
			context.fillRect(Math.floor(bladeX), Math.floor(bladeY), 2, 3 + index);
		}
		this.drawRegionalMark(context, bounds, theme, mapId, tileSeed);
	}

	static drawRoad(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		for (let index = 0; index < 5; index += 1) {
			const offset = 40 + index * 7;
			const pebbleX = x + liveGroundUnit(mapId, tileSeed, offset) * size;
			const pebbleY = y + liveGroundUnit(mapId, tileSeed, offset + 1) * size;
			context.fillStyle = liveGroundChoice(theme.road, mapId, tileSeed, offset + 2);
			context.fillRect(Math.floor(pebbleX), Math.floor(pebbleY), 2, 1 + index % 2);
		}
	}

	static drawFloor(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		context.fillStyle = 'rgba(255,255,255,0.035)';
		context.fillRect(x + 1, y + 1, size - 2, 1);
		if (liveGroundUnit(mapId, tileSeed, 80) > .72) {
			context.fillStyle = liveGroundChoice(theme.props, mapId, tileSeed, 81);
			context.fillRect(x + size * .62, y + size * .66, 3, 2);
		}
	}

	static drawRegionalMark(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		if (theme.id === 'marsh' && liveGroundUnit(mapId, tileSeed, 90) > .48) {
			context.fillStyle = 'rgba(120,190,178,0.13)';
			context.fillRect(x + size * .18, y + size * .68, size * .36, 2);
		}
		if (theme.id === 'desert') {
			context.fillStyle = 'rgba(230,190,105,0.18)';
			context.fillRect(x + size * .12, y + size * .42, size * .26, 1);
		}
		if (theme.id === 'frost') {
			context.fillStyle = 'rgba(220,245,240,0.25)';
			context.fillRect(x + size * .74, y + size * .18, 2, 2);
		}
		if (theme.id === 'luminous') {
			context.fillStyle = 'rgba(255,226,135,0.35)';
			context.fillRect(x + size * .48, y + size * .3, 2, 2);
		}
		if (theme.id === 'ember') {
			context.fillStyle = 'rgba(215,115,70,0.24)';
			context.fillRect(x + size * .68, y + size * .72, 2, 2);
		}
	}
}
