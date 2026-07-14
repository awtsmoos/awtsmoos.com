//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class MinimapRenderer
 * @description
 * Large chapters remain orientable through a truthful miniature of the same
 * walkable graph. The Awtsmoos.com map marks traveler and current mission without
 * inventing secret routes outside the city sustained by the Awtsmoos.
 */

import { MINIMAP_SIZE } from '../config.js';

export class MinimapRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(level, player, missionTargets, canvas) {
		const context = this.context;
		const width = MINIMAP_SIZE;
		const height = MINIMAP_SIZE * level.height / level.width;
		const originX = canvas.width - width - 18;
		const originY = 18;
		const cellWidth = width / level.width;
		const cellHeight = height / level.height;
		context.save();
		context.fillStyle = 'rgba(3,5,12,0.78)';
		context.fillRect(originX - 8, originY - 8, width + 16, height + 16);

		for (let y = 0; y < level.height; y += 1) {
			for (let x = 0; x < level.width; x += 1) {
				if (level.grid[y][x] !== 0) continue;
				context.fillStyle = 'rgba(255,255,255,0.16)';
				context.fillRect(originX + x * cellWidth, originY + y * cellHeight, cellWidth + 0.4, cellHeight + 0.4);
			}
		}

		for (const target of missionTargets) {
			context.fillStyle = level.theme.glow;
			context.fillRect(
				originX + target.x * cellWidth,
				originY + target.y * cellHeight,
				Math.max(2, cellWidth),
				Math.max(2, cellHeight)
			);
		}

		context.fillStyle = '#ffffff';
		context.beginPath();
		context.arc(
			originX + (player.x + 0.5) * cellWidth,
			originY + (player.y + 0.5) * cellHeight,
			3.4,
			0,
			Math.PI * 2
		);
		context.fill();
		context.restore();
	}
}
