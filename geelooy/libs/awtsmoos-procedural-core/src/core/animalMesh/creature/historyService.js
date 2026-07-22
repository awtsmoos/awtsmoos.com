// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { refreshBriahCreature } from "./documents.js";
import { applyCreatureMutation } from "./mutationDispatcher.js";

/**
 * Replays committed operation batches from the original Briah revelation. Batches
 * preserve transaction revision boundaries, so deterministic IDs, hashes, and
 * lineage match the history that actually entered the store.
 * @param {Object} record - Creature artifact record.
 * @returns {Object} Replayed document and hash comparison.
 */
export function replayCreatureHistory(record) {
	let document = cloneCreatureValue(record.origin);
	for (const batch of record.history) {
		for (const entry of batch.operations) {
			applyCreatureMutation(document, entry.operation, cloneCreatureValue(entry.arguments));
		}
		document = refreshBriahCreature(document);
	}
	return {
		document,
		matchesCurrent: document.contentHash === record.document.contentHash,
		expectedHash: record.document.contentHash,
		actualHash: document.contentHash,
		historyLength: record.history.length
	};
}

export function undoCreatureRecord(record) {
	if (!record.undoStack.length) {
		return { changed: false, revision: record.document.revision };
	}
	record.redoStack.push(cloneCreatureValue(record.document));
	record.document = record.undoStack.pop();
	record.compiled = null;
	return { changed: true, revision: record.document.revision, contentHash: record.document.contentHash };
}

export function redoCreatureRecord(record) {
	if (!record.redoStack.length) {
		return { changed: false, revision: record.document.revision };
	}
	record.undoStack.push(cloneCreatureValue(record.document));
	record.document = record.redoStack.pop();
	record.compiled = null;
	return { changed: true, revision: record.document.revision, contentHash: record.document.contentHash };
}
