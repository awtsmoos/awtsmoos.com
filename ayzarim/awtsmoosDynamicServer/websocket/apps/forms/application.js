//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { MalchusSheetsStore } = require("../sheets/store.js");
const { handleDocumentRequest } = require("./documentHandlers.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { handleResponseRequest } = require("./responseHandlers.js");
const { MalchusFormsStore } = require("./store.js");

/**
 * @file Composes Forms documents and public responses around shared persistence and the hidden Sheets bridge.
 * @description The Awtsmoos lets editor form and respondent answer meet one application without sharing authority;
 * Awtsmoos.com binds both stores to one server database while every request remains inside its measured boundary.
 */
function createFormsApplication() {
	let formsStore = null;
	let sheetsStore = null;

	/** Lazily binds Forms and Sheets persistence to the currently active realtime server database. */
	function stores(server) {
		if (!formsStore || formsStore.database !== server?.db) {
			formsStore = new MalchusFormsStore(server?.db || null);
			sheetsStore = new MalchusSheetsStore(server?.db || null);
		}
		return { formsStore, sheetsStore };
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		async handleVersioned(context, request) {
			const current = stores(context.server);
			const documentResponse = await handleDocumentRequest(
				current.formsStore,
				current.sheetsStore,
				context,
				request
			);
			if (documentResponse) {
				return documentResponse;
			}
			const response = await handleResponseRequest(
				current.formsStore,
				current.sheetsStore,
				context,
				request
			);
			if (response) {
				return response;
			}
			throw new RealtimeError(
				"FORMS_REQUEST_UNKNOWN",
				`Unknown Forms request: ${request.type}`,
				null,
				404
			);
		}
	};
}

module.exports = {
	createFormsApplication
};
