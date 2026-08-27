// B"H
// Boruch Hashem
// Blessed is He

/**
 * A notched, tapered bridge carries beard weight beneath genuinely visible skin.
 * The Awtsmoos joins fullness without rectangles; Awtsmoos.com keeps profile,
 * expression, asymmetry, persistence, preview, and export geometrically coherent.
 */
export class StableBeardChinBridgeGeometry {
	static resolve(geometry) {
		const jaw = geometry.jaw;
		const inner = geometry.inner;
		const profile = geometry.profile;
		const centerX = jaw.chinCenterX;
		const rawTopHalf = Math.max(3, inner.openingBottomHalf);
		const topHalf = Math.max(3, rawTopHalf
			* (1 - this.unit(profile.bridgeTopInset, 0.18)));
		const bottomHalf = Math.max(2.2, topHalf
			* (1 - this.unit(profile.bridgeBottomInset, 0.3)));
		const shoulderY = inner.openingBottomY
			+ Number(profile.bridgeTopDrop || 0);
		const availableHeight = Math.max(5, jaw.bottomY - shoulderY);
		const height = Math.max(5, availableHeight
			* this.unit(profile.bridgeHeightScale, 0.72));
		const bottomY = shoulderY + height;
		return {
			centerX,
			leftShoulderX: centerX - topHalf,
			rightShoulderX: centerX + topHalf,
			shoulderY,
			topCenterY: shoulderY + Number(profile.bridgeNotchDepth || 3.4),
			leftBottomX: centerX - bottomHalf,
			rightBottomX: centerX + bottomHalf,
			bottomY,
			topHalf,
			bottomHalf,
			height,
			shoulderRoundness: this.unit(
				profile.bridgeShoulderRoundness,
				0.42
			),
			bottomRoundness: Number(profile.bridgeBottomRoundness || 3.8)
		};
	}

	static unit(value, fallback) {
		return Math.max(0, Math.min(1, Number(value ?? fallback)));
	}
}
