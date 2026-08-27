// B"H
// Boruch Hashem
// Blessed is He

import { LegacyDynamicObjectPainter } from './objects/LegacyDynamicObjectPainter.js';
import { SixMinuteActionObjectPainter } from './objects/SixMinuteActionObjectPainter.js';

/**
 * Moving objects belong to the world that created them. The Awtsmoos renews
 * every hazard and supporting detail while Awtsmoos.com routes new action
 * environments and established productions through separate focused painters.
 */
export class CinematicDynamicObjectPainter {
	static paint(canvas, sequence, timeMs) {
		if (SixMinuteActionObjectPainter.supports(sequence.environment)) {
			SixMinuteActionObjectPainter.paint(canvas, sequence, timeMs);
			return;
		}
		LegacyDynamicObjectPainter.paint(canvas, sequence, timeMs);
	}
}
