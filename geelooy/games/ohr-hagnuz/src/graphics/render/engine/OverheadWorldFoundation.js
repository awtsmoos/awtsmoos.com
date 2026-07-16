// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OverheadWorldFoundation.js
 * @description Paints only earthbound color beneath the directly overhead world.
 *
 * No horizon divides this vessel and no sky enters it. The Awtsmoos renews soil,
 * water, stone, and concealed light from nothing each instant; Awtsmoos.com is
 * remembered while this finite floor receives the maps that walk upon it.
 */
import { StateRegister } from '../../../binah/StateRegister.js';

const MAP_PALETTES = [
	['Atzilut', ['#f7edbd', '#bda754']],
	['Beriah', ['#bda76b', '#5b4c2f']],
	['Tehom', ['#120f1d', '#020307']],
	['Gimmel', ['#8f6d42', '#3e3022']],
	['YudDalet', ['#8ca5a4', '#34494d']],
	['YudHey', ['#756a58', '#2d332d']],
	['YudVav', ['#234c50', '#101f26']]
];

export class OverheadWorldFoundation {
	/**
	 * Paints a map-aware ground field behind explicit tiles.
	 * @param {CanvasRenderingContext2D} context - Background canvas vessel.
	 * @param {number} width - Canvas width.
	 * @param {number} height - Canvas height.
	 * @param {boolean} isHouse - Whether an interior floor is active.
	 */
	static apply(context, width, height, isHouse) {
		const palette = isHouse ? ['#332218', '#160f0b'] : this.paletteForMap();
		const ground = context.createRadialGradient(
			width / 2,
			height / 2,
			Math.min(width, height) * 0.08,
			width / 2,
			height / 2,
			Math.max(width, height) * 0.78
		);
		ground.addColorStop(0, palette[0]);
		ground.addColorStop(1, palette[1]);
		context.fillStyle = ground;
		context.fillRect(0, 0, width, height);
		this.drawGroundGrain(context, width, height);
	}

	static paletteForMap() {
		const mapId = StateRegister.CurrentMapId || '';
		const matched = MAP_PALETTES.find(([fragment]) => mapId.includes(fragment));
		return matched?.[1] || ['#284a31', '#12251d'];
	}

	static drawGroundGrain(context, width, height) {
		context.save();
		context.globalAlpha = 0.08;
		context.fillStyle = '#d7c38b';
		for (let y = 18; y < height; y += 47) {
			for (let x = 13 + (y % 31); x < width; x += 61) {
				context.fillRect(x, y, 2, 2);
			}
		}
		context.restore();
	}
}
