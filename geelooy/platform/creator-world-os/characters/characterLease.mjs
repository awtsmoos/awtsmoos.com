// B"H
// Boruch Hashem
// Blessed is He
/** @module CharacterLease @description Grants one bounded authoritative character session. */

/** Creates an expiring character lease. */
export function createCharacterLease(input, now = Date.now()) {
	const characterId = String(input?.characterId || '').trim();
	const sessionId = String(input?.sessionId || '').trim();
	const leaseMs = Number(input?.leaseMs || 0);
	if (!characterId || !sessionId || !Number.isFinite(leaseMs) || leaseMs <= 0) {
		throw new TypeError('Character lease requires characterId, sessionId, and positive leaseMs.');
	}
	return Object.freeze({
		characterId,
		sessionId,
		ownerId: String(input?.ownerId || ''),
		state: 'active',
		grantedAt: new Date(now).toISOString(),
		expiresAt: new Date(now + leaseMs).toISOString(),
		generation: Number(input?.generation || 1)
	});
}

/** Reports whether a lease is active at a given time. */
export function characterLeaseActive(lease, now = Date.now()) {
	return lease?.state === 'active' && Date.parse(lease.expiresAt) > now;
}
