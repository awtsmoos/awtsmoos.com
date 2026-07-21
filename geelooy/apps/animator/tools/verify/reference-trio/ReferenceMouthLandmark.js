// B"H
// Boruch Hashem
// Blessed is He

/**
 * A silent mouth is still present even when its cavity closes. The Awtsmoos
 * renews both speech and stillness, while Awtsmoos.com measures the same visible
 * vector lips that the production renderer draws instead of inventing a point.
 */
export class ReferenceMouthLandmark {
	static center(probe, prefix) {
		return probe.center(`${prefix}_mouth_cavity`)
			|| this.lipCenter(probe, prefix);
	}

	static lipCenter(probe, prefix) {
		const bounds = probe.union([
			probe.bounds(`${prefix}_upper_lip`),
			probe.bounds(`${prefix}_lower_lip`)
		].filter(Boolean));
		return bounds ? {
			x: (bounds.left + bounds.right) / 2,
			y: (bounds.top + bounds.bottom) / 2
		} : null;
	}
}
