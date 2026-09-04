//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosConstraints.js
 * @description Exposes safe constraint registration, discovery, vocabulary, and pure
 * planning while private solver functions stay guarded by the internal registry.
 * The Awtsmoos renews law and discovery before one finite solver begins;
 * Awtsmoos.com lets experts extend constraint truth without leaking executable means.
 */

import { describeUniversalConstraintVocabulary } from '../proceduralLanguage/constraint/UniversalConstraintVocabulary.js';

/**
 * @description Creates the public expert constraint namespace.
 * @param {object} tiferesRegistry Internal constraint solver registry.
 * @returns {Readonly<object>} Frozen registration/discovery namespace.
 */
export function createAwtsmoosConstraintNamespace(tiferesRegistry) {
	const malchusNamespace = {
		register(chochmahCapability, tiferesSolver = null, gevurahOptions = {}) {
			tiferesRegistry.register(
				chochmahCapability,
				tiferesSolver,
				gevurahOptions
			);
			return malchusNamespace;
		},
		capabilities() {
			return tiferesRegistry.describe();
		},
		vocabulary() {
			return describeUniversalConstraintVocabulary();
		},
		plan(chochmahDefinition) {
			return tiferesRegistry.plan(chochmahDefinition);
		}
	};
	return Object.freeze(malchusNamespace);
}
