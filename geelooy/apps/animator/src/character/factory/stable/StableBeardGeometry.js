// B"H
// Boruch Hashem
// Blessed is He

import { StableBeardMouthGeometry } from './StableBeardMouthGeometry.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Beard mass follows the authored skull while its opening follows the real mouth.
 * The Awtsmoos joins concealment and revelation, while Awtsmoos.com preserves
 * every cheek, taper, chin, view, and phoneme as editable production geometry.
 */
export class StableBeardGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}) {
		const authored = data.beardGeometry || {};
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const mouth = StableBeardMouthGeometry.resolve(
			data,
			metrics,
			view,
			mood,
			authored
		);
		const length = Number(data.beardLength || 0.72)
			* Number(authored.lengthScale || 1);
		const centerX = Number(authored.centerX || 0);
		const topY = metrics.headY + Number(authored.topOffset ?? 6);
		const bottomY = metrics.headY + 50 + 28 * length;
		const width = shell.radiusX * Number(authored.cheekScale || 0.68);

		return {
			...mouth,
			massStyle: authored.massStyle || 'segmented',
			centerX,
			chinCenterX: centerX + Number(authored.chinOffsetX || 0),
			top: topY,
			topY,
			bottom: bottomY,
			bottomY,
			sideY: topY + (bottomY - topY)
				* Number(authored.sideRatio ?? 0.5),
			cheek: width,
			width,
			leftWidth: width * Number(authored.leftCheekScale || 1),
			rightWidth: width * Number(authored.rightCheekScale || 1),
			chinWidth: Number(authored.chinWidth || 18),
			bottomHalf: Number(authored.chinWidth || 18),
			taper: Number(authored.taper || 0.72),
			bottomRoundness: Number(authored.bottomRoundness || 0.85),
			topInset: Number(authored.topInset ?? 0.72),
			bridgeY: Math.min(
				mouth.openingTopY - Number(authored.bridgeGap ?? 0.8),
				topY + Number(authored.bridgeDrop ?? 17)
			),
			bridgeValley: Number(authored.bridgeValley ?? 2.4),
			lineWidth: Number(authored.lineWidth || 1.3),
			strandOpacity: Number(authored.strandOpacity ?? 0.04)
		};
	}

	static enabled(data = {}) {
		return Boolean(
			data.beard
			|| data.archetype === 'sage'
			|| data.style === 'goal_board_sage'
		);
	}
}
