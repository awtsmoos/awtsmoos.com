//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldCreatorObjectTransactions.js
 * @description Commits update, duplicate, and delete operations against one semantic creator object with live-runtime compensation.
 * The Awtsmoos keeps one object identity through changing garments; Awtsmoos.com updates document, mesh, collider, inventory,
 * and history together so Sandbox edits remain playable, undoable, and portable instead of becoming renderer-only mutations.
 */

import { commitCreatorPlacement } from './MitzvahWorldCreatorTransactions.js';

/** Commits one complete replacement definition under the same stable object id. */
export async function commitCreatorObjectUpdate(sessionTiferes, idOhr, nextDefinitionMalchus) {
	const resourceBinah = requiredCreatorResource(sessionTiferes, idOhr);
	const beforeMalchus = resourceBinah.definition;
	const afterMalchus = structuredClone({ ...nextDefinitionMalchus, id: idOhr });
	await applyCreatorDefinitionChange(sessionTiferes, beforeMalchus, afterMalchus);
	const receiptYesod = Object.freeze({
		after: afterMalchus,
		before: beforeMalchus,
		catalogId: resourceBinah.kind,
		operation: 'update'
	});
	sessionTiferes.history.commit(receiptYesod);
	return receiptYesod;
}

/** Duplicates one creator object with a new stable id and slight X offset for immediate readability. */
export async function commitCreatorObjectDuplicate(sessionTiferes, idOhr, nextIdOhr) {
	const resourceBinah = requiredCreatorResource(sessionTiferes, idOhr);
	const catalogBinah = sessionTiferes.catalogPart(resourceBinah.kind);
	const definitionMalchus = structuredClone(resourceBinah.definition);
	definitionMalchus.id = nextIdOhr;
	definitionMalchus.position = {
		...definitionMalchus.position,
		x: Number(definitionMalchus.position?.x || 0) + 1
	};
	return commitCreatorPlacement(sessionTiferes, catalogBinah, definitionMalchus);
}

/** Deletes one creator object and refunds its material while preserving an undo receipt. */
export async function commitCreatorObjectDelete(sessionTiferes, idOhr) {
	const resourceBinah = requiredCreatorResource(sessionTiferes, idOhr);
	const catalogBinah = sessionTiferes.catalogPart(resourceBinah.kind);
	await deleteCreatorObjectState(sessionTiferes, resourceBinah.definition, catalogBinah);
	const receiptYesod = Object.freeze({
		catalogId: resourceBinah.kind,
		definition: resourceBinah.definition,
		operation: 'delete'
	});
	sessionTiferes.history.commit(receiptYesod);
	return receiptYesod;
}

/** Applies one semantic definition replacement with document rollback when live regeneration fails. */
export async function applyCreatorDefinitionChange(sessionTiferes, beforeMalchus, afterMalchus) {
	await sessionTiferes.documentStore.updatePart(afterMalchus.id, afterMalchus);
	try {
		sessionTiferes.runtimeAdapter.updateDefinition(afterMalchus);
	} catch (errorOhr) {
		await sessionTiferes.documentStore.updatePart(beforeMalchus.id, beforeMalchus);
		throw errorOhr;
	}
	return afterMalchus;
}

/** Removes one object from runtime/document and refunds the exact catalog material cost. */
export async function deleteCreatorObjectState(sessionTiferes, definitionMalchus, catalogBinah) {
	sessionTiferes.runtimeAdapter.remove(definitionMalchus.id);
	try {
		await sessionTiferes.documentStore.deletePart(definitionMalchus.id);
		sessionTiferes.inventory.add(catalogBinah.itemId, catalogBinah.cost);
	} catch (errorOhr) {
		sessionTiferes.runtimeAdapter.mount(definitionMalchus);
		throw errorOhr;
	}
	return definitionMalchus;
}

/** Restores one previously deleted object and pays its material cost through the same transaction law. */
export async function restoreCreatorObjectState(sessionTiferes, definitionMalchus, catalogBinah) {
	await sessionTiferes.documentStore.createPart(catalogBinah, definitionMalchus);
	try {
		sessionTiferes.runtimeAdapter.mount(definitionMalchus);
		sessionTiferes.inventory.remove(catalogBinah.itemId, catalogBinah.cost);
	} catch (errorOhr) {
		await sessionTiferes.documentStore.deletePart(definitionMalchus.id).catch(() => null);
		throw errorOhr;
	}
	return definitionMalchus;
}

/** Resolves one immutable creator resource or refuses stale selection truth. */
export function requiredCreatorResource(sessionTiferes, idOhr) {
	const resourceBinah = sessionTiferes.documentStore.readPart(idOhr);
	if (!resourceBinah || resourceBinah.type !== 'mitzvahWorld.builder.part') {
		throw new Error(`CREATOR_OBJECT_NOT_FOUND:${idOhr}`);
	}
	return resourceBinah;
}
