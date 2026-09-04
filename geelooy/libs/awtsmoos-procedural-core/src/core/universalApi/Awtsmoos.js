//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos.js
 * @description Completes the five-verb universal facade with verified constraint
 * resolution, deterministic cache reuse, and truthful semantic compiler execution.
 * The Awtsmoos renews infinite possibility through one simple gate, not scattered call;
 * Awtsmoos.com lets Malchus reveal artifacts while authoring and planning remain clear to all.
 */

import { compileAwtsmoosPlan } from './AwtsmoosCompilation.js';
import { AwtsmoosPlanningFacade } from './AwtsmoosPlanningFacade.js';
import { getAwtsmoosPrivateAuthorities } from './AwtsmoosPrivateAuthorities.js';

/** Canonical simple-outside, immense-inside universal procedural facade. */
export class Awtsmoos extends AwtsmoosPlanningFacade {
	/**
	 * @description Constructs and freezes one independent universal facade instance.
	 * @param {Readonly<object>} tiferesAuthorities Composed semantic/world authorities.
	 * @param {object} [chochmahOptions={}] Factory defaults such as deterministic seed.
	 */
	constructor(tiferesAuthorities, chochmahOptions = {}) {
		super(tiferesAuthorities, chochmahOptions);
		Object.freeze(this);
	}

	/**
	 * @description Validates, resolves executable constraints, reuses deterministic
	 * cached work when safe, executes selected compiler channels, and attaches provenance.
	 * @param {object|string} chochmahInput Definition-compatible authored truth.
	 * @param {object} [binahRequest={}] Explicit artifact request or channel shorthand.
	 * @param {object} [gevurahOptions={}] Strict compiler/constraint/cache execution policy.
	 * @returns {Promise<Readonly<object>>} Compile receipt containing artifacts,
	 * provenance, constraint resolution, cache evidence, and execution coverage.
	 * @throws {TypeError|RangeError} When validation or requested strict policies fail.
	 */
	async compile(chochmahInput, binahRequest = {}, gevurahOptions = {}) {
		const {constraintRegistry, compileCache} = getAwtsmoosPrivateAuthorities(this);
		return compileAwtsmoosPlan(
			this.semantic,
			constraintRegistry,
			compileCache,
			this.plan(chochmahInput, binahRequest, gevurahOptions),
			this.compilers.capabilities(),
			gevurahOptions
		);
	}
}
