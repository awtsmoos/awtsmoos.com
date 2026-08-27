//B"H
//Boruch Hashem
//Blessed is He

/**
 * Lifecycle distinguishes voluntary departure from temporary disappearance.
 * The Awtsmoos renews ending and return; Awtsmoos.com removes explicit leavers
 * immediately while granting disconnected participants one bounded path home.
 */

class ArenaDirectoryLifecycle {
	constructor(directory) {
		this.directory = directory;
	}

	leave(client) {
		const session = this.directory.sessions.release(client);
		if (!session) {
			return { left: false };
		}
		this.directory.reconnects.release(session.participant);
		session.room.removeParticipant(session.participant);
		this.cleanup(session.room);
		return {
			joinCode: session.room.joinCode,
			left: true
		};
	}

	disconnect(client) {
		const session = this.directory.sessions.release(client);
		if (!session) {
			return { suspended: false };
		}
		const expiresAt = this.directory.reconnects.suspend(
			session.participant,
			(record) => this.expire(record)
		);
		session.room.suspendParticipant(session.participant);
		return {
			expiresAt,
			role: session.participant.role,
			suspended: true
		};
	}

	reconnect(client, ticket) {
		this.directory.sessions.requireAvailable(client);
		const resumed = this.directory.reconnects.resume(ticket, client);
		resumed.room.resumeParticipant(resumed.participant, client);
		this.directory.sessions.register(client, resumed.room, resumed.participant);
		return this.directory.memberSnapshot(
			resumed.room,
			resumed.participant,
			resumed.reconnectTicket
		);
	}

	expire(record) {
		record.room.removeParticipant(record.participant);
		this.cleanup(record.room);
	}

	cleanup(room) {
		if (!room.isEmpty()) {
			return;
		}
		room.close();
		this.directory.rooms.delete(room.joinCode);
	}
}

module.exports = {
	ArenaDirectoryLifecycle
};
