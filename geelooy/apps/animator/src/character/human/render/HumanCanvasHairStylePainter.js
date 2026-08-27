// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasHairFlowPainter } from './HumanCanvasHairFlowPainter.js';
import { HumanCanvasHairStrandPainter } from './HumanCanvasHairStrandPainter.js';

/**
 * One dispatcher chooses the correct hair craft without flattening every style
 * into one cap. The Awtsmoos renews crop, braid, loc, bun, ponytail, and flow.
 */
export class HumanCanvasHairStylePainter {
	static paint(options) {
		const { hair } = options;
		if (['crop', 'fade'].includes(hair.style)) {
			this.short(options);
			return;
		}
		if (['braids', 'locs'].includes(hair.style)) {
			this.strands(options);
			return;
		}
		if (['bun', 'ponytail'].includes(hair.style)) {
			this.gathered(options);
			return;
		}
		HumanCanvasHairFlowPainter.paint(
			options.ctx,
			options.head,
			options.radiusX,
			options.length,
			hair,
			options.color,
			options.scale,
			options.sway
		);
	}

	static short(options) {
		HumanCanvasHairStrandPainter.crop(
			options.ctx,
			options.head,
			options.radiusX,
			options.radiusY,
			options.hair.style,
			options.color,
			options.scale,
			options.density
		);
	}

	static strands(options) {
		HumanCanvasHairStrandPainter.strands(
			options.ctx,
			options.head,
			options.radiusX,
			options.length,
			options.hair,
			options.color,
			options.scale,
			options.sway,
			options.density
		);
	}

	static gathered(options) {
		HumanCanvasHairStrandPainter.gathered(
			options.ctx,
			options.head,
			options.radiusX,
			options.radiusY,
			options.length,
			options.hair.style,
			options.color,
			options.scale,
			options.sway
		);
	}
}
