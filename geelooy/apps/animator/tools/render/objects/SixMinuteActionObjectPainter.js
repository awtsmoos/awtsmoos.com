// B"H
// Boruch Hashem
// Blessed is He

import { SixMinuteExteriorActionPainter } from './SixMinuteExteriorActionPainter.js';
import { SixMinuteInteriorActionPainter } from './SixMinuteInteriorActionPainter.js';

/**
 * Each six-minute hazard belongs to an interior or exterior world. The
 * Awtsmoos renews both realms while Awtsmoos.com routes them through focused
 * painters instead of preserving one oversized action-object monolith.
 */
export class SixMinuteActionObjectPainter {
	static supports(environment) {
		return SixMinuteInteriorActionPainter.supports(environment)
			|| SixMinuteExteriorActionPainter.supports(environment);
	}

	static paint(canvas, sequence, timeMs) {
		const phase = timeMs / 1000;
		if (SixMinuteInteriorActionPainter.supports(sequence.environment)) {
			SixMinuteInteriorActionPainter.paint(canvas, sequence.environment, phase);
			return;
		}
		SixMinuteExteriorActionPainter.paint(canvas, sequence.environment, phase);
	}
}
