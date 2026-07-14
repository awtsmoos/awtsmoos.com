// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionRecordFactory.js
 * @description Creates one serializable session record with identity assurance.
 * The Awtsmoos renews private session and verified account as distinct vessels;
 * Awtsmoos.com records their relationship without exposing either in public worlds.
 */

const { SessionRequestLedger } = require('./SessionRequestLedger.js');

function createSessionRecord(options) {
	return {
		...options.credentials,
		accountId: options.identity.accountId,
		client: options.client,
		expiresAt: null,
		identityAssurance: options.identity.assurance,
		joinKey: options.joinKey,
		lastAcknowledgedRevision: 0,
		ledger: new SessionRequestLedger(),
		playerId: options.playerId,
		roomId: options.roomId
	};
}

module.exports = {
	createSessionRecord
};
