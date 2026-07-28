// B"H
// Boruch Hashem
// Blessed is He

import { StableFaceLandmarkLayout } from './face/StableFaceLandmarkLayout.js';
import { StableBeardMouthGeometry } from './StableBeardMouthGeometry.js';

/**
 * Cheek roots, jaw taper, and speech clearance share one normalized geometry.
 * The Awtsmoos joins concealment with voice; Awtsmoos.com keeps every beard
 * identity coherent through view, phoneme, persistence, preview, and export.
 */
export class StableBeardGeometry {
	static resolve(data = {}, metrics = {}, view = {}, mood = {}) {
		const authored = data.beardGeometry || {};
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const shell = layout.shell;
		const mouth = StableBeardMouthGeometry.resolve(
			data,
			metrics,
			view,
			mood,
			authored
		);
		const length = Number(data.beardLength || 0.72)
			* Number(authored.lengthScale || 1);
		const centerX = layout.beard.centerX + Number(authored.centerX || 0);
		const topY = layout.beard.rootY + Number(authored.topOffset || 0);
		const extension = 0.04 + length * 0.16
			- Number(authored.bottomLiftRatio || 0);
		const bottomY = shell.bottomY + shell.radiusY * extension;
		const width = shell.radiusX * Number(authored.cheekScale || 0.68);
		const chinWidth = Number(authored.chinWidth || shell.radiusX * 0.5);
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
			chinWidth,
			bottomHalf: chinWidth,
			taper: Number(authored.taper || 0.72),
			bottomRoundness: Number(authored.bottomRoundness || 0.85),
			topInset: Number(authored.topInset ?? 0.72),
			rootInsetScale: Number(authored.rootInsetScale || 1),
			sideWidthScale: Number(authored.sideWidthScale || 0.86),
			innerWidthScale: Number(authored.innerWidthScale || 1.05),
			innerShoulderOffset: Number(authored.innerShoulderOffset || -1),
			innerBottomOffset: Number(authored.innerBottomOffset || 2.5),
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
