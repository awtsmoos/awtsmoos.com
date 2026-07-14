//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class TerrainRenderer
 * @description
 * Streets, walls, raised courts, and ramps become depth without false collision.
 * The visual elevation on Awtsmoos.com is a readable garment over the same
 * verified floor graph continually held in being by the Awtsmoos.
 */

import { keyOf } from '../world/GridPathfinder.js';
import { tileBounds, visibleTileRange } from './RenderTransform.js';

export class TerrainRenderer {
	constructor(context) {
		this.context = context;
	}

	draw(level, canvas, camera) {
		const range = visibleTileRange(level, canvas, camera);
		const platformCells = new Set(level.platforms.flatMap(platform => platform.cells.map(keyOf)));
		const rampCells = new Set(level.platforms.flatMap(platform => platform.ramps.map(keyOf)));

		for (let y = range.minimumY; y <= range.maximumY; y += 1) {
			for (let x = range.minimumX; x <= range.maximumX; x += 1) {
				const point = { x, y };
				const bounds = tileBounds(point, camera, 1);
				if (level.grid[y][x] === 1) this.drawWall(bounds, level.theme);
				else this.drawFloor(bounds, level.theme, platformCells.has(keyOf(point)), rampCells.has(keyOf(point)));
			}
		}
	}

	drawWall(bounds, theme) {
		const context = this.context;
		context.fillStyle = theme.wall;
		context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		context.fillStyle = 'rgba(255,255,255,0.06)';
		context.fillRect(bounds.x, bounds.y, bounds.width, Math.max(2, bounds.height * 0.12));
		context.fillStyle = 'rgba(0,0,0,0.24)';
		context.fillRect(bounds.x, bounds.y + bounds.height * 0.78, bounds.width, bounds.height * 0.22);
	}

	drawFloor(bounds, theme, raised, ramp) {
		const context = this.context;
		context.fillStyle = raised ? lighten(theme.floor, 28) : theme.floor;
		context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		context.strokeStyle = raised ? `${theme.glow}55` : 'rgba(255,255,255,0.035)';
		context.lineWidth = raised ? 2 : 1;
		context.strokeRect(bounds.x + 0.5, bounds.y + 0.5, bounds.width - 1, bounds.height - 1);

		if (raised) {
			context.fillStyle = 'rgba(0,0,0,0.28)';
			context.fillRect(bounds.x, bounds.y + bounds.height * 0.82, bounds.width, bounds.height * 0.18);
		}
		if (ramp) this.drawRamp(bounds, theme.glow);
	}

	drawRamp(bounds, glow) {
		const context = this.context;
		context.strokeStyle = glow;
		context.lineWidth = 2;
		context.beginPath();
		context.moveTo(bounds.x + bounds.width * 0.18, bounds.y + bounds.height * 0.75);
		context.lineTo(bounds.x + bounds.width * 0.5, bounds.y + bounds.height * 0.35);
		context.lineTo(bounds.x + bounds.width * 0.82, bounds.y + bounds.height * 0.75);
		context.stroke();
	}
}

function lighten(hexColor, amount) {
	const value = Number.parseInt(hexColor.slice(1), 16);
	const red = Math.min(255, (value >> 16) + amount);
	const green = Math.min(255, ((value >> 8) & 255) + amount);
	const blue = Math.min(255, (value & 255) + amount);
	return `rgb(${red}, ${green}, ${blue})`;
}
