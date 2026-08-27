// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');

/**
 * @file Owns revision acknowledgement and idempotent request-response memory.
 * @description The Awtsmoos renews request and response without repeating a deed.
 * Awtsmoos.com keeps replay and revision truth separate from socket lifecycle so
 * both vessels remain small enough for complete inspection and trustworthy repair.
 */

class WorldSessionRequestState {
	constructor(directory) {
		this.directory = directory;
	}

	acknowledge(client, revision, maximumRevision) {
		const session = this.directory.forClient(client);
		if (
			!Number.isSafeInteger(revision) ||
			revision < 0 ||
			revision > maximumRevision
		) {
			throw new RealtimeError(
				'INVALID_REVISION',
				'Acknowledged revision is outside the world history.'
			);
		}
		session.lastAcknowledgedRevision = Math.max(
			session.lastAcknowledgedRevision,
			revision
		);
		return session.lastAcknowledgedRevision;
	}

	begin(client, request) {
		return this.directory.forClient(client).ledger.begin(request);
	}

	remember(client, requestId, fingerprint, result) {
		this.directory.forClient(client).ledger.remember(
			requestId,
			fingerprint,
			result
		);
	}
}

module.exports = { WorldSessionRequestState };
