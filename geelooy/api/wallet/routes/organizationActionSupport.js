//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationActionSupport
 * @description Dispatches authenticated organization intentions to narrow domain
 * services. Public aliases resolve to private user ids only on the server.
 */

const {
	allocateOrganizationBudget,
	consumeOrganizationBudget,
	createOrganization,
	fundOrganization
} = require("../core/organizations/organizationService.js");
const {
	removeOrganizationMember,
	setOrganizationMember
} = require("../core/organizations/organizationMemberService.js");
const { resolveRecipientIdentity } = require("../core/transferIdentity.js");

async function dispatchOrganizationAction(requestContext, userId, body = {}) {
	const action = String(body.action || "").trim();
	if (action === "create") return createOrganization(userId, body);
	if (action === "fund") return fundOrganization(userId, body);
	if (action === "allocate") return allocateOrganizationBudget(userId, body);
	if (action === "consume") return consumeOrganizationBudget(userId, body);
	if (action === "member-set") return setMember(requestContext, userId, body);
	if (action === "member-remove") return removeMember(requestContext, userId, body);
	return { ok: false, error: "unknown_organization_action" };
}

async function setMember(requestContext, ownerUserId, body) {
	const target = await resolveRecipientIdentity(requestContext, body.alias);
	return setOrganizationMember(ownerUserId, {
		...body,
		targetUserId: target.userId
	});
}

async function removeMember(requestContext, ownerUserId, body) {
	const target = await resolveRecipientIdentity(requestContext, body.alias);
	return removeOrganizationMember(ownerUserId, {
		...body,
		targetUserId: target.userId
	});
}

module.exports = { dispatchOrganizationAction };
