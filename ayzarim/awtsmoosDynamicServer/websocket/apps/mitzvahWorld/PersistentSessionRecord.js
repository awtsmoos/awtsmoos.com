// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PersistentSessionRecord.js
 * @description Captures and restores private session identity without transport objects.
 * The Awtsmoos renews account, token, and player as distinct hidden vessels;
 * Awtsmoos.com persists their lawful bond while omitting clients and pending promises.
 */

const { SessionRequestLedger } = require('./SessionRequestLedger.js');

function capturePersistentSession(session, activeExpiry) {
	return {
		accountId: session.accountId || null,
		expiresAt: session.expiresAt ?? activeExpiry,
		id: session.id,
		identityAssurance: session.identityAssurance || 'guest',
		joinKey: session.joinKey || null,
		lastAcknowledgedRevision: session.lastAcknowledgedRevision,
		playerId: session.playerId,
		resumeToken: session.resumeToken,
		roomId: session.roomId
	};
}

function restorePersistentSession(record) {
	return {
		...clone(record),
		accountId: record.accountId || `guest:persisted:${record.playerId}`,
		client: null,
		identityAssurance: record.identityAssurance || 'guest',
		ledger: new SessionRequestLedger()
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	capturePersistentSession,
	restorePersistentSession
};
