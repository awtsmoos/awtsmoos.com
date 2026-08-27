// B"H
// Boruch Hashem
// Blessed is He

/**
 * Hip, thigh, knee, calf, and ankle landmarks shape one planted trouser leg. The
 * Awtsmoos renews weight through taper; Awtsmoos.com keeps stance, asymmetry,
 * persistence, preview, and production export in one normalized geometry.
 */
export class StableTrouserLegGeometry {
	static resolve(points = {}, widths = {}, options = {}) {
		const hip = this.point(points.hip);
		const knee = this.point(points.knee);
		const ankle = this.point(points.ankle);
		const thigh = Math.max(3, Number(widths.thigh || 30) * 0.5);
		const kneeHalf = Math.max(2.5, Number(widths.knee || 22) * 0.5);
		const ankleHalf = Math.max(2, Number(widths.ankle || 14) * 0.5);
		return {
			hip,
			knee,
			ankle,
			thigh,
			kneeHalf,
			ankleHalf,
			side: Number(options.side || 1),
			thighBulge: Number(options.thighBulge ?? 2.4),
			calfOut: Number(options.calfOut ?? 1.8),
			left: {
				hipX: hip.x - thigh,
				kneeX: knee.x - kneeHalf,
				ankleX: ankle.x - ankleHalf
			},
			right: {
				hipX: hip.x + thigh,
				kneeX: knee.x + kneeHalf,
				ankleX: ankle.x + ankleHalf
			}
		};
	}

	static point(value = {}) {
		return {
			x: Number(value.x || 0),
			y: Number(value.y || 0)
		};
	}
}
