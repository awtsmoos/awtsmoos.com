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
	if (Array.isArray(receiptYesod.definitions)) {
		return removeUniversePlacement(sessionTiferes, receiptYesod, catalogBinah);
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
	if (Array.isArray(receiptYesod.definitions)) {
		return restoreUniversePlacement(sessionTiferes, receiptYesod, catalogBinah);
	}
	return restoreCreatorObjectState(sessionTiferes, receiptYesod.definition, catalogBinah);
}

/** Removes one placed object and refunds its exact catalog material cost. */
async function removePlacedObject(sessionTiferes, definitionMalchus, catalogBinah) {
	return deleteCreatorObjectState(sessionTiferes, definitionMalchus, catalogBinah);
}

/** Removes every sub-part of one universe placement and refunds its single catalog cost. */
async function removeUniversePlacement(sessionTiferes, receiptYesod, catalogBinah) {
	for (const definitionMalchus of [...receiptYesod.definitions].reverse()) {
		sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
	}
	try {
		for (const definitionMalchus of [...receiptYesod.definitions].reverse()) {
			await sessionTiferes.documentStore.deletePart(definitionMalchus.id);
		}
		sessionTiferes.inventory.add(catalogBinah.itemId, catalogBinah.cost);
	} catch (errorOhr) {
		for (const definitionMalchus of receiptYesod.definitions) {
			try { sessionTiferes.runtimeAdapter.mount(definitionMalchus); } catch { /* best-effort */ }
		}
		throw errorOhr;
	}
	return receiptYesod.definitions;
}

/** Restores every sub-part of one universe placement and charges its single catalog cost. */
async function restoreUniversePlacement(sessionTiferes, receiptYesod, catalogBinah) {
	assertUniverseMaterial(sessionTiferes, catalogBinah);
	const mountedOros = [];
	try {
		for (const definitionMalchus of receiptYesod.definitions) {
			await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
			sessionTiferes.runtimeAdapter.mount(definitionMalchus);
			mountedOros.push(definitionMalchus);
		}
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
	} catch (errorOhr) {
		for (const definitionMalchus of mountedOros.reverse()) {
			sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
			try { await sessionTiferes.documentStore.deletePart(definitionMalchus.id); } catch { /* best-effort */ }
		}
		throw errorOhr;
	}
	return receiptYesod.definitions;
}

function assertUniverseMaterial(sessionTiferes, catalogBinah) {
	if (sessionTiferes.inventory?.quantity?.(catalogBinah.itemId) < catalogBinah.cost) {
		throw new Error(`CREATOR_MATERIAL_REQUIRED:${catalogBinah.itemId}`);
	}
}
