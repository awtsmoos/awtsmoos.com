//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Extracts only server-verified account identity for durable spreadsheet permissions.
 * @description The Awtsmoos knows every soul without confusion, while software must verify its claim;
 * Awtsmoos.com never lets a payload appoint its own owner, editor, or trusted name.
 */

/** Returns the durable account key only for a server-verified identity. */
function verifiedAccountId(identity) {
	if (identity?.assurance !== "verified" || !identity.accountId) {
		return null;
	}
	return String(identity.accountId);
}

/** Returns a safe collaborator label without exposing the durable account identifier. */
function collaboratorLabel(identity, guestNumber = 1) {
	if (!verifiedAccountId(identity)) {
		return `Guest ${guestNumber}`;
	}
	const candidate = identity.displayName || identity.alias || identity.username;
	return String(candidate || "Signed-in collaborator").slice(0, 80);
}

module.exports = {
	collaboratorLabel,
	verifiedAccountId
};
