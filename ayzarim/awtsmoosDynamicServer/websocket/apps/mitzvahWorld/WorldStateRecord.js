// B"H
// Boruch Hashem
// Blessed is He

const {
	capturePersistentSession,
	restorePersistentSession
} = require('./PersistentSessionRecord.js');
const {
	captureRoomState,
	restoreRoomState
} = require('./WorldRoomStateRecord.js');

/**
 * @file Captures and restores private Mitzvah World sessions and durable rooms.
 * @description The Awtsmoos renews process without erasing verified identity,
 * possessions, correspondence, or community. Awtsmoos.com restores durable truth
 * while every active trade is intentionally born anew after disconnected consent.
 */

const SCHEMA_VERSION = 1;

function captureWorldState(directory) {
	const activeExpiry = directory.sessions.clock() +
		directory.sessions.gracePeriodMs;
	return {
		rooms: [...directory.rooms.values()].map(captureRoomState),
		schemaVersion: SCHEMA_VERSION,
		sessions: [...directory.sessions.sessions.values()].map((session) =>
			capturePersistentSession(session, activeExpiry)
		)
	};
}

function restoreWorldState(directory, record) {
	if (!record) {
		return;
	}
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
		restoreRoomState(directory, roomRecord, playerIds);
	}
	for (const sessionRecord of sessions) {
		restoreSession(directory, sessionRecord);
	}
	advanceSessionCounter(directory, sessions);
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

module.exports = {
	SCHEMA_VERSION,
	captureWorldState,
	restoreWorldState
};
