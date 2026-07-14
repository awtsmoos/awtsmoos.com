// B"H
// Boruch Hashem
// Blessed is He
/** @module OwnershipClaim @description Creates expiring file ownership leases. */

/** Creates one immutable ownership claim. */
export function createOwnershipClaim(input, now = Date.now()) {
	const path = String(input?.path || '').trim();
	const owner = String(input?.owner || '').trim();
	const leaseMs = Number(input?.leaseMs || 0);
	if (!path || !owner || !Number.isFinite(leaseMs) || leaseMs <= 0) {
		throw new TypeError('Ownership claim requires path, owner, and positive leaseMs.');
	}
	return Object.freeze({
		path,
		owner,
		claimedAt: new Date(now).toISOString(),
		expiresAt: new Date(now + leaseMs).toISOString(),
		reason: String(input?.reason || '').trim()
	});
}

/** Returns true while the claim remains active. */
export function isOwnershipClaimActive(claim, now = Date.now()) {
	return Date.parse(claim?.expiresAt || '') > now;
}

/** Detects overlapping active claims. */
export function findOwnershipConflicts(claims, now = Date.now()) {
	const active = claims.filter(claim => isOwnershipClaimActive(claim, now));
	return active.filter((claim, index) => {
		return active.some((other, otherIndex) => {
			return index !== otherIndex && claim.path === other.path && claim.owner !== other.owner;
		});
	});
}
