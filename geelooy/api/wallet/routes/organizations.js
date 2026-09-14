//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationsRoute
 * @description Returns only organizations visible to the authenticated account.
 * Reading organization budgets never grants mutation authority.
 */

const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { listOrganizations } = require("../core/organizations/organizationService.js");

async function organizations(requestContext) {
	const user = requireUser(requestContext);
	if (!user.ok) {
		return json(requestContext, {
			BH: "B\"H",
			ok: false,
			...user
		}, 401);
	}
	const result = await listOrganizations(user.userId);
	return json(requestContext, {
		BH: "B\"H",
		...result
	});
}

module.exports = { organizations };
