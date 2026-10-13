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

/** Commits one universe placement (many composed primitives) atomically across
 *  document, runtime, inventory, and history. Yaakov 2026-10-11: a house, a tree,
 *  a chossid each land as one creative deed — or not at all. */
export async function commitUniversePlacement(sessionTiferes, catalogBinah, definitionsOros) {
	if (!Array.isArray(definitionsOros) || definitionsOros.length === 0) {
		throw new Error('UNIVERSE_PLACEMENT_EMPTY');
	}
	assertMaterial(sessionTiferes.inventory, catalogBinah);
	const committedOros = [];
	let chargedOhr = false;
	try {
		for (const definitionMalchus of definitionsOros) {
			await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
			// Recorded before mount: when mount fails, the document part already
			// exists and must be compensated too — no ghost records allowed.
			committedOros.push(definitionMalchus);
			sessionTiferes.runtimeAdapter.mount(definitionMalchus);
		}
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
		chargedOhr = true;
	} catch (errorOhr) {
		for (const definitionMalchus of committedOros.reverse()) {
			sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
			await safeDelete(sessionTiferes.documentStore, definitionMalchus.id);
		}
		if (chargedOhr) sessionTiferes.inventory.add(catalogBinah.itemId, catalogBinah.cost);
		throw errorOhr;
	}
	const anchorMalchus = definitionsOros[0];
	const receiptYesod = Object.freeze({
		catalogId: catalogBinah.id,
		definition: anchorMalchus,
		definitions: Object.freeze([...definitionsOros]),
		universe: true
	});
	sessionTiferes.history.commit(receiptYesod);
	return receiptYesod;
}

/** Removes the latest placement — one composed universe or one primitive — and refunds its exact material cost. */
export async function undoCreatorPlacement(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeUndo();
	if (!receiptYesod) {
		return null;
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	const definitionsOros = receiptDefinitions(receiptYesod);
	try {
		for (const definitionMalchus of [...definitionsOros].reverse()) {
			sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
			await sessionTiferes.documentStore.deletePart(definitionMalchus.id);
		}
		sessionTiferes.inventory.add(catalogBinah.itemId, catalogBinah.cost);
		return receiptYesod;
	} catch (errorOhr) {
		await restoreCommitted(sessionTiferes, catalogBinah, definitionsOros);
		sessionTiferes.history.restoreUndo(receiptYesod);
		throw errorOhr;
	}
}

/** Reapplies the latest undone placement — one composed universe or one primitive — after re-validating material ownership. */
export async function redoCreatorPlacement(sessionTiferes) {
	const receiptYesod = sessionTiferes.history.takeRedo();
	if (!receiptYesod) {
		return null;
	}
	const catalogBinah = sessionTiferes.catalogPart(receiptYesod.catalogId);
	const definitionsOros = receiptDefinitions(receiptYesod);
	const createdOros = [];
	try {
		assertMaterial(sessionTiferes.inventory, catalogBinah);
		for (const definitionMalchus of definitionsOros) {
			await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
			createdOros.push(definitionMalchus);
			sessionTiferes.runtimeAdapter.mount(definitionMalchus);
		}
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
		return receiptYesod;
	} catch (errorOhr) {
		// Compensate only what this attempt created; never delete pre-existing parts.
		for (const definitionMalchus of createdOros.reverse()) {
			try { sessionTiferes.runtimeAdapter.remove(definitionMalchus.id); } catch { /* best-effort */ }
			await safeDelete(sessionTiferes.documentStore, definitionMalchus.id);
		}
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

/** Returns every committed definition in one receipt: a composed universe or a single primitive. */
function receiptDefinitions(receiptYesod) {
	if (Array.isArray(receiptYesod.definitions)) {
		return receiptYesod.definitions;
	}
	return [receiptYesod.definition];
}

/** Restores runtime/document state when an undo operation fails midway. */
async function restoreCommitted(sessionTiferes, catalogBinah, definitionsOros) {
	for (const definitionMalchus of definitionsOros) {
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
}
