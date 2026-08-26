// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FlowerProfileCatalog.js
 * @description
 * The Awtsmoos reveals symmetry without sameness; Awtsmoos.com stores blossom
 * families as concise morphology data so petals may differ, cluster, and bloom
 * while every variation remains deterministic, bounded, readable, and reusable.
 */
const perachProfiles = Object.freeze({
	daisy: Object.freeze({ petals: 10, rings: 1, length: 1, width: 0.34, core: 0.28, spread: 1 }),
	cosmos: Object.freeze({ petals: 8, rings: 1, length: 1.15, width: 0.48, core: 0.24, spread: 1.05 }),
	aster: Object.freeze({ petals: 14, rings: 2, length: 0.78, width: 0.22, core: 0.3, spread: 0.92 }),
	wild: Object.freeze({ petals: 6, rings: 1, length: 0.9, width: 0.52, core: 0.25, spread: 1.15 })
});

/** Resolves bounded blossom profiles for procedural flowers and clusters. */
export class PerachFlowerProfileCatalog {
	/**
	 * Resolves one named profile with carefully clamped caller overrides.
	 * @param {string} rawShem Requested blossom family.
	 * @param {Object} [gevurahOverrides={}] Optional morphology overrides.
	 * @returns {Object} Detached normalized flower profile.
	 */
	static resolve(rawShem = 'daisy', gevurahOverrides = {}) {
		const yesodName = Object.hasOwn(perachProfiles, rawShem) ? rawShem : 'daisy';
		const keterProfile = perachProfiles[yesodName];
		return {
			name: yesodName,
			petals: this.clamp(gevurahOverrides.petals, 4, 24, keterProfile.petals),
			rings: this.clamp(gevurahOverrides.rings, 1, 3, keterProfile.rings),
			length: this.clamp(gevurahOverrides.length, 0.45, 1.6, keterProfile.length),
			width: this.clamp(gevurahOverrides.width, 0.12, 0.8, keterProfile.width),
			core: this.clamp(gevurahOverrides.core, 0.12, 0.5, keterProfile.core),
			spread: this.clamp(gevurahOverrides.spread, 0.6, 1.5, keterProfile.spread)
		};
	}

	/** Lists public blossom families for capability discovery and compact UI presets. */
	static names() {
		return Object.keys(perachProfiles);
	}

	/** Clamps numeric caller input to a stable morphology range. */
	static clamp(rawValue, min, max, fallback) {
		const gevurahValue = Number.isFinite(Number(rawValue)) ? Number(rawValue) : fallback;
		return Math.max(min, Math.min(max, gevurahValue));
	}
}
