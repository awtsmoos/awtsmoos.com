// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadPainter.js
 * @description Paints connected regional roads with stable wear and edge growth.
 *
 * The Awtsmoos renews every road without repeating a painted square. Awtsmoos.com
 * keeps road identity and portals canonical while color follows the current region.
 */
import { visualSeed, visualUnit } from './detail/VisualSeed.js';

const ROAD_TYPES = new Set(['G_DIRT_PATH']);

export class RoadPainter {
	static draw(context, x, y, size, tile, tileIndex = new Map(), theme) {
		const left = Math.floor(x);
		const top = Math.floor(y);
		const extent = Math.ceil(size) + 1;
		const seed = visualSeed(tile.x, tile.y, theme.id.length);
		context.save();
		context.fillStyle = theme.road[0];
		context.fillRect(left, top, extent, extent);
		this.drawMud(context, left, top, size, seed, theme);
		this.drawStones(context, left, top, size, seed, theme);
		this.drawCrack(context, left, top, size, seed);
		this.drawEdges(context, left, top, size, tile, tileIndex, theme);
		context.restore();
	}

	static drawMud(context, x, y, size, seed, theme) {
		context.fillStyle = theme.road[1];
		context.globalAlpha = 0.34;
		for (let index = 0; index < 4; index += 1) {
			const pointX = x + 7 + visualUnit(seed, index * 2) * (size - 18);
			const pointY = y + 7 + visualUnit(seed, index * 2 + 1) * (size - 18);
			context.beginPath();
			context.ellipse(pointX, pointY, 6 + index, 3 + index / 2, 0.4, 0, Math.PI * 2);
			context.fill();
		}
		context.globalAlpha = 1;
	}

	static drawStones(context, x, y, size, seed, theme) {
		for (let index = 0; index < 8; index += 1) {
			const pointX = x + 5 + visualUnit(seed, index * 3) * (size - 10);
			const pointY = y + 5 + visualUnit(seed, index * 3 + 1) * (size - 10);
			const radius = 2 + visualUnit(seed, index * 3 + 2) * 4;
			context.fillStyle = index % 3 === 0 ? theme.road[2] : theme.road[0];
			context.beginPath();
			context.ellipse(pointX, pointY, radius, radius * 0.65, 0.2, 0, Math.PI * 2);
			context.fill();
		}
	}

	static drawCrack(context, x, y, size, seed) {
		const startX = x + size * (0.25 + visualUnit(seed, 41) * 0.45);
		const startY = y + size * (0.2 + visualUnit(seed, 42) * 0.45);
		context.strokeStyle = 'rgba(34,27,24,0.46)';
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(startX, startY);
		context.lineTo(startX + 8, startY + 5);
		context.lineTo(startX + 4, startY + 12);
		context.stroke();
	}

	static drawEdges(context, x, y, size, tile, tileIndex, theme) {
		const neighbors = [
			[0, -1, x, y, size, 4],
			[0, 1, x, y + size - 4, size, 4],
			[-1, 0, x, y, 4, size],
			[1, 0, x + size - 4, y, 4, size]
		];
		context.fillStyle = theme.road[3];
		context.globalAlpha = 0.58;
		for (const [dx, dy, edgeX, edgeY, width, height] of neighbors) {
			if (!tile.isPortal && !this.isRoad(tileIndex, tile.x + dx, tile.y + dy)) {
				context.fillRect(edgeX, edgeY, width, height);
			}
		}
		context.globalAlpha = 1;
	}

	static isRoad(index, x, y) {
		const neighbor = index.get(`${x}:${y}`);
		return Boolean(neighbor && (ROAD_TYPES.has(neighbor.t) || neighbor.isPortal));
	}
}
