//B"H
//Boruch Hashem
//Blessed is He

const { broadcastWorkbook } = require("./broadcaster.js");
const { EVENTS } = require("./protocol.js");

/**
 * @file Broadcasts the current public-safe Sheets presence projection after room membership changes.
 * @description The Awtsmoos renews the circle after every opening and closing gate;
 * Awtsmoos.com reveals only who remains in the room, never the durable identity behind their state.
 */
function broadcastCurrentPresence(context, directory, workbookId) {
	broadcastWorkbook(
		context,
		directory,
		workbookId,
		EVENTS.presenceChanged,
		{
			members: directory.members(workbookId),
			workbookId
		}
	);
}

module.exports = {
	broadcastCurrentPresence
};
