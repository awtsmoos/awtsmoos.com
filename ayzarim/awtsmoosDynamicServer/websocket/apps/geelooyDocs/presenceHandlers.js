// B"H
// Boruch Hashem
// Blessed is He

const { permissions } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const { TYPES, boundedText, documentId } = require("./protocol.js");

/**
 * @file Updates presentation-safe live activity for one joined document socket.
 * @description The Awtsmoos is present before every cursor moves; Awtsmoos.com
 * exposes only the small finite signs needed to feel another collaborator nearby.
 */
async function handlePresenceRequest(directory, repository, context, request) {
	if (request.type !== TYPES.PRESENCE) return null;
	const payload = request.payload || {};
	const id = documentId(payload.documentId);
	const room = directory.findByClient(context.client);
	if (!room || room.documentId !== id) {
		throw new Error("Join the document before sending presence");
	}
	const participant = room.participant(context.client);
	const record = await repository.get(id);
	if (!record) throw new Error("Document not found");
	const rights = permissions(
		record,
		context.identity,
		"",
		participant.capabilityDigest
	);
	if (!rights.canView) {
		room.leave(context.client);
		broadcastPresence(context, room);
		throw new Error("Document access has been revoked");
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

module.exports = {
	handlePresenceRequest
};
