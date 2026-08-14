// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("crypto");
const { RealtimeError } = require("../../platform/RealtimeError.js");
const { boundedText } = require("./protocol.js");

/**
 * @file Resolves private messaging authorization from verified account identity and privately-owned aliases.
 * @description The Awtsmoos hides account identity beneath a public alias while the server alone knows the owner behind the name;
 * Awtsmoos.com hashes account keys for storage and never asks the browser to declare another person's account claim.
 */

function requireVerifiedAccount(context) {
	const identity = context.identity;
	if (identity?.assurance !== "verified" || !identity.accountId) {
		throw new RealtimeError("PRIVATE_MESSAGING_LOGIN_REQUIRED", "Sign in to use private messaging.", null, 401);
	}
	return String(identity.accountId);
}

function accountKey(accountId) {
	return crypto.createHash("sha256").update(String(accountId)).digest("hex");
}

async function resolveActor(context, requestedAlias) {
	const accountId = requireVerifiedAccount(context);
	const alias = boundedText(requestedAlias, "Alias", 80);
	if (!alias || !await context.server.db.get(`/users/${accountId}/aliases/${alias}`).catch(() => null)) {
		throw new RealtimeError("PRIVATE_MESSAGING_ALIAS_REQUIRED", "Choose an alias you own before private messaging.", null, 403);
	}
	return { accountId, accountKey: accountKey(accountId), alias };
}

async function resolveTargetAlias(database, aliasValue) {
	const alias = boundedText(aliasValue, "Target alias", 80);
	const record = await database.get(`/social/aliases/${alias}/info`).catch(() => null);
	if (!record?.user) {
		throw new RealtimeError("PRIVATE_MESSAGING_TARGET_NOT_FOUND", "That alias was not found.", null, 404);
	}
	return { accountId: String(record.user), accountKey: accountKey(record.user), alias };
}

module.exports = { accountKey, requireVerifiedAccount, resolveActor, resolveTargetAlias };
