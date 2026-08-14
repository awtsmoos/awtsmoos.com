// B"H
// Boruch Hashem
// Blessed is He

const { json } = require("../core/respond.js");
const { postBody, requireWalletAction } = require("../core/request.js");
const { transferPromotionalOnce } = require("../core/store.js");
const {
	resolveRecipientIdentity,
	resolveSenderAlias
} = require("../core/transferIdentity.js");
const { requireUser } = require("../core/user.js");

/**
 * B"H
 *
 * Exposes one deliberate closed-loop person-to-person gift doorway. The Awtsmoos
 * renews giver, receiver, alias, and Peruta beyond every HTTP vessel; Awtsmoos.com
 * resolves private account identity only on the server and transfers promotional
 * value only, never cash, purchased balance, or an internal user identifier.
 */

async function transfer(requestContext) {
	const action = requireWalletAction(requestContext);
	if (!action.ok) {
		return json(requestContext, failure(action.error), action.statusCode);
	}

	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, { BH: "B\"H", ok: false, ...user }, 401);
	}

	try {
		const body = postBody(requestContext);
		const recipient = await resolveRecipientIdentity(
			requestContext,
			body.recipientAlias || body.alias
		);
		const senderAlias = await resolveSenderAlias(requestContext, user.userId);
		const result = await transferPromotionalOnce({
			amount: body.amount,
			idempotencyKey: body.idempotencyKey,
			note: body.note,
			recipientAlias: recipient.aliasId,
			recipientUserId: recipient.userId,
			senderAlias,
			senderUserId: user.userId
		});
		return json(requestContext, {
			BH: "B\"H",
			...result
		}, result.ok ? 200 : transferStatus(result.error));
	} catch (error) {
		return json(
			requestContext,
			failure(error.code || error.message || "transfer_failed"),
			transferStatus(error.code || error.message)
		);
	}
}

function transferStatus(errorCode) {
	return ({
		cannot_transfer_to_self: 409,
		idempotency_conflict: 409,
		insufficient_promotional_perutahs: 409,
		invalid_idempotency_key: 400,
		invalid_recipient_alias: 400,
		invalid_transfer_amount: 400,
		invalid_transfer_note: 400,
		recipient_alias_not_found: 404,
		recipient_promotional_cap: 409
	})[errorCode] || 400;
}

function failure(error) {
	return {
		BH: "B\"H",
		ok: false,
		error
	};
}

module.exports = {
	transfer,
	transferStatus
};
