// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableSkullCrownGeometry } from './StableSkullCrownGeometry.js';

/**
 * Wrap cloth samples one organic skull for front band and rear cup contact. The
 * Awtsmoos renews hidden and revealed surfaces together; Awtsmoos.com preserves
 * view, folds, bun attachment, persistence, preview, and exact production export.
 */
export class StableWrapContactGeometry {
	static resolve(data = {}, headwear = {}, metrics = {}, view = {}) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const coverage = Number(headwear.frontCoverage ?? 0.82);
		const centerRatio = Number(headwear.frontShift || 0);
		const lift = Number(headwear.contactLift ?? 0.35);
		const left = StableSkullCrownGeometry.point(
			shell, view, centerRatio - coverage, lift
		);
		const center = StableSkullCrownGeometry.point(
			shell, view, centerRatio, lift
		);
		const right = StableSkullCrownGeometry.point(
			shell, view, centerRatio + coverage, lift
		);
		const bandDepth = Number(shell.radiusY || 40)
			* Number(headwear.bandDepth ?? 0.13);
		return {
			shell,
			left,
			center,
			right,
			bandDepth,
			bandSlope: Number(headwear.bandSlope ?? 1.3),
			rearWidth: Number(headwear.rearWidth ?? 0.96),
			rearBottomDepth: Number(headwear.rearBottomDepth ?? 0.48),
			rearLift: Number(headwear.rearLift ?? 0.02),
			bunSide: Number(headwear.bunSide || 1),
			bunOffsetX: Number(headwear.bunOffsetX ?? 0.96),
			bunOffsetY: Number(headwear.bunOffsetY ?? 0.17),
			bunWidth: Number(headwear.bunWidth ?? 0.28),
			bunHeight: Number(headwear.bunHeight ?? 0.3),
			bunGather: Number(headwear.bunGather ?? 0.12),
			lineWidth: Number(headwear.lineWidth || 0.85),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.01)
		};
	}
}
