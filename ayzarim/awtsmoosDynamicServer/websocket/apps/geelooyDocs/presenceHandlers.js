// B"H
// Boruch Hashem
// Blessed is He

const { permissions } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const {
	DOCS_ERROR,
	docsError,
	documentNotFound
} = require("./docsErrors.js");
const { TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Updates presentation-safe live activity for one joined Awtsmoos document socket.
 * @description The Awtsmoos is present before every cursor moves; Awtsmoos.com
 * rechecks persisted view authority before each presence mutation so revoked access
 * becomes an explicit permanent client state instead of a vague realtime failure.
 */
async function handlePresenceRequest(directory, repository, context, request) {
	if (request.type !== TYPES.PRESENCE) return null;
	const payload = request.payload || {};
	const id = documentId(payload.documentId);
	const room = directory.findByClient(context.client);
	if (!room || room.documentId !== id) {
		throw docsError(
			DOCS_ERROR.JOIN_REQUIRED,
			"Join the document before sending presence.",
			{ documentId: id },
			409
		);
	}
	const participant = room.participant(context.client);
	const record = await repository.get(id);
	if (!record) throw documentNotFound();
	const rights = permissions(
		record,
		context.identity,
		"",
		participant.capabilityDigest
	);
	if (!rights.canView) {
		room.leave(context.client);
		broadcastPresence(context, room);
		throw docsError(
			DOCS_ERROR.ACCESS_REVOKED,
			"Document access has been revoked.",
			{ documentId: id },
			403
		);
	}
	room.updatePresence(
		context.client,
		boundedText(payload.activeBlockId, "Active block id", 96, ""),
		payload.mode,
		rights.canEdit
	);
	broadcastPresence(context, room);
	return {
		type: "docs.presence.updated",
		payload: { documentId: id }
	};
}

module.exports = { handlePresenceRequest };
