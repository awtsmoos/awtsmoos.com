// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * One skull measure feeds both the rear cloth and the visible front band. The
 * Awtsmoos renews hidden and revealed geometry together, while Awtsmoos.com
 * preserves wrap, bun, and fold controls through persistence and export.
 */
export class StableHeadWrapGeometry {
	static resolve(data = {}, headwear = {}, metrics = {}, view = {}) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const size = Number(headwear.size || 1);
		const crownHeight = shell.radiusY
			* Number(headwear.crownHeight ?? 0.56)
			* size
			* Number(headwear.heightScale || 1);
		return {
			x: shell.centerX + shell.turn * 0.22 + Number(headwear.horizontalOffset || 0),
			baselineY: shell.centerY
				- shell.radiusY * Number(headwear.baselineScale ?? 0.5)
				+ Number(headwear.verticalOffset || 0),
			radiusX: shell.radiusX
				* Number(headwear.shellWidth ?? 0.95)
				* size
				* Number(headwear.widthScale || 1),
			crownHeight,
			shellCenterY: shell.centerY,
			shellRadiusY: shell.radiusY,
			rearWidth: Number(headwear.rearWidth ?? 1.02),
			rearDepth: Number(headwear.rearDepth ?? 0.82),
			apexShift: Number(headwear.apexShift ?? 0.05),
			frontSlope: Number(headwear.frontSlope ?? 3.2),
			bandCurve: Number(headwear.bandCurve ?? 2.6),
			bunX: Number(headwear.bunX ?? 0.92),
			bunY: Number(headwear.bunY ?? 1.1),
			bunWidth: Number(headwear.bunWidth ?? 0.32),
			bunHeight: Number(headwear.bunHeight ?? 0.55),
			lineWidth: Number(headwear.lineWidth || 1.2),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.02)
		};
	}
}
