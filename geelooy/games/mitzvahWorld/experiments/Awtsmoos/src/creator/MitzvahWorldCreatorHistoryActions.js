//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorHistoryActions.js
 * @description Applies one shared undo/redo ledger across placements, transforms, duplicates, and deletions.
 * The Awtsmoos lets a changed world return without losing identity; Awtsmoos.com replays semantic document, live mesh,
 * collider, and material side effects from immutable receipts so every Sandbox deed can retreat and return truthfully.
 */

import {
	applyCreatorDefinitionChange,
	deleteCreatorObjectState,
	restoreCreatorObjectState
} from './MitzvahWorldCreatorObjectTransactions.js';

/** Undoes the latest creator receipt and restores ledger custody when reversal fails. */
export async function undoCreatorAction(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeUndo();
	if (!receiptYesod) {
		return null;
	}
	try {
		await reverseCreatorReceipt(sessionTiferes, receiptYesod);
		return receiptYesod;
	} catch (errorOhr) {
		sessionTiferes.history.restoreUndo(receiptYesod);
		throw errorOhr;
	}
}

/** Redoes the latest creator receipt and restores ledger custody when replay fails. */
export async function redoCreatorAction(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeRedo();
	if (!receiptYesod) {
		return null;
	}
	try {
		await replayCreatorReceipt(sessionTiferes, receiptYesod);
		return receiptYesod;
	} catch (errorOhr) {
		sessionTiferes.history.restoreRedo(receiptYesod);
		throw errorOhr;
	}
}

/** Reverses one immutable receipt according to its semantic operation. */
async function reverseCreatorReceipt(sessionTiferes, receiptYesod) {
	if (receiptYesod.operation === 'update') {
		return applyCreatorDefinitionChange(
			sessionTiferes,
			receiptYesod.after,
			receiptYesod.before
		);
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	if (receiptYesod.operation === 'delete') {
		return restoreCreatorObjectState(sessionTiferes, receiptYesod.definition, catalogBinah);
	}
	return removePlacedObject(sessionTiferes, receiptYesod.definition, catalogBinah);
}

/** Replays one immutable receipt according to its semantic operation. */
async function replayCreatorReceipt(sessionTiferes, receiptYesod) {
	if (receiptYesod.operation === 'update') {
		return applyCreatorDefinitionChange(
			sessionTiferes,
			receiptYesod.before,
			receiptYesod.after
		);
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	if (receiptYesod.operation === 'delete') {
		return deleteCreatorObjectState(sessionTiferes, receiptYesod.definition, catalogBinah);
	}
	return restoreCreatorObjectState(sessionTiferes, receiptYesod.definition, catalogBinah);
}

/** Removes one placed object and refunds its exact catalog material cost. */
async function removePlacedObject(sessionTiferes, definitionMalchus, catalogBinah) {
	return deleteCreatorObjectState(sessionTiferes, definitionMalchus, catalogBinah);
}
