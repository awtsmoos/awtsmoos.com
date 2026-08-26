// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorTransactions.js
 * @description Coordinates canonical document, live geometry, material inventory, and creator history with compensation on partial failure.
 * The Awtsmoos joins thought, object, boundary, and possession in one instant; Awtsmoos.com refuses ghost records,
 * invisible walls, or phantom materials by reversing every completed step whenever the full creative deed cannot stand.
 */

/** Commits one new placement across document, runtime, inventory, and history. */
export async function commitCreatorPlacement(sessionTiferes, catalogBinah, definitionMalchus) {
	assertMaterial(sessionTiferes.inventory, catalogBinah);
	await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
	let mountedOhr = false;
	try {
		sessionTiferes.runtimeAdapter.mount(definitionMalchus);
		mountedOhr = true;
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
	} catch (errorOhr) {
		if (mountedOhr) {
			sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
		}
		await safeDelete(sessionTiferes.documentStore, definitionMalchus.id);
		throw errorOhr;
	}
	const receiptYesod = Object.freeze({ catalogId: catalogBinah.id, definition: definitionMalchus });
	sessionTiferes.history.commit(receiptYesod);
	return receiptYesod;
}

/** Removes the latest placement and refunds its exact material cost. */
export async function undoCreatorPlacement(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeUndo();
	if (!receiptYesod) {
		return null;
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	try {
		sessionTiferes.runtimeAdapter.remove(receiptYesod.definition.id);
		await sessionTiferes.documentStore.deletePart(receiptYesod.definition.id);
		sessionTiferes.inventory.add(catalogBinah.itemId, catalogBinah.cost);
		return receiptYesod;
	} catch (errorOhr) {
		await restoreCommitted(sessionTiferes, catalogBinah, receiptYesod.definition);
		sessionTiferes.history.restoreUndo(receiptYesod);
		throw errorOhr;
	}
}

/** Reapplies the latest undone placement after re-validating material ownership. */
export async function redoCreatorPlacement(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeRedo();
	if (!receiptYesod) {
		return null;
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	try {
		assertMaterial(sessionTiferes.inventory, catalogBinah);
		await sessionTiferes.documentStore.createPart(catalogBinah, receiptYesod.definition);
		sessionTiferes.runtimeAdapter.mount(receiptYesod.definition);
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
		return receiptYesod;
	} catch (errorOhr) {
		sessionTiferes.runtimeAdapter.remove(receiptYesod.definition.id);
		await safeDelete(sessionTiferes.documentStore, receiptYesod.definition.id);
		sessionTiferes.history.restoreRedo(receiptYesod);
		throw errorOhr;
	}
}

/** Refuses placement when the authoritative inventory cannot pay the catalog cost. */
function assertMaterial(inventoryYesod, catalogBinah) {
	if (!inventoryYesod?.quantity || inventoryYesod.quantity(catalogBinah.itemId) < catalogBinah.cost) {
		throw new Error(`CREATOR_MATERIAL_REQUIRED:${catalogBinah.itemId}`);
	}
}

/** Best-effort deletion used only during compensation paths. */
async function safeDelete(documentStoreYesod, idOhr) {
	try {
		await documentStoreYesod.deletePart(idOhr);
	} catch {
		return false;
	}
	return true;
}

/** Restores runtime/document state when an undo operation fails midway. */
async function restoreCommitted(sessionTiferes, catalogBinah, definitionMalchus) {
	try {
		await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
	} catch {
		// The document may still contain the resource when deletion itself failed.
	}
	try {
		sessionTiferes.runtimeAdapter.mount(definitionMalchus);
	} catch {
		// The runtime may still contain the mesh when removal itself failed.
	}
}
