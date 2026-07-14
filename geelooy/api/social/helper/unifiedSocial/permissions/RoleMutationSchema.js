//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RoleMutationSchema
 * @description
 * Institutional role mutations are bounded to explicit non-owner garments. The
 * Awtsmoos gives authority without hierarchy; Awtsmoos.com still prevents a member
 * dropdown from becoming an owner-transfer mechanism or granting equal authority.
 */

const { ROLE_ORDER, normalizeRole } = require('./CapabilityCatalog.js');

const ASSIGNABLE_ROLES = Object.freeze([
	'admin',
	'moderator',
	'editor',
	'contributor',
	'member',
	'follower',
	'guest'
]);

function normalizeMutation(value = {}) {
	return {
		memberAliasId: String(value.memberAliasId || value.aliasId || '').trim().slice(0, 120),
		role: normalizeRole(value.role),
		reason: String(value.reason || value.note || '').trim().slice(0, 1600)
	};
}

function roleRank(role) {
	return ROLE_ORDER.indexOf(normalizeRole(role));
}

function mayAssign(actorRole, targetRole) {
	const actor = normalizeRole(actorRole);
	const target = normalizeRole(targetRole);
	if (!ASSIGNABLE_ROLES.includes(target)) return false;
	return roleRank(actor) > roleRank(target);
}

function validateMutation(value, actorRole) {
	const mutation = normalizeMutation(value);
	const errors = [];
	if (!mutation.memberAliasId) errors.push('A member alias is required.');
	if (!ASSIGNABLE_ROLES.includes(mutation.role)) errors.push('The requested role is not assignable.');
	if (!mayAssign(actorRole, mutation.role)) errors.push('The acting role cannot grant this level.');
	return {
		valid: errors.length === 0,
		errors,
		mutation
	};
}

module.exports = {
	ASSIGNABLE_ROLES,
	normalizeMutation,
	roleRank,
	mayAssign,
	validateMutation
};
