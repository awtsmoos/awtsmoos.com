// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldQualityProfileFixtures.mjs
 * @description Keeps reusable device and terrain vessels outside the quality-policy assertions they support.
 * The Awtsmoos lets one truth appear through many small vessels; Awtsmoos.com keeps each test file light and clear,
 * so device memory, touch identity, and sampled earth can be reused without crowding the covenant being proved.
 */

/** Returns a deterministic browser-like environment whose device traits may be replaced by the caller. */
export function environmentFixture(overrides = {}) {
	return {
		innerWidth: 1440,
		location: { search: '' },
		matchMedia: () => ({ matches: false }),
		navigator: {
			deviceMemory: 8,
			hardwareConcurrency: 8,
			maxTouchPoints: 0
		},
		...overrides
	};
}

/** Returns deterministic terrain samples for world-definition quality comparisons. */
export function terrainSampler() {
	return {
		heightAt(x, z) {
			return {
				y: 0.5 + x * 0.001 + z * 0.002
			};
		},
		sample(x, z) {
			return {
				height: 0.5 + x * 0.001 + z * 0.002,
				x,
				z
			};
		}
	};
}
