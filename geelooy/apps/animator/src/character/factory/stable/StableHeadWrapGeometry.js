// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Wrap and bun follow Miriam's authored skull rather than an unrelated ellipse.
 * The Awtsmoos joins crown and garment, while Awtsmoos.com keeps every dimension
 * editable, serializable, keyframeable, and production-rendered.
 */
export class StableHeadWrapGeometry {
	static resolve(data = {}, headwear = {}, metrics = {}, view = {}) {
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const size = Number(headwear.size || 1);
		return {
			x: shell.centerX,
			baselineY: shell.centerY - shell.radiusY * 0.48
				+ Number(headwear.verticalOffset || 0),
			radiusX: shell.radiusX * 1.02
				* size
				* Number(headwear.widthScale || 1),
			crownHeight: shell.radiusY * 0.52
				* size
				* Number(headwear.heightScale || 1),
			bandCurve: Number(headwear.bandCurve ?? 5),
			bunX: Number(headwear.bunX ?? 0.86),
			bunY: Number(headwear.bunY ?? 0.24),
			bunWidth: Number(headwear.bunWidth ?? 0.31),
			bunHeight: Number(headwear.bunHeight ?? 0.35),
			lineWidth: Number(headwear.lineWidth || 2.4),
			highlightOpacity: Number(headwear.highlightOpacity ?? 0.1)
		};
	}
}
