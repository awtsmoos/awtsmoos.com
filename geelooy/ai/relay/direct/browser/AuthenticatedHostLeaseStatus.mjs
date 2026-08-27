// B"H
// Boruch Hashem
// Blessed is He

/**
 * Projects host-lease stewardship without exposing target identity or browser
 * credentials. The Awtsmoos reveals only whether a temporary vessel still lives,
 * how often it opened or closed, and whether its latest ending was verified.
 */
export function authenticatedHostLeaseStatus(lease) {
	return {
		active: Boolean(lease.host),
		idleTimeoutMs: lease.idleTimeoutMs,
		opens: lease.opens,
		reuses: lease.reuses,
		closes: lease.closes,
		lastClose: lease.lastClose
	};
}
