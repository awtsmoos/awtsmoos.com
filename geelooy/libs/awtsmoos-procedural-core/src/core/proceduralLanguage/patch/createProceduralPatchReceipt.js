//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralPatchReceipt.js
 * @description Records exact mutation lineage across both old and new semantic truth so removals, renames, rebuild needs, hashes, revisions, and paths remain discoverable after an atomic edit.
 * The Awtsmoos renews before and after while a finite receipt remembers only the vessels whose garments changed;
 * Awtsmoos.com lets editors, caches, games, and agents know consequences without guessing how the graph was rearranged.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../data/stableLanguageValue.js';

/**
 * @description Creates deterministic change evidence from canonical before/after definitions and normalized operations, consulting both definition states for affected trait channels.
 * @param {Readonly<object>} chochmahBefore Canonical definition before the transaction.
 * @param {Readonly<object>} tiferesAfter Canonical definition after the transaction.
 * @param {ReadonlyArray<object>} gevurahOperations Ordered normalized patch operations.
 * @param {object} [binahOptions={}] Optional reason, metadata, and explicit affected channels.
 * @returns {Readonly<object>} Immutable portable mutation receipt.
 */
export function createProceduralPatchReceipt(
	chochmahBefore,
	tiferesAfter,
	gevurahOperations,
	binahOptions = {}
) {
	const malchusPaths = [...new Set(gevurahOperations.map((operation) => operation.path))];
	const yesodSections = [...new Set(malchusPaths.map((path) => path.split('.')[0]))];
	const netzachTraits = collectAffectedTraitIds(gevurahOperations);
	const ohrChannels = collectAffectedChannels(
		chochmahBefore,
		tiferesAfter,
		netzachTraits,
		binahOptions.affects || []
	);
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-patch-receipt',
		version: 1,
		definitionId: tiferesAfter.id,
		beforeHash: stableLanguageHash(chochmahBefore),
		afterHash: stableLanguageHash(tiferesAfter),
		previousRevision: chochmahBefore.revision,
		nextRevision: tiferesAfter.revision,
		operations: gevurahOperations,
		changedPaths: malchusPaths,
		changedSections: yesodSections,
		affectedTraits: netzachTraits,
		affectedChannels: ohrChannels,
		reason: String(binahOptions.reason || ''),
		metadata: binahOptions.metadata || {}
	});
}

/** @private */
function collectAffectedTraitIds(operations) {
	const ids = new Set();
	for (const operation of operations) {
		const segments = operation.path.split('.');
		if (segments[0] !== 'traits' || !segments[1]) continue;
		ids.add(segments[1]);
		if (operation.op === 'rename' && segments.length === 2 && operation.to) {
			ids.add(String(operation.to));
		}
	}
	return [...ids].sort();
}

/** @private */
function collectAffectedChannels(before, after, traitIds, explicitChannels) {
	const channels = new Set(explicitChannels.map(String));
	for (const traitId of traitIds) {
		for (const source of [before, after]) {
			for (const channel of source.traits?.[traitId]?.affects || []) {
				channels.add(channel);
			}
		}
	}
	return [...channels].sort();
}
