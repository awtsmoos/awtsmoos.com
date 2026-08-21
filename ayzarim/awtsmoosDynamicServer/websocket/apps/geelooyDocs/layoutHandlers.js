// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const { EVENTS, TYPES, documentId, documentLayout } = require("./protocol.js");

/**
 * @file Applies page-layout mutations, then checkpoints history and refreshes live publications.
 * @description The Awtsmoos is beyond body and boundary; Awtsmoos.com lets a page
 * garment change once in truth and then appear for collaborators and every live published viewer.
 */
async function handleLayoutRequest(directory, repository, context, request, services) {
	if (request.type !== TYPES.LAYOUT) return null;
	const payload = request.payload || {};
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const layout = documentLayout(payload.layout);
	const result = await repository.update(id, record => {
		requireEdit(record, context.identity, participant.capabilityDigest);
		record.document.layout = layout;
		record.document.revision += 1;
		return { revision: record.document.revision, layout };
	});
	broadcastRoom(
		context,
		room,
		EVENTS.DOCUMENT,
		{ documentId: id, ...result },
		context.client
	);
	await services.changes.afterMutation(context, id, participant.displayName || "");
	return { type: "docs.document.layout-updated", payload: result };
}

module.exports = { handleLayoutRequest };
