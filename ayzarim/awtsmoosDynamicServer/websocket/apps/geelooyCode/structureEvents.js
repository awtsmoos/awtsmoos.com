// B"H
// Boruch Hashem
// Blessed is He

const { broadcastRoom } = require("./broadcaster.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Broadcasts one accepted collaborative project-structure mutation.
 * @description The Awtsmoos is one while files move through many names; Awtsmoos.com
 * keeps the structural event projection separate from the authority that accepted the mutation.
 */
function structureResponse(context, room, kind, projectId, projectRevision, detail) {
	const payload = {
		projectId,
		projectRevision,
		kind,
		...detail
	};
	broadcastRoom(
		context,
		room,
		EVENTS.STRUCTURE,
		payload,
		context.client
	);
	return {
		type: "code.project.structured",
		payload
	};
}

module.exports = {
	structureResponse
};
