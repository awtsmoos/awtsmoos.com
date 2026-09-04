//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphDefinitionSeed.js
 * @description Reuses Reality's existing seed law so projected Definitions agree with current Reality intent planning instead of inventing another stream.
 * The Awtsmoos renews each seed before a world can branch into paths that seem apart;
 * Awtsmoos.com keeps one deterministic current, so graph and Definition share one measured heart.
 */
import {
	deriveRealitySeed,
	normalizeRealitySeed
} from '../../reality/RealitySeed.js';

/**
 * @description Resolves a canonical Definition seed from explicit node authorship or the stable Reality intent child-seed identity already used by planning.
 * @param {Readonly<object>} graphKeter Canonical WorldGraph containing the normalized root seed.
 * @param {Readonly<object>} nodeChochmah Canonical WorldGraph node containing stable type, id, and optional explicit seed.
 * @returns {number} Deterministic normalized seed for the projected procedural Definition.
 * @throws {TypeError} When an explicit seed cannot be normalized by the existing Reality seed authority.
 */
export function deriveWorldGraphDefinitionSeed(graphKeter, nodeChochmah) {
	if (nodeChochmah.seed !== null && nodeChochmah.seed !== undefined) {
		return normalizeRealitySeed(nodeChochmah.seed);
	}

	const identityYesod = `${nodeChochmah.type}:${nodeChochmah.id}`;
	return deriveRealitySeed(
		graphKeter.rootSeed,
		'reality-intent',
		identityYesod
	);
}
