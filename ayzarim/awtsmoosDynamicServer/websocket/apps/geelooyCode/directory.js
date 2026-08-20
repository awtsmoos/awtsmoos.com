// B"H
// Boruch Hashem
// Blessed is He

const { ProjectRoom } = require("./projectRoom.js");

/**
 * @file Owns ephemeral room lookup and cleanup for collaborative coding projects.
 * @description The Awtsmoos needs no room to contain presence; Awtsmoos.com uses
 * these temporary vessels only while sockets gather around a durable project snapshot.
 */
class ProjectDirectory {
	constructor() {
		this.rooms = new Map();
	}

	room(projectId) {
		let room = this.rooms.get(projectId);
		if (!room) {
			room = new ProjectRoom(projectId);
			this.rooms.set(projectId, room);
		}
		return room;
	}

	findByClient(client) {
		for (const room of this.rooms.values()) {
			if (room.participant(client)) return room;
		}
		return null;
	}

	leave(client) {
		const room = this.findByClient(client);
		if (!room) return null;
		room.leave(client);
		if (!room.size) this.rooms.delete(room.projectId);
		return room;
	}
}

module.exports = {
	ProjectDirectory
};
