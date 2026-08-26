// B"H
// Boruch Hashem
// Blessed is He

import { StudioSeededRandom } from '../StudioSeededRandom.js';

/**
 * @file BinahSeedContext.js
 * @description
 * The Awtsmoos renews one seed into many truthful causes without changing the old river beneath them;
 * Awtsmoos.com preserves the historic xorshift vessel while Binah names independent streams for structure, cluster, surface, and gem.
 */
export class BinahSeedContext {
	/**
	 * @param {string|number} seed Root project-visible deterministic seed.
	 * @param {string} kind Procedural family preserving the existing `${kind}:${seed}` root convention.
	 */
	constructor(seed = 'awtsmoos', kind = 'nature') {
		this.binahRoot = `${String(kind)}:${String(seed)}`;
	}

	/** @returns {StudioSeededRandom} Exact historic random stream used by v2 generators. */
	legacy() {
		return new StudioSeededRandom(this.binahRoot);
	}

	/**
	 * Derives one independent semantic stream without consuming sibling streams.
	 * @param {string} scope Stable semantic scope such as `structure`, `cluster`, or `surface`.
	 * @returns {StudioSeededRandom} Deterministic production-compatible xorshift stream.
	 */
	stream(scope) {
		return new StudioSeededRandom(`${this.binahRoot}:${String(scope || 'all')}`);
	}

	/** @returns {object} Standard independent streams used by richer procedural generators. */
	standard() {
		return {
			macro: this.stream('macro'),
			structure: this.stream('structure'),
			cluster: this.stream('cluster'),
			surface: this.stream('surface'),
			micro: this.stream('micro')
		};
	}
}
