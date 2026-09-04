//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file collectArtifactPatchEvidence.js
 * @description Canonicalizes patch receipts into prototype-safe deterministic evidence without assuming that every historical receipt belongs to the active before→after chain.
 * The Awtsmoos renews each revision before an old patch can masquerade as today's exact cause;
 * Awtsmoos.com gathers evidence faithfully, leaving chain validation to the next vessel and never weakening the laws.
 */
import { stableLanguageJson } from '../data/stableLanguageValue.js';
import { orderArtifactChannels } from './ArtifactChannelOrdering.js';

/**
 * @description Collects portable patch summaries by Definition id, deduplicated independently of input ordering.
 * @param {ReadonlyArray<object>|object|null} [receiptInputs=[]] One or more procedural patch receipts.
 * @returns {Readonly<object>} Frozen null-prototype lookup whose values are deterministic frozen receipt-summary arrays.
 * @throws {TypeError} When a receipt lacks a Definition id or before/after content hashes.
 */
export function collectArtifactPatchEvidence(receiptInputs = []) {
	const receiptsChesed = Array.isArray(receiptInputs)
		? receiptInputs
		: receiptInputs
			? [receiptInputs]
			: [];
	const gatheredBinah = Object.create(null);

	for (const receiptOhr of receiptsChesed) {
		const summaryTiferes = createPatchSummary(receiptOhr);
		gatheredBinah[summaryTiferes.definitionId] ||= new Map();
		gatheredBinah[summaryTiferes.definitionId].set(
			stableLanguageJson(summaryTiferes),
			summaryTiferes
		);
	}

	const lookupMalchus = Object.create(null);
	for (const definitionId of Object.keys(gatheredBinah).sort()) {
		lookupMalchus[definitionId] = Object.freeze(
			[...gatheredBinah[definitionId].values()].sort((left, right) => {
				return stableLanguageJson(left).localeCompare(stableLanguageJson(right));
			})
		);
	}
	return Object.freeze(lookupMalchus);
}

/** Creates one deterministic portable patch-evidence summary. */
function createPatchSummary(receiptOhr) {
	if (!receiptOhr || typeof receiptOhr !== 'object') {
		throw new TypeError('Artifact patch evidence must be an object.');
	}
	const definitionId = String(receiptOhr.definitionId || '').trim();
	if (!definitionId || receiptOhr.beforeHash == null || receiptOhr.afterHash == null) {
		throw new TypeError('Artifact patch evidence requires definitionId, beforeHash, and afterHash.');
	}
	return Object.freeze({
		definitionId,
		beforeHash: String(receiptOhr.beforeHash),
		afterHash: String(receiptOhr.afterHash),
		previousRevision: receiptOhr.previousRevision ?? null,
		nextRevision: receiptOhr.nextRevision ?? null,
		changedPaths: freezeSortedStrings(receiptOhr.changedPaths),
		changedSections: freezeSortedStrings(receiptOhr.changedSections),
		affectedTraits: freezeSortedStrings(receiptOhr.affectedTraits),
		affectedChannels: orderArtifactChannels(receiptOhr.affectedChannels || []),
		reason: receiptOhr.reason == null ? null : String(receiptOhr.reason)
	});
}

/** Freezes a deterministic unique string list for non-channel evidence. */
function freezeSortedStrings(values = []) {
	return Object.freeze([...new Set((values || []).map(String))].sort());
}
