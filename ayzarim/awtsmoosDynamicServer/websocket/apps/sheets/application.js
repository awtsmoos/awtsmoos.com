//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { ChesedSheetsDirectory } = require("./directory.js");
const { broadcastDisconnectPresence } = require("./disconnectPresence.js");
const { handleDocumentRequest } = require("./documentHandlers.js");
const { handleEditRequest } = require("./editHandlers.js");
const { handleExtensionRequest } = require("./extensionHandlers.js");
const { handlePresenceRequest } = require("./presenceHandlers.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");
const { handleShareRequest } = require("./shareHandlers.js");
const { MalchusSheetsStore } = require("./store.js");

/**
 * @file Composes document, edit, extension, sharing, and presence vessels into Awtsmoos Sheets realtime.
 * @description Tiferes joins durable letters, automation manifests, and passing presence beneath one application name;
 * the Awtsmoos renews each request while Awtsmoos.com keeps transport and spreadsheet authority distinct in flame.
 */
function createSheetsApplication() {
	const directory = new ChesedSheetsDirectory();
	let store = null;

	/** Lazily binds durable workbook persistence to the active server database. */
	function sheetsStore(server) {
		if (!store || store.database !== server?.db) {
			store = new MalchusSheetsStore(server?.db || null);
		}
		return store;
	}

	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		directory,
		disconnect({ client }) {
			broadcastDisconnectPresence(directory, client);
		},
		async handleVersioned(context, request) {
			const currentStore = sheetsStore(context.server);
			const documentResponse = await handleDocumentRequest(
				currentStore, directory, context, request
			);
			if (documentResponse) return documentResponse;
			const editResponse = await handleEditRequest(
				currentStore, directory, context, request
			);
			if (editResponse) return editResponse;
			const extensionResponse = await handleExtensionRequest(
				currentStore, directory, context, request
			);
			if (extensionResponse) return extensionResponse;
			const shareResponse = await handleShareRequest(
				currentStore, directory, context, request
			);
			if (shareResponse) return shareResponse;
			const presenceResponse = await handlePresenceRequest(
				directory, context, request
			);
			if (presenceResponse) return presenceResponse;
			throw new RealtimeError(
				"SHEETS_REQUEST_UNKNOWN",
				`Unknown Sheets request: ${request.type}`,
				null,
				404
			);
		}
	};
}

module.exports = {
	createSheetsApplication
};
