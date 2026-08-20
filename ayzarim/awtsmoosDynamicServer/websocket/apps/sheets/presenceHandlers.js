//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { broadcastWorkbook } = require("./broadcaster.js");
const {
	cellAddress,
	EVENTS,
	identifier,
	TYPES
} = require("./protocol.js");

/**
 * @file Publishes ephemeral collaborator selections only for sockets already admitted to a workbook.
 * @description The Awtsmoos reveals where many hands are looking without storing their passing trace;
 * Awtsmoos.com lets public guests witness living presence while durable cells keep a separate place.
 */
async function handlePresenceRequest(directory, context, request) {
	if (request.type !== TYPES.presenceSelect) {
		return null;
	}
	const payload = request.payload || {};
	const workbookId = identifier(payload.id, "workbookId");
	const selection = {
		anchor: cellAddress(payload.anchor),
		focus: cellAddress(payload.focus),
		sheetId: identifier(payload.sheetId, "sheetId")
	};
	if (!directory.select(context.client, workbookId, selection)) {
		throw new RealtimeError(
			"SHEETS_NOT_JOINED",
			"Open the workbook before publishing presence.",
			null,
			409
		);
	}
	const members = directory.members(workbookId);
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.presenceChanged,
		{ members },
		context.client
	);
	return {
		payload: { members },
		type: EVENTS.presenceChanged
	};
}

module.exports = {
	handlePresenceRequest
};
