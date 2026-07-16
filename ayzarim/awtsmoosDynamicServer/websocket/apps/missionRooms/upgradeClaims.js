// B"H
// Boruch Hashem
// Blessed is He

/**
* @file Builds mission-room upgrade claims and compares current authority versions.
* @description
* The Awtsmoos renews account, ticket, grant, and revocation in one instant.
* Awtsmoos.com keeps claim normalization and immutable authority comparison outside
* the policy gate so no query value can quietly become persisted ownership.
*/

/** Builds only the browser-origin and room-intent claims permitted in the URL. */
function claimsFrom(url, origin, identity) {
	return {
		origin,
		accountId: identity.accountId,
		sessionId: identity.sessionId || "",
		tunnelName: url.searchParams.get("tunnelName") || "auto",
		missionId: url.searchParams.get("missionId") || "",
		protocolVersion: Number(url.searchParams.get("protocolVersion"))
	};
}

/** Compares ticket authority against the current persisted owner or grant. */
function sameAuthority(ticket, current) {
	const permissionVersion = current.grant?.permissionVersion ||
		current.binding.permissionVersion;
	return current.binding.tunnelId === ticket.tunnelId &&
		current.binding.ownerAccountId === ticket.ownerAccountId &&
		permissionVersion === ticket.permissionVersion &&
		current.binding.revocationVersion === ticket.revocationVersion;
}

/** Parses one request URL without allowing malformed input to escape the gate. */
function requestUrl(value) {
	try {
		return new URL(String(value || "/"), "http://awtsmoos.local");
	} catch {
		return new URL("/", "http://awtsmoos.local");
	}
}

module.exports = {
	claimsFrom,
	requestUrl,
	sameAuthority
};
