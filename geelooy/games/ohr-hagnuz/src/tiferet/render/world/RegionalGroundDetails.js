// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionalGroundDetails.js
 * @description Paints bounded curved accents for the live overhead world.
 *
 * The Awtsmoos dresses one earth in reed, grain, frost, ember, and light.
 * Awtsmoos.com keeps each mark smooth, deterministic, flat, and walkable,
 * revealing material without ever claiming collision authority.
 */
import {
	liveGroundChoice,
	liveGroundUnit
} from './LiveGroundSeed.js';

export class RegionalGroundDetails {
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
		context.save();
		context.lineCap = 'round';
		for (let index = 0; index < 3; index += 1) {
			const offset = index * 11;
			const bladeX = x + size * (0.16 + liveGroundUnit(mapId, tileSeed, offset) * 0.68);
			const bladeY = y + size * (0.38 + liveGroundUnit(mapId, tileSeed, offset + 1) * 0.44);
			context.strokeStyle = liveGroundChoice(theme.tree, mapId, tileSeed, offset + 2);
			context.globalAlpha = 0.28 + index * 0.06;
			context.lineWidth = Math.max(0.8, size * 0.018);
			context.beginPath();
			context.moveTo(bladeX, bladeY + size * 0.09);
			context.quadraticCurveTo(
				bladeX + size * 0.05,
				bladeY,
				bladeX + size * 0.02,
				bladeY - size * (0.08 + index * 0.025)
			);
			context.stroke();
		}
		context.restore();
		this.drawRegionalMark(context, bounds, theme, mapId, tileSeed);
	}

	static drawRoad(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		context.save();
		context.globalAlpha = 0.18;
		for (let index = 0; index < 4; index += 1) {
			const offset = 40 + index * 7;
			const pebbleX = x + liveGroundUnit(mapId, tileSeed, offset) * size;
			const pebbleY = y + liveGroundUnit(mapId, tileSeed, offset + 1) * size;
			context.fillStyle = liveGroundChoice(
				theme.props || theme.road,
				mapId,
				tileSeed,
				offset + 2
			);
			context.beginPath();
			context.ellipse(pebbleX, pebbleY, size * 0.035, size * 0.022, offset, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();
	}

	static drawFloor(context, bounds, theme, mapId, tileSeed) {
		const { x, y, size } = bounds;
		context.save();
		context.strokeStyle = 'rgba(255,255,255,.045)';
		context.lineWidth = 0.75;
		context.beginPath();
		context.moveTo(x + size * 0.08, y + size * 0.18);
		context.quadraticCurveTo(x + size * 0.5, y + size * 0.12, x + size * 0.92, y + size * 0.2);
		context.stroke();
		if (liveGroundUnit(mapId, tileSeed, 80) > 0.72) {
			context.fillStyle = liveGroundChoice(theme.props, mapId, tileSeed, 81);
			context.globalAlpha = 0.18;
			context.beginPath();
			context.ellipse(x + size * 0.67, y + size * 0.7, size * 0.05, size * 0.025, 0.4, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();
	}

	static drawRegionalMark(context, bounds, theme, mapId, tileSeed) {
		const marks = {
			marsh: ['rgba(120,190,178,.18)', 0.3, 0.72],
			desert: ['rgba(242,202,120,.2)', 0.28, 0.48],
			frost: ['rgba(220,245,240,.28)', 0.76, 0.24],
			luminous: ['rgba(255,226,135,.32)', 0.52, 0.34],
			ember: ['rgba(232,130,78,.26)', 0.7, 0.74]
		};
		const mark = marks[theme.id];
		if (!mark) return;
		const { x, y, size } = bounds;
		const radius = size * (0.035 + liveGroundUnit(mapId, tileSeed, 91) * 0.035);
		context.save();
		context.fillStyle = mark[0];
		context.beginPath();
		context.ellipse(x + size * mark[1], y + size * mark[2], radius * 1.8, radius, 0.25, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
