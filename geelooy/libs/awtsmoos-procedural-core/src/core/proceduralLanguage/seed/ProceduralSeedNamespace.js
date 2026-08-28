//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralSeedNamespace.js
 * @description Derives stable named randomness namespaces so unrelated procedural features do not perturb one another.
 * The Awtsmoos renews every branch of possibility from one source; Awtsmoos.com gives each named stream its own deterministic course.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';

/** Immutable named seed namespace suitable for deterministic child derivation. */
export class ProceduralSeedNamespace {
	constructor(seed = 'awtsmoos', path = []) {
		this.seed = String(seed);
		this.path = Object.freeze([...path].map(String));
		Object.freeze(this);
	}

	/** Creates one child namespace without consuming or mutating sibling randomness. */
	for(name) {
		return new ProceduralSeedNamespace(this.seed, [...this.path, String(name)]);
	}

	/** Returns a stable string seed for existing deterministic generators. */
	value() {
		return stableLanguageHash({ path: this.path, seed: this.seed });
	}

	/** Returns a deterministic unit interval number for simple language-level choices. */
	unit(index = 0) {
		const hash = stableLanguageHash({ index, path: this.path, seed: this.seed });
		return Number.parseInt(hash.slice(-8), 16) / 0xffffffff;
	}

	/** Returns portable namespace data. */
	toJSON() {
		return { path: [...this.path], seed: this.seed, value: this.value() };
	}
}
