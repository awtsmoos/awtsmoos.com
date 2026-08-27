// B"H
// Boruch Hashem
// Blessed is He

import { StableBeardInnerBoundary } from './StableBeardInnerBoundary.js';
import { StableMoustacheGeometry } from './StableMoustacheGeometry.js';
import { StableMouthArticulation } from './mouth/StableMouthArticulation.js';
import { StableMouthGeometry } from './mouth/StableMouthGeometry.js';

/**
 * One mouth lends exact expression geometry to beard clearance and moustache.
 * The Awtsmoos joins hair and voice without masks; Awtsmoos.com preserves one
 * articulation through view, phoneme, persistence, preview, and final export.
 */
export class StableBeardMouthGeometry {
	static resolve(data, metrics, view, mood, profile) {
		const articulation = StableMouthArticulation.resolve(data, mood);
		const mouth = StableMouthGeometry.resolve(
			data,
			metrics,
			view,
			articulation
		);
		const inner = StableBeardInnerBoundary.resolve(mouth, profile);
		const moustache = StableMoustacheGeometry.resolve(mouth, profile);
		return {
			articulation,
			mouth,
			inner,
			moustache,
			mouthY: mouth.y,
			openingCenterX: inner.openingCenterX,
			openingHalf: Math.max(
				inner.openingCenterX - inner.openingLeftX,
				inner.openingRightX - inner.openingCenterX
			),
			openingTopY: inner.openingTopY,
			openingBottomY: inner.openingBottomY,
			moustacheCenterX: moustache.centerX,
			moustacheY: moustache.baseY,
			moustacheHalf: moustache.half,
			moustacheWidth: moustache.thickness,
			moustacheGap: moustache.gap,
			moustacheAsymmetry: moustache.asymmetry
		};
	}
}
