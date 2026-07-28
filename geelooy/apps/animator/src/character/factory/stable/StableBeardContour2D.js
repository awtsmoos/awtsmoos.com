// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Cheek-rooted wings flow into a tapered jaw while speech remains naturally open.
 * The Awtsmoos renews boundary around voice; Awtsmoos.com keeps width, depth,
 * asymmetry, and identity deterministic without a painted eraser aperture.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const p = this.points(geometry);
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: p.leftRootX, y: p.leftRootY },
			...this.leftJaw(p),
			{ type: 'quad', cx: p.chinX, cy: p.bottomY + p.roundness, x: p.rightChinX, y: p.bottomY },
			...this.rightJaw(p),
			...this.mouthNotch(p),
			{ type: 'close' }
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static points(g) {
		const leftWidth = Number(g.leftWidth || g.width);
		const rightWidth = Number(g.rightWidth || g.width);
		const lowerHalf = g.bottomHalf * g.taper;
		const chinX = Number(g.chinCenterX ?? g.centerX);
		const openingHalf = g.openingHalf * g.innerWidthScale;
		return {
			leftRootX: g.centerX - leftWidth * g.topInset * g.rootInsetScale,
			leftRootY: g.topY + 3,
			leftSideX: g.centerX - leftWidth * g.sideWidthScale,
			rightRootX: g.centerX + rightWidth * g.topInset * g.rootInsetScale,
			rightRootY: g.topY + 3,
			rightSideX: g.centerX + rightWidth * g.sideWidthScale,
			sideY: g.sideY,
			bottomY: g.bottomY,
			chinX,
			leftChinX: chinX - lowerHalf,
			rightChinX: chinX + lowerHalf,
			roundness: g.bottomRoundness * 7,
			leftNotchX: g.openingCenterX - openingHalf,
			rightNotchX: g.openingCenterX + openingHalf,
			notchShoulderY: g.openingTopY + g.innerShoulderOffset,
			notchBottomY: g.openingBottomY + g.innerBottomOffset,
			openingX: g.openingCenterX
		};
	}

	static leftJaw(p) {
		return [
			{ type: 'bezier', c1x: p.leftRootX - 6, c1y: p.leftRootY + 7, c2x: p.leftSideX - 2, c2y: p.sideY - 6, x: p.leftSideX, y: p.sideY },
			{ type: 'bezier', c1x: p.leftSideX + 3, c1y: p.bottomY - 11, c2x: p.leftChinX - 4, c2y: p.bottomY, x: p.leftChinX, y: p.bottomY }
		];
	}

	static rightJaw(p) {
		return [
			{ type: 'bezier', c1x: p.rightChinX + 4, c1y: p.bottomY, c2x: p.rightSideX - 3, c2y: p.bottomY - 11, x: p.rightSideX, y: p.sideY },
			{ type: 'bezier', c1x: p.rightSideX + 2, c1y: p.sideY - 6, c2x: p.rightRootX + 6, c2y: p.rightRootY + 7, x: p.rightRootX, y: p.rightRootY }
		];
	}

	static mouthNotch(p) {
		return [
			{ type: 'bezier', c1x: p.rightRootX - 3, c1y: p.rightRootY + 5, c2x: p.rightNotchX + 4, c2y: p.notchShoulderY - 3, x: p.rightNotchX, y: p.notchShoulderY },
			{ type: 'bezier', c1x: p.rightNotchX - 2, c1y: p.notchBottomY - 1, c2x: p.openingX + 5, c2y: p.notchBottomY, x: p.openingX, y: p.notchBottomY },
			{ type: 'bezier', c1x: p.openingX - 5, c1y: p.notchBottomY, c2x: p.leftNotchX + 2, c2y: p.notchBottomY - 1, x: p.leftNotchX, y: p.notchShoulderY },
			{ type: 'bezier', c1x: p.leftNotchX - 4, c1y: p.notchShoulderY - 3, c2x: p.leftRootX + 3, c2y: p.leftRootY + 5, x: p.leftRootX, y: p.leftRootY }
		];
	}
}
