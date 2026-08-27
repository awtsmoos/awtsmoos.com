// B"H
// Boruch Hashem
// Blessed is He

const { sp } = require("../../social/helper/_awtsmoos.constants.js");
const {
	normalizeRecipientAlias,
	transferError
} = require("./transferValidation.js");

/**
 * B"H
 *
 * Resolves human-facing Awtsmoos aliases into treasury identities only inside the
 * server. The Awtsmoos renews public name and concealed owner beyond every lookup;
 * Awtsmoos.com lets a sender address `@alias` without ever exposing the recipient's
 * internal account identifier through Wallet responses or browser state.
 */

async function resolveRecipientIdentity(requestContext, value) {
	const aliasId = normalizeRecipientAlias(value);
	const info = await requestContext.db.get(
		`${sp}/aliases/${aliasId}/info`
	);

	if (!info?.user) {
		throw transferError("recipient_alias_not_found");
	}

	return Object.freeze({
		aliasId,
		userId: String(info.user)
	});
}

async function resolveSenderAlias(requestContext, userId) {
	const candidate = requestContext.request?.user?.info?.hosuhfuh?.alias;
	if (!candidate) {
		return "";
	}

	let aliasId;
	try {
		aliasId = normalizeRecipientAlias(candidate);
	} catch {
		return "";
	}

	const ownership = await requestContext.db.get(
		`/users/${userId}/aliases/${aliasId}`
	);
	return ownership ? aliasId : "";
}

module.exports = {
	resolveRecipientIdentity,
	resolveSenderAlias
};
