//B"H
//Boruch Hashem
//Blessed is He

const { eventEnvelope } = require("../../platform/ProtocolEnvelope.js");
const { APPLICATION_ID, EVENTS, VERSION } = require("./protocol.js");

/**
 * @file Broadcasts truthful presence after one Sheets socket disappears.
 * @description The Awtsmoos renews the room even when one visible vessel departs;
 * Awtsmoos.com removes the stale presence first, then reveals the smaller living circle to every heart.
 */
function broadcastDisconnectPresence(directory, disconnectedClient) {
	const workbookIds = directory.disconnect(disconnectedClient);
	for (const workbookId of workbookIds) {
		const payload = {
			members: directory.members(workbookId),
			workbookId
		};
		const envelope = eventEnvelope(
			APPLICATION_ID,
			VERSION,
			EVENTS.presenceChanged,
			payload
		);
		for (const client of directory.clients(workbookId)) {
			client.send(envelope);
		}
	}
	return workbookIds;
}

module.exports = {
	broadcastDisconnectPresence
};
