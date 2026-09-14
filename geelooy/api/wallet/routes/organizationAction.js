//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationActionRoute
 * @description Exposes organization mutations only through the explicit Wallet
 * action boundary and authenticated server identity.
 */

const { json } = require("../core/respond.js");
const { postBody, requireWalletAction } = require("../core/request.js");
const { requireUser } = require("../core/user.js");
const { dispatchOrganizationAction } = require("./organizationActionSupport.js");

async function organizationAction(requestContext) {
	const actionGate = requireWalletAction(requestContext);
	if (!actionGate.ok) {
		return json(requestContext, failure(actionGate.error), actionGate.statusCode);
	}
	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, { BH: "B\"H", ok: false, ...user }, 401);
	}
	try {
		const result = await dispatchOrganizationAction(
			requestContext,
			user.userId,
			postBody(requestContext)
		);
		return json(requestContext, { BH: "B\"H", ...result }, statusFor(result));
	} catch (error) {
		return json(requestContext, failure(error.code || error.message), statusFor({ error: error.code }));
	}
}

function statusFor(result = {}) {
	if (result.ok) return 200;
	return ({
		organization_not_found: 404,
		organization_access_denied: 403,
		organization_role_denied: 403,
		organization_owner_role_fixed: 409,
		insufficient_purchased_perutahs: 409,
		organization_budget_overcommitted: 409,
		organization_budget_exhausted: 409,
		organization_budget_not_found: 404,
		budget_below_spent: 409,
		idempotency_conflict: 409,
		recipient_alias_not_found: 404
	})[result.error] || 400;
}

function failure(error) {
	return { BH: "B\"H", ok: false, error: error || "organization_action_failed" };
}

module.exports = {
	organizationAction,
	statusFor
};
