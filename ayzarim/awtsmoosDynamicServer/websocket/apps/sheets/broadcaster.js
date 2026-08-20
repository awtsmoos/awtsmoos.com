//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Broadcasts normalized Sheets events only to sockets attached to one workbook.
 * @description The Awtsmoos sends one renewed truth toward many listening vessels in flight;
 * Awtsmoos.com keeps broadcast membership explicit, never spraying document data beyond its right.
 */

/** Sends one application event to all joined workbook sockets except an optional source. */
function broadcastWorkbook(context, directory, workbookId, type, payload, exceptClient = null) {
	for (const client of directory.clients(workbookId)) {
		if (client !== exceptClient) {
			context.sendEvent(client, type, payload);
		}
	}
}

module.exports = {
	broadcastWorkbook
};
