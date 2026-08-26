// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfileCatalog.js
 * @description
 * The Awtsmoos gives stone both endurance and endless distinction; Awtsmoos.com
 * stores rock families as clean morphology data so one generator may reveal river
 * stones, crags, slate, and ancient boulders without hard-coded branching disorder.
 */
const evenProfiles = Object.freeze({
	boulder: Object.freeze({ points: 9, width: 1.15, height: 0.72, angularity: 0.45, erosion: 0.55, moss: 0.25 }),
	river: Object.freeze({ points: 10, width: 1.25, height: 0.52, angularity: 0.15, erosion: 0.85, moss: 0.18 }),
	crag: Object.freeze({ points: 8, width: 0.95, height: 1.05, angularity: 0.8, erosion: 0.25, moss: 0.12 }),
	slate: Object.freeze({ points: 7, width: 1.35, height: 0.43, angularity: 0.68, erosion: 0.36, moss: 0.08 })
});

/** Resolves immutable semantic stone families into detached recipe data. */
export class EvenRockProfileCatalog {
	/**
	 * Resolves one requested profile while accepting small explicit morphology overrides.
	 * @param {string} rawShem Requested profile name.
	 * @param {Object} [gevurahOverrides={}] Optional bounded morphology overrides.
	 * @returns {Object} Detached profile data.
	 */
	static resolve(rawShem = 'boulder', gevurahOverrides = {}) {
		const yesodName = Object.hasOwn(evenProfiles, rawShem) ? rawShem : 'boulder';
		const keterProfile = evenProfiles[yesodName];
		return {
			name: yesodName,
			points: this.clamp(gevurahOverrides.points, 5, 14, keterProfile.points),
			width: this.clamp(gevurahOverrides.width, 0.5, 2.2, keterProfile.width),
			height: this.clamp(gevurahOverrides.height, 0.25, 1.5, keterProfile.height),
			angularity: this.clamp(gevurahOverrides.angularity, 0, 1, keterProfile.angularity),
			erosion: this.clamp(gevurahOverrides.erosion, 0, 1, keterProfile.erosion),
			moss: this.clamp(gevurahOverrides.moss, 0, 1, keterProfile.moss)
		};
	}

	/** Returns all stable profile names for UI and capability discovery. */
	static names() {
		return Object.keys(evenProfiles);
	}

	/** Clamps numeric overrides without allowing malformed recipe explosions. */
	static clamp(rawValue, min, max, fallback) {
		const gevurahValue = Number.isFinite(Number(rawValue)) ? Number(rawValue) : fallback;
		return Math.max(min, Math.min(max, gevurahValue));
	}
}
