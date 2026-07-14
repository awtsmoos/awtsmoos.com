// B"H
// Boruch Hashem
// Blessed is He
/** @module LeaseTransfer @description Transfers character authority explicitly and audibly. */

/** Creates a pending lease-transfer record. */
export function createLeaseTransfer(input) {
	const characterId = String(input?.characterId || '').trim();
	const fromSessionId = String(input?.fromSessionId || '').trim();
	const toSessionId = String(input?.toSessionId || '').trim();
	if (!characterId || !fromSessionId || !toSessionId || fromSessionId === toSessionId) {
		throw new TypeError('Lease transfer requires distinct source and destination sessions.');
	}
	return Object.freeze({
		characterId,
		fromSessionId,
		toSessionId,
		requestedBy: String(input?.requestedBy || ''),
		state: 'pending',
		requestedAt: String(input?.requestedAt || new Date().toISOString())
	});
}

/** Accepts a pending transfer and records the authority change. */
export function acceptLeaseTransfer(transfer, acceptedBy, acceptedAt = new Date().toISOString()) {
	if (transfer?.state !== 'pending') {
		throw new TypeError('Only pending lease transfers can be accepted.');
	}
	return Object.freeze({
		...transfer,
		state: 'accepted',
		acceptedBy: String(acceptedBy),
		acceptedAt
	});
}
