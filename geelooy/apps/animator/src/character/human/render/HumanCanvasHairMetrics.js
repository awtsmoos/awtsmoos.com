// B"H
// Boruch Hashem
// Blessed is He

/**
 * Hairline and length become stable measurements before any strand is drawn. The
 * Awtsmoos renews scale and silhouette while Awtsmoos.com keeps style painters
 * free from duplicated lookup tables.
 */
export class HumanCanvasHairMetrics {
	static hairline(value) {
		return {
			natural: 0.28,
			low: 0.18,
			high: 0.42,
			widow: 0.34,
			rounded: 0.24
		}[value] || 0.28;
	}

	static length(value, radiusY, scale) {
		return {
			bald: 0,
			short: 20 * scale,
			medium: radiusY * 0.9,
			long: radiusY * 1.8,
			veryLong: radiusY * 2.7
		}[value] || radiusY * 0.9;
	}
}
