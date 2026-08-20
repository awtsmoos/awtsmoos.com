//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { broadcastWorkbook } = require("./broadcaster.js");
const { verifiedAccountId } = require("./identity.js");
const { workbookCapabilities } = require("./permissions.js");
const { boundedText, EVENTS, identifier, TYPES } = require("./protocol.js");
const { workbookSnapshot } = require("./snapshot.js");
const { requireView } = require("./guards.js");

/**
 * @file Handles workbook creation, opening, and intentionally public discovery.
 * @description The Awtsmoos brings a workbook from hidden potential into a shareable name;
 * Awtsmoos.com opens each vessel only through permission, then gathers presence around the frame.
 */
async function handleDocumentRequest(store, directory, context, request) {
	if (request.type === TYPES.create) {
		return await createWorkbook(store, directory, context, request.payload);
	}
	if (request.type === TYPES.open) {
		return await openWorkbook(store, directory, context, request.payload);
	}
	if (request.type === TYPES.listPublic) {
		return {
			payload: { items: await store.listPublic(request.payload?.limit) },
			type: "sheets.document.list"
		};
	}
	return null;
}

/** Creates one private workbook for a verified account and joins its first room. */
async function createWorkbook(store, directory, context, payload = {}) {
	const ownerId = verifiedAccountId(context.identity);
	if (!ownerId) {
		throw new RealtimeError("SHEETS_AUTH_REQUIRED", "Sign in to create a workbook.", null, 401);
	}
	const title = boundedText(payload.title || "Untitled workbook", "title", 160, false).trim();
	const workbook = await store.create(ownerId, title);
	const capabilities = workbookCapabilities(workbook, context.identity);
	const presence = directory.join(context.client, workbook.id, context.identity, capabilities);
	return {
		payload: { presence, workbook: workbookSnapshot(workbook, capabilities) },
		type: "sheets.document.snapshot"
	};
}

/** Opens one permitted workbook, joins presence, and announces the refreshed room. */
async function openWorkbook(store, directory, context, payload = {}) {
	const workbookId = identifier(payload.id, "workbookId");
	const access = await requireView(store, context, workbookId, payload.key || "");
	const presence = directory.join(
		context.client,
		workbookId,
		context.identity,
		access.capabilities
	);
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.presenceChanged,
		{ members: presence },
		context.client
	);
	return {
		payload: {
			presence,
			workbook: workbookSnapshot(access.workbook, access.capabilities)
		},
		type: "sheets.document.snapshot"
	};
}

module.exports = {
	handleDocumentRequest
};
