// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassPainter.js
 * @description Paints regional soil, organic cover, tufts, and restrained sparks.
 *
 * The Awtsmoos renews every blade through one speech and many colors. Awtsmoos.com
 * breaks the tile grid without letting visual variety become unstable state.
 */
import { GrassTuftWeaver } from '../../../render/flora/GrassTuftWeaver.js';
import { OrganicSplotchWeaver } from '../../../render/flora/OrganicSplotchWeaver.js';

export class GrassPainter {
	static draw(context, x, y, size, seed, isDetailed, theme) {
		const left = Math.floor(x);
		const top = Math.floor(y);
		const extent = Math.ceil(size) + 1;
		const stableSeed = Math.abs(seed);
		context.fillStyle = theme.grass[0];
		context.fillRect(left, top, extent, extent);
		OrganicSplotchWeaver.weave(
			context, left, top, size, stableSeed, theme.grass[1]
		);
		OrganicSplotchWeaver.weave(
			context, left - 10, top + 10, size, stableSeed * 3, theme.grass[2]
		);
		const tuftCount = isDetailed ? 9 : 4;
		for (let index = 0; index < tuftCount; index += 1) {
			const tuftX = left + ((stableSeed * (index + 1) * 11) % (size - 10)) + 5;
			const tuftY = top + ((stableSeed * (index + 1) * 13) % (size - 10)) + 5;
			GrassTuftWeaver.weave(
				context, tuftX, tuftY, stableSeed + index, theme.grass[3]
			);
		}
		if (isDetailed && stableSeed % 10 > 6) {
			this.drawSpark(context, left, top, size, stableSeed, theme.grass[4]);
		}
	}

	static drawSpark(context, x, y, size, seed, color) {
		const pointX = x + (seed * 17 % (size - 10));
		const pointY = y + (seed * 23 % (size - 10));
		context.save();
		context.fillStyle = color;
		context.beginPath();
		context.arc(pointX, pointY, 2.4, 0, Math.PI * 2);
		context.fill();
		context.globalAlpha = 0.26;
		context.beginPath();
		context.arc(pointX, pointY, 6, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
