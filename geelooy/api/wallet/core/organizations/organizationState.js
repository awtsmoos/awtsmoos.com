//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationState
 * @description
 * Owns normalized organization collections and public projections. Treasury
 * transitions live elsewhere so reads cannot accidentally become value movement.
 */

function ensureOrganizationCollections(database) {
	database.organizations ||= {};
	database.organizationEvents = Array.isArray(database.organizationEvents)
		? database.organizationEvents
		: [];
	return database.organizations;
}

function createOrganizationRecord(id, ownerUserId, name, now = Date.now()) {
	return {
		id,
		name,
		ownerUserId,
		purchasedBalance: 0,
		members: { [ownerUserId]: "owner" },
		budgets: {},
		createdAt: now,
		updatedAt: now
	};
}

function findOrganization(database, organizationId) {
	ensureOrganizationCollections(database);
	return database.organizations[organizationId] || null;
}

function requireOrganizationAccess(database, organizationId, userId, roles = null) {
	const organization = findOrganization(database, organizationId);
	if (!organization) {
		return { ok: false, error: "organization_not_found" };
	}
	const role = organization.members?.[userId] || null;
	if (!role) {
		return { ok: false, error: "organization_access_denied" };
	}
	if (Array.isArray(roles) && !roles.includes(role)) {
		return { ok: false, error: "organization_role_denied" };
	}
	return { ok: true, organization, role };
}

function organizationView(organization, userId) {
	const role = organization.members?.[userId] || null;
	return Object.freeze({
		id: organization.id,
		name: organization.name,
		role,
		purchasedBalance: Number(organization.purchasedBalance) || 0,
		budgets: Object.values(organization.budgets || {}).map(budgetView),
		memberCount: Object.keys(organization.members || {}).length,
		createdAt: organization.createdAt,
		updatedAt: organization.updatedAt
	});
}

function budgetView(budget) {
	const limit = Number(budget.limitPerutahs) || 0;
	const spent = Number(budget.spentPerutahs) || 0;
	return Object.freeze({
		key: budget.key,
		label: budget.label,
		limitPerutahs: limit,
		spentPerutahs: spent,
		availablePerutahs: Math.max(limit - spent, 0),
		updatedAt: budget.updatedAt
	});
}

function listOrganizationsForUser(database, userId) {
	ensureOrganizationCollections(database);
	return Object.values(database.organizations)
		.filter(organization => Boolean(organization.members?.[userId]))
		.map(organization => organizationView(organization, userId));
}

module.exports = {
	budgetView,
	createOrganizationRecord,
	ensureOrganizationCollections,
	findOrganization,
	listOrganizationsForUser,
	organizationView,
	requireOrganizationAccess
};
