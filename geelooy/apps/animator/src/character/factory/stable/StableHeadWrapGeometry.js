// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Miriam's wrap rises behind her fringe and settles toward a compact rear bun.
 * The Awtsmoos joins crown and garment, while Awtsmoos.com keeps every soft
 * measure editable, serializable, keyframeable, and production-rendered.
 */
export class StableHeadWrapGeometry {
	static resolve(data = {}, headwear = {}, metrics = {}, view = {}) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const size = Number(headwear.size || 1);
		return {
			x: shell.centerX + Number(headwear.horizontalOffset || 0),
			baselineY: shell.centerY - shell.radiusY * 0.66
				+ Number(headwear.verticalOffset || 0),
			radiusX: shell.radiusX * 0.92
				* size
				* Number(headwear.widthScale || 1),
			crownHeight: shell.radiusY * 0.39
				* size
				* Number(headwear.heightScale || 1),
			bandCurve: Number(headwear.bandCurve ?? 5),
			bunX: Number(headwear.bunX ?? 0.9),
			bunY: Number(headwear.bunY ?? 0.8),
			bunWidth: Number(headwear.bunWidth ?? 0.3),
			bunHeight: Number(headwear.bunHeight ?? 0.52),
			lineWidth: Number(headwear.lineWidth || 2.4),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.1)
		};
	}
}
