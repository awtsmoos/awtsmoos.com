// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from '../StableHeadShellGeometry.js';

/**
 * Every expressive feature receives one anatomical map instead of a private grid.
 * The Awtsmoos unifies without erasing difference; Awtsmoos.com keeps these
 * finite landmarks character-specific, keyframeable, and renderer-authoritative.
 */
export class StableFaceLandmarkLayout {
	static resolve(data = {}, metrics = {}, view = {}) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const style = StableHeadShellGeometry.style(data);
		const turn = shell.turn;
		const eyeY = shell.centerY + shell.radiusY * this.number(style.eyeYRatio, -0.13);
		const eyeSpread = shell.radiusX * this.number(style.eyeSpreadRatio, 0.43);
		const noseY = shell.centerY + shell.radiusY * this.number(style.noseYRatio, 0.12);
		const mouthY = shell.centerY + shell.radiusY * this.number(style.mouthYRatio, 0.4);
		return {
			shell,
			eyes: {
				y: eyeY,
				spread: eyeSpread,
				turn: turn * this.number(style.eyeTurnRatio, 0.78)
			},
			brows: {
				y: eyeY - shell.radiusY * this.number(style.browLiftRatio, 0.23),
				spread: eyeSpread,
				turn: turn * this.number(style.eyeTurnRatio, 0.78)
			},
			nose: {
				x: shell.centerX + turn * this.number(style.noseTurnRatio, 1.35),
				y: noseY
			},
			mouth: {
				x: shell.centerX + turn * this.number(style.mouthTurnRatio, 0.82),
				y: mouthY
			},
			cheeks: {
				y: shell.centerY + shell.radiusY * this.number(style.blushYRatio, 0.24),
				spread: shell.radiusX * this.number(style.blushSpreadRatio, 0.59)
			},
			beard: {
				rootY: shell.centerY + shell.radiusY * this.number(style.beardRootYRatio, 0.2),
				jawY: shell.centerY + shell.radiusY * this.number(style.beardJawYRatio, 0.72),
				centerX: shell.centerX + turn * this.number(style.beardTurnRatio, 0.58)
			}
		};
	}

	static eye(layout, side, view = {}) {
		const perspectiveShift = view.type === 'threeQuarter'
			? Number(view.dir || 1) * layout.shell.radiusX
				* (side === view.dir ? 0.06 : 0.11)
			: 0;
		return {
			x: layout.shell.centerX + side * layout.eyes.spread
				+ layout.eyes.turn + perspectiveShift,
			y: layout.eyes.y
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
