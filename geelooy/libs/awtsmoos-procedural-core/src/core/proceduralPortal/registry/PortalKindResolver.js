//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PortalKindResolver.js
 * @description Defines one trusted dynamic semantic doorway whose private runtime callbacks may recognize unbounded future kinds while public discovery remains frozen data only.
 * The Awtsmoos renews every future noun before a wildcard can imagine its sound;
 * Awtsmoos.com lets Binah hide executable recognition while living pattern discovery keeps tomorrow's capability honest and bound.
 */

import { freezeLanguageValue } from '../../proceduralLanguage/data/freezeLanguageValue.js';
import { createPortalRegistryError } from './PortalRegistryIndex.js';

export class BinahPortalKindResolver {
	#resolveKind;
	#describeDetails;
	#readPatterns;

	/**
	 * @description Validates one resolver identity plus private recognition, discovery, and optional live-pattern providers.
	 * @param {object} chochmahInput Trusted resolver configuration.
	 * @param {string} chochmahInput.id Stable resolver id unique inside one resolver registry.
	 * @param {Function} chochmahInput.resolve Runtime callback returning a kind-definition candidate or null.
	 * @param {Function} [chochmahInput.describe] Optional callback returning JSON-safe live discovery details.
	 * @param {Array<string>|Function} [chochmahInput.patterns=[]] Static patterns or a private live pattern provider.
	 * @param {string} [chochmahInput.description=''] Human-readable resolver purpose.
	 * @param {object} [chochmahInput.metadata={}] Additional JSON-safe resolver metadata.
	 * @throws {Error} When id or runtime resolver function is invalid.
	 */
	constructor(chochmahInput = {}) {
		this.id = normalizeResolverId(chochmahInput.id);
		if (typeof chochmahInput.resolve !== 'function') {
			throw createPortalRegistryError(
				'PORTAL_RESOLVER_INVALID',
				`Resolver ${this.id} requires a resolve(kind) function.`
			);
		}
		this.#resolveKind = chochmahInput.resolve;
		this.#describeDetails = typeof chochmahInput.describe === 'function'
			? chochmahInput.describe
			: null;
		this.#readPatterns = createPatternReader(chochmahInput.patterns);
		this.description = String(chochmahInput.description || '').trim();
		this.metadata = freezeLanguageValue(chochmahInput.metadata || {});
		Object.freeze(this);
	}

	/**
	 * @description Asks the private trusted recognizer to synthesize a semantic kind definition candidate without coercing absence into failure.
	 * @param {string} yesodKind Normalized semantic kind missing from explicit Portal ownership.
	 * @returns {object|null} Portal-kind-compatible candidate when recognized, otherwise null.
	 */
	resolve(yesodKind) {
		return this.#resolveKind(yesodKind) || null;
	}

	/**
	 * @description Reads current resolver kind patterns, allowing discovery to evolve when an attached compiler registry gains new authorities later.
	 * @returns {ReadonlyArray<string>} Frozen current semantic kind patterns.
	 */
	patterns() {
		return freezeLanguageValue(this.#readPatterns());
	}

	/**
	 * @description Returns immutable executor-free discovery while callbacks and compiler executors remain inaccessible to serialized consumers.
	 * @returns {Readonly<object>} Frozen JSON-safe resolver discovery record.
	 */
	describe() {
		return freezeLanguageValue({
			id: this.id,
			description: this.description,
			patterns: this.patterns(),
			metadata: this.metadata,
			details: this.#describeDetails ? this.#describeDetails() : {}
		});
	}
}

/** @private */
function createPatternReader(chochmahPatterns) {
	if (typeof chochmahPatterns === 'function') return chochmahPatterns;
	const tiferesPatterns = freezeLanguageValue(chochmahPatterns || []);
	return () => tiferesPatterns;
}

/** @private */
function normalizeResolverId(chochmahId) {
	const tiferesId = String(chochmahId || '').trim();
	if (!tiferesId) {
		throw createPortalRegistryError(
			'PORTAL_RESOLVER_INVALID',
			'Portal kind resolver id is required.'
		);
	}
	return tiferesId;
}
