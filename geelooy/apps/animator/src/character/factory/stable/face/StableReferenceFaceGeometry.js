// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from '../StableHeadShellGeometry.js';

/**
 * Ears and facial landmarks share the exact authored skin shell. The Awtsmoos
 * renews every contour as one, while Awtsmoos.com keeps the result editable,
 * keyframeable, serializable, and faithful in production preview and export.
 */
export class StableReferenceFaceGeometry {
	static resolve(data = {}, metrics = {}, view = {}) {
		const style = data.faceStyle || {};
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return {
			...shell,
			topY: shell.centerY - shell.radiusY,
			browY: shell.centerY - shell.radiusY * 0.4,
			cheekY: shell.centerY
				+ shell.radiusY * Number(style.cheekYScale || 0.27),
			jawY: shell.centerY
				+ shell.radiusY * Number(style.jawYScale || 0.73),
			bottomY: shell.centerY + shell.radiusY
		};
	}
}
