//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationMembers
 * @description Lets an organization owner grant bounded admin/member authority
 * without ever exposing or transferring Wallet balances between human accounts.
 */

const { organizationId } = require("./organizationPolicy.js");
const {
	organizationView,
	requireOrganizationAccess
} = require("./organizationState.js");

const MEMBER_ROLES = Object.freeze(["admin", "member"]);

function setOrganizationMemberInside(database, ownerUserId, input = {}, now = Date.now()) {
	const id = organizationId(input.organizationId);
	const access = requireOrganizationAccess(database, id, ownerUserId, ["owner"]);
	if (!access.ok) return access;
	const targetUserId = String(input.targetUserId || "").trim();
	const role = String(input.role || "member").trim();
	if (!targetUserId || !MEMBER_ROLES.includes(role)) {
		return { ok: false, error: "invalid_organization_member" };
	}
	if (targetUserId === access.organization.ownerUserId) {
		return { ok: false, error: "organization_owner_role_fixed" };
	}
	access.organization.members[targetUserId] = role;
	access.organization.updatedAt = now;
	return {
		ok: true,
		organization: organizationView(access.organization, ownerUserId)
	};
}

function removeOrganizationMemberInside(database, ownerUserId, input = {}, now = Date.now()) {
	const id = organizationId(input.organizationId);
	const access = requireOrganizationAccess(database, id, ownerUserId, ["owner"]);
	if (!access.ok) return access;
	const targetUserId = String(input.targetUserId || "").trim();
	if (!targetUserId || targetUserId === access.organization.ownerUserId) {
		return { ok: false, error: "invalid_organization_member" };
	}
	delete access.organization.members[targetUserId];
	access.organization.updatedAt = now;
	return {
		ok: true,
		organization: organizationView(access.organization, ownerUserId)
	};
}

module.exports = {
	MEMBER_ROLES,
	removeOrganizationMemberInside,
	setOrganizationMemberInside
};
