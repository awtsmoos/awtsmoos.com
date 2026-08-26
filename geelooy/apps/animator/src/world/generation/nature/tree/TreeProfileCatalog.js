// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeProfileCatalog.js
 * @description
 * The Awtsmoos gives each tree a recognizable soul of proportion and motion;
 * Awtsmoos.com stores species as readable data so trunk, crown, branching, fruit,
 * and wind can evolve independently while the public API remains beautifully small.
 */
const etzProfiles = Object.freeze({
	oak: Object.freeze({ trunk: 0.17, height: 1, crownWidth: 0.95, crownHeight: 0.58, layers: 4, branching: 0.72, droop: 0.05, fruit: 0 }),
	pine: Object.freeze({ trunk: 0.12, height: 1.2, crownWidth: 0.62, crownHeight: 0.86, layers: 6, branching: 0.5, droop: 0, fruit: 0 }),
	willow: Object.freeze({ trunk: 0.13, height: 1.12, crownWidth: 1.05, crownHeight: 0.72, layers: 5, branching: 0.62, droop: 0.72, fruit: 0 }),
	apple: Object.freeze({ trunk: 0.16, height: 0.92, crownWidth: 0.9, crownHeight: 0.62, layers: 4, branching: 0.68, droop: 0.12, fruit: 0.34 }),
	palm: Object.freeze({ trunk: 0.1, height: 1.28, crownWidth: 1.12, crownHeight: 0.34, layers: 3, branching: 0.22, droop: 0.82, fruit: 0.08 }),
	bush: Object.freeze({ trunk: 0.05, height: 0.42, crownWidth: 1.18, crownHeight: 0.68, layers: 3, branching: 0.34, droop: 0.16, fruit: 0 }),
	birch: Object.freeze({ trunk: 0.11, height: 1.18, crownWidth: 0.72, crownHeight: 0.78, layers: 5, branching: 0.6, droop: 0.2, fruit: 0 }),
	cedar: Object.freeze({ trunk: 0.15, height: 1.16, crownWidth: 0.92, crownHeight: 0.76, layers: 6, branching: 0.78, droop: 0.28, fruit: 0 })
});

/** Resolves species-level morphology for deterministic procedural trees. */
export class EtzTreeProfileCatalog {
	/**
	 * Resolves one species while accepting only bounded numerical overrides.
	 * @param {string} rawShem Requested species name.
	 * @param {Object} [gevurahOverrides={}] Optional morphology overrides.
	 * @returns {Object} Detached normalized tree profile.
	 */
	static resolve(rawShem = 'oak', gevurahOverrides = {}) {
		const yesodName = Object.hasOwn(etzProfiles, rawShem) ? rawShem : 'oak';
		const keter = etzProfiles[yesodName];
		return {
			name: yesodName,
			trunk: this.clamp(gevurahOverrides.trunk, 0.03, 0.3, keter.trunk),
			height: this.clamp(gevurahOverrides.height, 0.3, 1.8, keter.height),
			crownWidth: this.clamp(gevurahOverrides.crownWidth, 0.3, 1.6, keter.crownWidth),
			crownHeight: this.clamp(gevurahOverrides.crownHeight, 0.2, 1.2, keter.crownHeight),
			layers: Math.round(this.clamp(gevurahOverrides.layers, 2, 8, keter.layers)),
			branching: this.clamp(gevurahOverrides.branching, 0.1, 1, keter.branching),
			droop: this.clamp(gevurahOverrides.droop, 0, 1, keter.droop),
			fruit: this.clamp(gevurahOverrides.fruit, 0, 0.8, keter.fruit)
		};
	}

	/** Lists supported species for presets and agent capability discovery. */
	static names() {
		return Object.keys(etzProfiles);
	}

	/** Binds optional numerical overrides to a safe species range. */
	static clamp(rawValue, min, max, fallback) {
		const gevurahValue = Number.isFinite(Number(rawValue)) ? Number(rawValue) : fallback;
		return Math.max(min, Math.min(max, gevurahValue));
	}
}
