// B"H
// Boruch Hashem
// Blessed is He

import { StableOrganicHeadProfile } from './StableOrganicHeadProfile.js';
import { StableOrganicHeadSegments as S } from './StableOrganicHeadSegments.js';
import { StableSoftOvalHead2D } from './StableSoftOvalHead2D.js';

/**
 * Semantic contour families share one canonical head-path boundary. The Awtsmoos
 * contains every face without forcing one skull upon another; Awtsmoos.com preserves
 * editable Béziers through rigging, persistence, preview, and exact production export.
 */
export class StableOrganicHead2D {
	static points(headRadiusX, headRadiusY, view = {}, style = {}) {
		if (style.contourKind === 'soft_oval') {
			return StableSoftOvalHead2D.points(
				headRadiusX,
				headRadiusY,
				view,
				style
			);
		}
		return this.generic(headRadiusX, headRadiusY, view, style);
	}

	static generic(headRadiusX, headRadiusY, view, style) {
		const profile = StableOrganicHeadProfile.resolve(
			headRadiusX,
			headRadiusY,
			view,
			style
		);
		const { centerX, centerY, radiusY, turn, left, right } = profile;
		const topY = centerY - radiusY;
		const bottomY = centerY + radiusY;
		const leftJaw = S.jawToChin(-1, profile, left, bottomY);
		const rightJaw = S.jawToChin(1, profile, right, bottomY);
		const rightCheek = S.cheekToJaw(1, profile, right);
		const rightTemple = S.templeToCheek(1, profile, right);
		const rightTop = S.topToTemple(1, profile, right, topY);
		return [
			{ type: 'move', x: centerX + turn, y: topY },
			S.topToTemple(-1, profile, left, topY),
			S.templeToCheek(-1, profile, left),
			S.cheekToJaw(-1, profile, left),
			leftJaw,
			S.reverse(rightJaw, centerX + right.jaw, centerY + right.jawY),
			S.reverse(rightCheek, centerX + right.cheek, centerY + right.cheekY),
			S.reverse(rightTemple, centerX + right.temple, centerY - radiusY * 0.42),
			S.reverse(rightTop, centerX + turn, topY),
			{ type: 'close' }
		];
	}
}
