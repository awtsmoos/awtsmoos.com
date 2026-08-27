// B"H
// Boruch Hashem
// Blessed is He

/**
 * Each beard wing meets the tapered bridge while preserving real mouth skin. The
 * Awtsmoos renews left and right without mirrored masks; Awtsmoos.com preserves
 * asymmetry, view, expression, persistence, preview, and production export.
 */
export class StableBeardWingGeometry {
	static resolve(geometry, side) {
		const roots = geometry.roots;
		const bridge = geometry.bridge;
		const inner = geometry.inner;
		const left = side < 0;
		return {
			side,
			rootX: left ? roots.leftRootX : roots.rightRootX,
			rootY: left ? roots.leftRootY : roots.rightRootY,
			cheekX: left ? roots.leftCheekX : roots.rightCheekX,
			cheekY: roots.cheekY,
			jawX: left ? roots.leftJawX : roots.rightJawX,
			jawY: roots.jawY,
			lowerX: left ? bridge.leftBottomX : bridge.rightBottomX,
			lowerY: bridge.bottomY,
			bridgeX: left ? bridge.leftShoulderX : bridge.rightShoulderX,
			bridgeY: bridge.shoulderY,
			openingX: left ? inner.openingLeftX : inner.openingRightX,
			openingY: left ? inner.openingLeftY : inner.openingRightY
		};
	}
}
