// B"H
// Boruch Hashem
// Blessed is He

import { StableMouthArticulation } from './mouth/StableMouthArticulation.js';
import { StableMouthGeometry } from './mouth/StableMouthGeometry.js';

/**
 * The visible mouth lends its exact coordinates to beard aperture and moustache.
 * The Awtsmoos reveals speech through hair without division, while Awtsmoos.com
 * preserves one deterministic articulation across every facial layer.
 */
export class StableBeardMouthGeometry {
	static resolve(data, metrics, view, mood, authored) {
		const articulation = StableMouthArticulation.resolve(data, mood);
		const mouth = StableMouthGeometry.resolve(
			data,
			metrics,
			view,
			articulation
		);
		const openingHalf = Math.max(
			Number(authored.minimumOpeningHalf || 6),
			mouth.outerHalfWidth * Number(authored.openingWidthScale ?? 1)
				+ Number(authored.openingPaddingX ?? 2.4)
		);
		const openingTopY = Math.min(
			mouth.upperPeakY,
			mouth.leftCornerY,
			mouth.rightCornerY
		) - Number(authored.openingPaddingTop ?? 2.8);
		const openingBottomY = Math.max(
			mouth.lowerPeakY,
			mouth.leftCornerY,
			mouth.rightCornerY
		) + Number(authored.openingPaddingBottom ?? 3.2);
		const moustacheHalf = mouth.outerHalfWidth
			* Number(authored.moustacheScale ?? 0.72);

		return {
			mouthY: mouth.y,
			openingCenterX: mouth.x + Number(authored.openingOffsetX || 0),
			openingHalf,
			openingTopY,
			openingBottomY,
			openingHeight: Math.max(
				mouth.y - openingTopY,
				openingBottomY - mouth.y
			),
			openingRoundness: Number(authored.openingRoundness ?? 0.82),
			mouthClearance: openingHalf,
			moustacheCenterX: mouth.x
				+ Number(authored.moustacheOffsetX || 0),
			moustacheY: mouth.upperPeakY
				- Number(authored.moustacheLift ?? 1.8),
			moustacheHalf,
			moustacheWidth: Number(authored.moustacheWidth || 1.7),
			moustacheArch: Number(authored.moustacheArch ?? 2.1),
			moustacheDrop: Number(authored.moustacheDrop ?? 1.2),
			moustacheGap: Number(authored.moustacheGap ?? 1),
			moustacheAsymmetry: Number(
				authored.moustacheAsymmetry || 0
			)
		};
	}
}
