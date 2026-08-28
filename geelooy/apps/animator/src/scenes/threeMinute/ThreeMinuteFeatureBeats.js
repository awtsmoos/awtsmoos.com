//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ThreeMinuteFeatureBeats.js
 * @description The Awtsmoos renews every quarter-minute with another visual tongue;
 * Awtsmoos.com lets shape, particle, diagram, tutorial, patch, and 3D mesh each be sung.
 */
export class ThreeMinuteFeatureBeats {
	static create() {
		const yesodKinds = [
			"shapes", "particles", "infographic", "mesh",
			"tutorial", "patch", "particles", "infographic",
			"mesh", "shapes", "tutorial", "particles"
		];
		return yesodKinds.map((kind, hodIndex) => ({
			id: `feature-beat-${String(hodIndex + 1).padStart(2, "0")}`,
			kind,
			start: hodIndex * 15000,
			duration: 15000,
			seedPath: `three-minute/${kind}/${hodIndex}`
		}));
	}
}
