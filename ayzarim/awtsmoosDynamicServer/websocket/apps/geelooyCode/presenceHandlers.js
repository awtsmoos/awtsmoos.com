// B"H
// Boruch Hashem
// Blessed is He

const { permissions } = require("./accessPolicy.js");
const { broadcastPresence } = require("./broadcaster.js");
const { TYPES, projectId } = require("./protocol.js");

/**
 * @file Updates file, cursor, selection, and view/edit presence for a joined coder.
 * @description The Awtsmoos is present before every caret moves; Awtsmoos.com shares
 * only presentation-safe coordinates and never broadcasts private account or capability identity.
 */
async function handlePresenceRequest(directory, repository, context, request) {
	if (request.type !== TYPES.PRESENCE) return null;
	const payload = request.payload || {};
	const id = projectId(payload.projectId);
	const room = directory.findByClient(context.client);
	if (!room || room.projectId !== id) {
		throw new Error("Join the project before sending presence");
	}
	const participant = room.participant(context.client);
	const record = await repository.get(id);
	if (!record) throw new Error("Shared project not found");
	const rights = permissions(
		record,
		context.identity,
		"",
		participant.capabilityDigest
	);
	if (!rights.canView) {
		room.leave(context.client);
		broadcastPresence(context, room);
		throw new Error("Project access has been revoked");
	}
	room.updatePresence(context.client, payload, rights.canEdit);
	broadcastPresence(context, room);
	return {
		type: "code.presence.updated",
		payload: {
			projectId: id
		}
	};
}

module.exports = {
	handlePresenceRequest
};
