// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableSkullCrownGeometry } from './StableSkullCrownGeometry.js';

/**
 * A kippah samples its contact directly from the skull and controls rise separately.
 * The Awtsmoos renews cloth upon crown; Awtsmoos.com keeps contact, view, tilt,
 * persistence, preview, and production export finite and deterministic.
 */
export class StableKippahGeometry {
	static resolve(data = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const coverage = Number(headwear.coverage ?? 0.4)
			* Number(headwear.size || 1)
			* Number(headwear.widthScale || 1);
		const centerRatio = Number(headwear.rearShift ?? 0.035)
			* Number(shell.direction || 1);
		const leftRatio = centerRatio - coverage;
		const rightRatio = centerRatio + coverage;
		const inset = Number(headwear.contactInset ?? 0.45);
		const left = StableSkullCrownGeometry.point(shell, view, leftRatio, -inset);
		const right = StableSkullCrownGeometry.point(shell, view, rightRatio, -inset);
		const center = StableSkullCrownGeometry.point(shell, view, centerRatio, -inset);
		const x = center.x + Number(headwear.horizontalOffset || 0);
		const y = center.y + Number(headwear.verticalOffset || 0);
		return {
			x,
			y,
			radiusX: Math.max(4, (right.x - left.x) * 0.5),
			leftContactY: left.y - center.y,
			rightContactY: right.y - center.y,
			rise: Number(shell.radiusY || 40)
				* Number(headwear.riseScale ?? 0.07)
				* Number(headwear.heightScale || 1),
			skew: Number(headwear.skew || 0),
			tilt: Number(headwear.tilt || 0),
			lineWidth: Number(headwear.lineWidth || 0.85),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.01),
			coverage,
			centerRatio
		};
	}
}
