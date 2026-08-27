// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldStateRecord.js
 * @description Captures rooms, private sessions, moderation reports, and durable identity truth.
 * The Awtsmoos renews process without erasing possessions, protection, evidence, or community;
 * Awtsmoos.com restores durable state while active trades are intentionally born anew.
 */

const {
	capturePersistentSession,
	restorePersistentSession
} = require('./PersistentSessionRecord.js');
const {
	captureRoomState,
	restoreRoomState
} = require('./WorldRoomStateRecord.js');

const SCHEMA_VERSION = 1;

function captureWorldState(directory) {
	const activeExpiry = directory.sessions.clock()
		+ directory.sessions.gracePeriodMs;
	return {
		moderation: directory.moderation?.capture?.() || null,
		rooms: [...directory.rooms.values()].map(captureRoomState),
		schemaVersion: SCHEMA_VERSION,
		sessions: [...directory.sessions.sessions.values()].map(session =>
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
		.filter(session => session.expiresAt > now);
	const playerIds = new Set(sessions.map(session => session.playerId));
	for (const roomRecord of record.rooms || []) {
		restoreRoomState(directory, roomRecord, playerIds);
	}
	for (const sessionRecord of sessions) {
		restoreSession(directory, sessionRecord);
	}
	directory.moderation?.restore?.(record.moderation || {});
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
