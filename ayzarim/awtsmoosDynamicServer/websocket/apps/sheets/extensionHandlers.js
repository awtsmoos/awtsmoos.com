//B"H
//Boruch Hashem
//Blessed is He

const { mutateAndBroadcast } = require("./editMutation.js");
const { extensionId, sanitizeExtension } = require("./extensionSchema.js");
const { requireEdit } = require("./guards.js");
const { TYPES, identifier } = require("./protocol.js");
const { RealtimeError } = require("../../platform/RealtimeError.js");

/**
 * @file Persists capability-safe declarative extensions through the ordinary Sheets edit gate.
 * @description The Awtsmoos lets automation be shared only after trusted identity and finite grammar meet;
 * Awtsmoos.com broadcasts sanitized manifests as workbook state while arbitrary executable source stays outside.
 */
async function handleExtensionRequest(store, directory, context, request) {
	if (request.type !== TYPES.extensionSave && request.type !== TYPES.extensionRemove) {
		return null;
	}
	const payload = request.payload || {};
	const workbookId = identifier(payload.id, "workbookId");
	await requireEdit(store, context, workbookId);
	return request.type === TYPES.extensionSave
		? saveExtension(store, directory, context, workbookId, payload.extension)
		: removeExtension(store, directory, context, workbookId, payload.extensionId);
}

/** Saves or replaces one extension while enforcing the workbook extension-count ceiling. */
async function saveExtension(store, directory, context, workbookId, value) {
	const extension = sanitizeExtension(value);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			const extensions = Array.isArray(workbook.extensions) ? workbook.extensions : [];
			const existing = extensions.findIndex((item) => item.id === extension.id);
			if (existing === -1 && extensions.length >= 24) {
				throw new RealtimeError(
					"SHEETS_EXTENSION_LIMIT",
					"This workbook already has the maximum number of extensions.",
					null,
					400
				);
			}
			if (existing === -1) {
				extensions.push(extension);
			} else {
				extensions[existing] = extension;
			}
			workbook.extensions = extensions;
			return { extension, kind: "extension.save" };
		}
	);
}

/** Removes one extension by id without accepting client-supplied array state. */
async function removeExtension(store, directory, context, workbookId, value) {
	const id = extensionId(value);
	return await mutateAndBroadcast(
		store,
		directory,
		context,
		workbookId,
		(workbook) => {
			workbook.extensions = (workbook.extensions || []).filter((item) => item.id !== id);
			return { extensionId: id, kind: "extension.remove" };
		}
	);
}

module.exports = {
	handleExtensionRequest
};
