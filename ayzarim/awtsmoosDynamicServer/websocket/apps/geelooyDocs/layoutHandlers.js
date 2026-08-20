// B"H
// Boruch Hashem
// Blessed is He

const { requireEdit } = require("./accessPolicy.js");
const { broadcastRoom } = require("./broadcaster.js");
const { requireJoinedRoom } = require("./editHandlers.js");
const {
	EVENTS,
	TYPES,
	documentId,
	documentLayout
} = require("./protocol.js");

/**
 * @file Applies document-level layout mutations without disturbing block conflict rules.
 * @description The Awtsmoos is beyond body and boundary; Awtsmoos.com lets rare
 * page changes flow as their own shared covenant while each text block keeps its independent revision truth.
 */
async function handleLayoutRequest(directory, repository, context, request) {
	if (request.type !== TYPES.LAYOUT) return null;
	const payload = request.payload || {};
	const id = documentId(payload.documentId);
	const room = requireJoinedRoom(directory, context.client, id);
	const participant = room.participant(context.client);
	const layout = documentLayout(payload.layout);
	const result = await repository.update(id, record => {
		requireEdit(
			record,
			context.identity,
			participant.capabilityDigest
		);
		record.document.layout = layout;
		record.document.revision += 1;
		record.document.updatedAt = new Date().toISOString();
		return {
			revision: record.document.revision,
			layout
		};
	});
	broadcastRoom(
		context,
		room,
		EVENTS.DOCUMENT,
		{ documentId: id, ...result },
		context.client
	);
	return {
		type: "docs.document.layout-updated",
		payload: result
	};
}

module.exports = {
	handleLayoutRequest
};
