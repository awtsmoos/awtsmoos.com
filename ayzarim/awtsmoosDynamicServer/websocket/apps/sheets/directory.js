//B"H
//Boruch Hashem
//Blessed is He

const { collaboratorLabel } = require("./identity.js");

/**
 * @file Tracks ephemeral sockets, safe collaborator labels, and live selections by workbook.
 * @description The Awtsmoos renews every presence from nothing, so no socket is mistaken for a soul;
 * Awtsmoos.com keeps rooms temporary while durable workbook data remains whole.
 */
class ChesedSheetsDirectory {
	constructor() {
		this.rooms = new Map();
		this.socketRooms = new Map();
		this.guestSequence = 0;
	}

	/** Attaches one socket after successful permission evaluation and returns current presence. */
	join(client, workbookId, identity, capabilities) {
		this.leave(client, workbookId);
		const room = this.room(workbookId);
		this.guestSequence += 1;
		room.set(client, {
			canEdit: Boolean(capabilities.canEdit),
			id: `presence-${this.guestSequence}`,
			label: collaboratorLabel(identity, this.guestSequence),
			selection: null
		});
		if (!this.socketRooms.has(client)) {
			this.socketRooms.set(client, new Set());
		}
		this.socketRooms.get(client).add(workbookId);
		return this.members(workbookId);
	}

	/** Updates ephemeral selection only for a socket already joined to the workbook. */
	select(client, workbookId, selection) {
		const participant = this.rooms.get(workbookId)?.get(client);
		if (!participant) {
			return false;
		}
		participant.selection = selection;
		return true;
	}

	/** Returns a public-safe presence projection without account IDs or socket details. */
	members(workbookId) {
		return [...(this.rooms.get(workbookId)?.values() || [])].map((participant) => ({
			canEdit: participant.canEdit,
			id: participant.id,
			label: participant.label,
			selection: participant.selection
		}));
	}

	/** Returns current socket members so handler code may broadcast through realtime context. */
	clients(workbookId) {
		return [...(this.rooms.get(workbookId)?.keys() || [])];
	}

	/** Removes read-only viewers when a share gate changes or its capability rotates. */
	pruneReadOnly(workbookId) {
		const room = this.rooms.get(workbookId);
		if (!room) {
			return [];
		}
		const removed = [];
		for (const [client, participant] of room.entries()) {
			if (!participant.canEdit) {
				removed.push(client);
				this.leave(client, workbookId);
			}
		}
		return removed;
	}

	/** Detaches one socket from one room without touching durable workbook state. */
	leave(client, workbookId) {
		const room = this.rooms.get(workbookId);
		if (room) {
			room.delete(client);
			if (!room.size) {
				this.rooms.delete(workbookId);
			}
		}
		const memberships = this.socketRooms.get(client);
		memberships?.delete(workbookId);
		if (memberships && !memberships.size) {
			this.socketRooms.delete(client);
		}
	}

	/** Removes a disconnected socket from every workbook and returns affected workbook IDs. */
	disconnect(client) {
		const workbookIds = [...(this.socketRooms.get(client) || [])];
		for (const workbookId of workbookIds) {
			this.leave(client, workbookId);
		}
		return workbookIds;
	}

	/** Returns an existing room map or creates one ephemeral room vessel. */
	room(workbookId) {
		if (!this.rooms.has(workbookId)) {
			this.rooms.set(workbookId, new Map());
		}
		return this.rooms.get(workbookId);
	}
}

module.exports = {
	ChesedSheetsDirectory
};
