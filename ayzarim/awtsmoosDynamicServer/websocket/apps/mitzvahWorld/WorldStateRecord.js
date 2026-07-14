// B"H
// Boruch Hashem
// Blessed is He

const {
	capturePersistentSession,
	restorePersistentSession
} = require('./PersistentSessionRecord.js');
const { createPlayerState } = require('./PlayerState.js');
const { sanitizeSocialState } = require('./WorldSocialStateFilter.js');

/**
 * @file Captures private player, social, room, join, and reconnect state.
 * @description The Awtsmoos renews runtime beyond sockets while Awtsmoos.com
 * persists verified identity through the private session vessel and never exposes
 * it in public room or player projections.
 */

const SCHEMA_VERSION = 1;

function captureWorldState(directory) {
	const activeExpiry = directory.sessions.clock() +
		directory.sessions.gracePeriodMs;
	return {
		rooms: [...directory.rooms.values()].map((room) => ({
			id: room.id,
			instances: room.instances.snapshotAll(),
			nextEntity: room.nextEntity,
			parties: room.parties.snapshotAll(),
			players: [...room.players.values()]
				.filter((player) => player.kind === 'human')
				.map(clone),
			revision: room.revision
		})),
		schemaVersion: SCHEMA_VERSION,
		sessions: [...directory.sessions.sessions.values()].map((session) =>
			capturePersistentSession(session, activeExpiry)
		)
	};
}

function restoreWorldState(directory, record) {
	if (!record) return;
	if (record.schemaVersion !== SCHEMA_VERSION) {
		throw new Error(
			`Unsupported Mitzvah World persistence schema: ${record.schemaVersion}`
		);
	}
	const now = directory.sessions.clock();
	const sessions = (record.sessions || [])
		.filter((session) => session.expiresAt > now);
	const playerIds = new Set(sessions.map((session) => session.playerId));
	for (const roomRecord of record.rooms || []) {
		restoreRoom(directory, roomRecord, playerIds);
	}
	for (const sessionRecord of sessions) {
		restoreSession(directory, sessionRecord);
	}
	advanceSessionCounter(directory, sessions);
}

function restoreRoom(directory, roomRecord, playerIds) {
	const room = directory.room(roomRecord.id);
	const social = sanitizeSocialState(roomRecord, playerIds);
	room.players.clear();
	for (const player of social.players) {
		if (playerIds.has(player.id)) {
			room.players.set(player.id, restorePlayer(player));
		}
	}
	room.nextEntity = Math.max(Number(roomRecord.nextEntity || 1), 1);
	room.journal.revision = Math.max(Number(roomRecord.revision || 0), 0);
	room.parties.restore(social.parties);
	room.instances.restore(social.instances);
}

function restorePlayer(record) {
	const defaults = createPlayerState(record.position || {});
	return {
		...defaults,
		...clone(record),
		equipment: clone(record.equipment || defaults.equipment),
		inventory: clone(record.inventory || defaults.inventory),
		profile: clone(record.profile || defaults.profile),
		safePosition: clone(record.safePosition || defaults.safePosition)
	};
}

function restoreSession(directory, record) {
	const session = restorePersistentSession(record);
	directory.sessions.sessions.set(session.resumeToken, session);
	directory.sessions.joinKeys.bind(session);
}

function advanceSessionCounter(directory, sessions) {
	const maximum = sessions.reduce((value, session) => {
		const match = /mw-session-(\d+)$/.exec(session.id);
		return Math.max(value, Number(match?.[1] || 0));
	}, 0);
	directory.sessions.tokens.nextSessionNumber = maximum + 1;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	SCHEMA_VERSION,
	captureWorldState,
	restoreWorldState
};
