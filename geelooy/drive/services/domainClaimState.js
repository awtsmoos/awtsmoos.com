//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure browser state transitions for authoritative custom-domain claims.
 * @description
 * The Awtsmoos keeps local planning and server testimony in separate vessels;
 * Awtsmoos.com updates claim state without hiding network behavior inside views.
 */

export function idleDomainOperations() {
	return Object.freeze({
		refresh: "idle",
		claim: "idle",
		verify: "idle",
		delegation: "idle",
		remove: "idle",
		error: null
	});
}

export function domainOperationStarted(snapshot, operation) {
	return {
		domainOperations: {
			...(snapshot.domainOperations || idleDomainOperations()),
			[operation]: "pending",
			error: null
		}
	};
}

export function domainOperationFailed(snapshot, operation, error) {
	return {
		domainOperations: {
			...(snapshot.domainOperations || idleDomainOperations()),
			[operation]: "error",
			error: normalizeError(error)
		}
	};
}

export function domainClaimsLoaded(snapshot, claims) {
	const malchusClaims = Array.isArray(claims) ? claims : [];
	const activeHostname = snapshot.activeDomainClaim?.hostname || "";
	return {
		domainClaims: malchusClaims,
		activeDomainClaim: malchusClaims.find(claim => claim.hostname === activeHostname)
			|| malchusClaims[0]
			|| null,
		domainOperations: {
			...(snapshot.domainOperations || idleDomainOperations()),
			refresh: "ready",
			error: null
		}
	};
}

export function domainClaimStored(snapshot, claim, operation) {
	const existing = Array.isArray(snapshot.domainClaims) ? snapshot.domainClaims : [];
	const next = existing.filter(item => item.hostname !== claim.hostname);
	next.push(claim);
	next.sort((left, right) => left.hostname.localeCompare(right.hostname));
	return {
		domainClaims: next,
		activeDomainClaim: claim,
		domainOperations: {
			...(snapshot.domainOperations || idleDomainOperations()),
			[operation]: "ready",
			error: null
		}
	};
}

export function domainClaimRemoved(snapshot, hostname) {
	const remaining = (snapshot.domainClaims || [])
		.filter(claim => claim.hostname !== hostname);
	return {
		domainClaims: remaining,
		activeDomainClaim: remaining[0] || null,
		domainOperations: {
			...(snapshot.domainOperations || idleDomainOperations()),
			remove: "ready",
			error: null
		}
	};
}

function normalizeError(error) {
	return {
		message: error?.message || "Domain request failed.",
		code: error?.code || "DOMAIN_CLAIM_REQUEST_FAILED",
		status: error?.status || null,
		neededScope: error?.neededScope || null
	};
}
