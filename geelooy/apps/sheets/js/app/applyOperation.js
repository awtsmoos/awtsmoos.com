//B"H
//Boruch Hashem
//Blessed is He

import { applyStructureOperation } from "../model/structureTransform.js";

/**
 * @file Applies normalized server operations to the sparse client workbook, including shared extensions.
 * @description The Awtsmoos sends one durable change and many clients receive the same form;
 * Awtsmoos.com keeps cells, structure, and automation state deterministic through every collaborative storm.
 */
const STRUCTURE_KINDS = new Set([
	"row.insert",
	"row.delete",
	"column.insert",
	"column.delete",
	"row.resize",
	"column.resize"
]);

/** Applies one server-normalized document operation to local workbook state. */
export function applyDocumentOperation(workbook, payload = {}, options = {}) {
	const operation = payload.operation || {};
	if (operation.kind === "cell") {
		workbook.patchCell(
			operation.sheetId,
			operation.address,
			operation.patch,
			payload.revision
		);
	}
	if (operation.kind === "values") {
		applyValuePatches(workbook, operation, payload.revision);
	}
	if (operation.kind === "style") {
		applyStylePatches(workbook, operation, payload.revision);
	}
	if (STRUCTURE_KINDS.has(operation.kind)) {
		applyStructureOperation(
			workbook,
			operation,
			payload.revision
		);
	}
	if (operation.kind === "sheet.add") {
		workbook.addSheet(
			operation.sheet,
			options.activateAddedSheet !== false
		);
	}
	if (operation.kind === "sheet.rename") {
		workbook.renameSheet(operation.sheetId, operation.name);
	}
	if (operation.kind === "extension.save") {
		applyExtensionSave(workbook, operation.extension);
	}
	if (operation.kind === "extension.remove") {
		applyExtensionRemove(workbook, operation.extensionId);
	}
	if (operation.kind === "title") {
		workbook.data.title = operation.title;
		workbook.changed("title.remote");
	}
	if (Number.isSafeInteger(payload.revision)) {
		workbook.data.revision = payload.revision;
	}
	if (payload.updatedAt) {
		workbook.data.updatedAt = payload.updatedAt;
	}
}

/** Applies one bounded range of value patches through the workbook cell API. */
function applyValuePatches(workbook, operation, revision) {
	for (const patch of operation.patches || []) {
		workbook.patchCell(
			operation.sheetId,
			patch.address,
			{ value: patch.value },
			revision
		);
	}
}

/** Applies one shared style patch to every normalized address. */
function applyStylePatches(workbook, operation, revision) {
	for (const address of operation.addresses || []) {
		workbook.patchCell(
			operation.sheetId,
			address,
			{ style: operation.style },
			revision
		);
	}
}

/** Replaces or appends one server-sanitized extension manifest by stable identifier. */
function applyExtensionSave(workbook, extension) {
	if (!extension?.id) {
		return;
	}
	const extensions = Array.isArray(workbook.data.extensions)
		? workbook.data.extensions
		: [];
	const index = extensions.findIndex((item) => item.id === extension.id);
	if (index === -1) {
		extensions.push(structuredClone(extension));
	} else {
		extensions[index] = structuredClone(extension);
	}
	workbook.data.extensions = extensions;
	workbook.changed("extension.remote");
}

/** Removes one extension manifest by stable identifier. */
function applyExtensionRemove(workbook, extensionId) {
	workbook.data.extensions = (workbook.data.extensions || [])
		.filter((item) => item.id !== extensionId);
	workbook.changed("extension.remote");
}

/** Applies owner sharing details returned by a correlated sharing mutation. */
export function applyShareState(workbook, payload = {}) {
	if (payload.visibility) {
		workbook.data.visibility = payload.visibility;
	}
	if (Array.isArray(payload.editors)) {
		workbook.data.editors = payload.editors;
	}
	if (typeof payload.linkToken === "string") {
		workbook.data.linkToken = payload.linkToken;
	}
	if (Number.isSafeInteger(payload.revision)) {
		workbook.data.revision = payload.revision;
	}
	workbook.changed("share.remote");
}
