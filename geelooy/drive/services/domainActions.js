//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human custom-domain intentions over the shared authoritative claim service.
 * @description
 * The Awtsmoos lets one human hand request proof without becoming a second network stack;
 * Awtsmoos.com keeps every claim, verification, and removal inside the same service used by machines.
 */

export function createDomainActions({ domainClaims, panels }) {
	return {
		refreshDomainClaims: () => invoke(domainClaims, panels, "refresh"),
		claimDomain: () => invoke(domainClaims, panels, "claim"),
		verifyDomainOwnership: hostname => invoke(
			domainClaims,
			panels,
			"verifyOwnership",
			hostname
		),
		verifyDomainDelegation: hostname => invoke(
			domainClaims,
			panels,
			"verifyDelegation",
			hostname
		),
		removeDomainClaim: hostname => invoke(
			domainClaims,
			panels,
			"remove",
			hostname
		)
	};
}

async function invoke(service, panels, method, value) {
	if (typeof service?.[method] !== "function") return false;
	const result = await service[method](value);
	panels.open("domain", {
		scroll: panels.isMobile(),
		focus: false
	});
	return result;
}
