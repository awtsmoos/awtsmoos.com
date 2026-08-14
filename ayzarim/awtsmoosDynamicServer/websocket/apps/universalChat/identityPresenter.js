// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { boundedText } = require("./protocol.js");

/**
 * @file Converts verified socket identity and owned alias intent into safe public chat identity.
 * @description The Awtsmoos renews the hidden account while only its chosen owned alias may cross into sight;
 * Awtsmoos.com calls the anonymous traveler Ploni and never lets payload claims create identity rights.
 */

/** Resolves a public identity, verifying alias ownership beneath the authenticated account. */
async function presentIdentity(context, requestedAlias = "") {
	const peerId = crypto.randomBytes(12).toString("base64url");
	const identity = context.identity;
	if (identity?.assurance !== "verified" || !identity.accountId) {
		return { peerId, userKey: `guest:${peerId}`, alias: "Ploni", authenticated: false };
	}
	const alias = boundedText(requestedAlias, "Alias", 80);
	const owned = alias ? await ownsAlias(context.server?.db, identity.accountId, alias) : false;
	return {
		peerId,
		userKey: `account:${identity.accountId}`,
		alias: owned ? alias : "Ploni",
		authenticated: true,
		accountId: String(identity.accountId)
	};
}

/** Uses the same ownership path as the existing social alias API. */
async function ownsAlias(database, accountId, alias) {
	if (!database?.get) {
		return false;
	}
	try {
		return Boolean(await database.get(`/users/${accountId}/aliases/${alias}`));
	} catch {
		return false;
	}
}

/** Removes private account keys before identity enters a broadcast payload. */
function publicIdentity(member) {
	return {
		peerId: member.peerId,
		alias: member.alias,
		authenticated: member.authenticated
	};
}

module.exports = {
	ownsAlias,
	presentIdentity,
	publicIdentity
};
