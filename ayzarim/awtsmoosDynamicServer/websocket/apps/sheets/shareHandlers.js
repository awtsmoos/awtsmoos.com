//B"H
//Boruch Hashem
//Blessed is He

const { broadcastWorkbook } = require("./broadcaster.js");
const { requireShare } = require("./guards.js");
const { broadcastCurrentPresence } = require("./presenceBroadcast.js");
const { EVENTS, identifier, TYPES } = require("./protocol.js");
const {
	normalizedEditorId,
	normalizedVisibility,
	ownerSharePayload
} = require("./shareState.js");
const { randomId } = require("./store.js");

/**
 * @file Applies owner-only visibility and editor-list changes to shared workbooks.
 * @description The Awtsmoos gives Chesed room to share and Gevurah power to close the gate;
 * Awtsmoos.com rotates capabilities, evicts stale viewers, and reveals the truthful room state.
 */
async function handleShareRequest(store, directory, context, request) {
	if (request.type === TYPES.shareUpdate) {
		return await updateVisibility(
			store,
			directory,
			context,
			request.payload || {}
		);
	}
	if (request.type === TYPES.shareInvite) {
		return await inviteEditor(
			store,
			directory,
			context,
			request.payload || {}
		);
	}
	return null;
}

/** Changes visibility, rotates link capability, and refreshes presence after pruning viewers. */
async function updateVisibility(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	const { workbook: before } = await requireShare(
		store,
		context,
		workbookId
	);
	const visibility = normalizedVisibility(payload.visibility);
	const workbook = await store.update(workbookId, (draft) => {
		if (visibility === "link" && before.visibility !== "link") {
			draft.linkToken = randomId(24);
		}
		draft.visibility = visibility;
	});
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.shareChanged,
		shareEventPayload(workbook),
		context.client
	);
	if (before.visibility !== visibility) {
		const removed = directory.pruneReadOnly(workbookId);
		if (removed.length) {
			broadcastCurrentPresence(context, directory, workbookId);
		}
	}
	return {
		payload: ownerSharePayload(workbook),
		type: EVENTS.shareChanged
	};
}

/** Adds one durable verified-account identifier to the editor ACL. */
async function inviteEditor(store, directory, context, payload) {
	const workbookId = identifier(payload.id, "workbookId");
	await requireShare(store, context, workbookId);
	const editorId = normalizedEditorId(payload.editorId);
	const workbook = await store.update(workbookId, (draft) => {
		if (!Array.isArray(draft.editors)) {
			draft.editors = [];
		}
		if (editorId !== draft.ownerId && !draft.editors.includes(editorId)) {
			draft.editors.push(editorId);
		}
	});
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.shareChanged,
		shareEventPayload(workbook),
		context.client
	);
	return {
		payload: ownerSharePayload(workbook),
		type: EVENTS.shareChanged
	};
}

/** Returns the public-safe sharing event projection sent to existing room members. */
function shareEventPayload(workbook) {
	return {
		revision: workbook.revision,
		visibility: workbook.visibility,
		workbookId: workbook.id
	};
}

module.exports = {
	handleShareRequest
};
