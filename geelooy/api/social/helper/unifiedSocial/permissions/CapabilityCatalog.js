//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CapabilityCatalog
 * @description
 * Public role names become transparent capability presets instead of scattered
 * string comparisons. The Awtsmoos gives each institutional garment its measured
 * power while Awtsmoos.com can explain every gate in ordinary human language.
 */

const CAPABILITIES = Object.freeze([
	'readPublic',
	'follow',
	'submitContent',
	'submitReference',
	'createSeries',
	'publishCanonical',
	'publishReference',
	'editOwnContent',
	'editAnyContent',
	'reviewSubmissions',
	'moderateDiscussion',
	'manageMembers',
	'manageSettings',
	'viewPrivateAnalytics',
	'archiveInstitution'
]);

const ROLE_ORDER = Object.freeze([
	'guest',
	'follower',
	'member',
	'contributor',
	'editor',
	'moderator',
	'admin',
	'owner'
]);

const ROLE_CAPABILITIES = Object.freeze({
	guest: ['readPublic'],
	follower: ['readPublic', 'follow'],
	member: ['readPublic', 'follow', 'submitContent', 'submitReference'],
	contributor: [
		'readPublic',
		'follow',
		'submitContent',
		'submitReference',
		'editOwnContent'
	],
	editor: [
		'readPublic',
		'follow',
		'submitContent',
		'submitReference',
		'createSeries',
		'publishCanonical',
		'publishReference',
		'editOwnContent',
		'editAnyContent'
	],
	moderator: [
		'readPublic',
		'follow',
		'submitContent',
		'submitReference',
		'reviewSubmissions',
		'moderateDiscussion',
		'viewPrivateAnalytics'
	],
	admin: CAPABILITIES.filter(item => item !== 'archiveInstitution'),
	owner: CAPABILITIES
});

function normalizeRole(value) {
	const role = String(value || '').trim().toLowerCase();
	return ROLE_ORDER.includes(role) ? role : 'guest';
}

function strongestRole(roles = []) {
	return [...new Set(roles.map(normalizeRole))]
		.sort((left, right) => ROLE_ORDER.indexOf(right) - ROLE_ORDER.indexOf(left))[0]
		|| 'guest';
}

function capabilitiesForRoles(roles = []) {
	const capabilities = new Set();
	for (const role of roles.map(normalizeRole)) {
		for (const capability of ROLE_CAPABILITIES[role]) capabilities.add(capability);
	}
	return [...capabilities].sort();
}

function hasCapability(capabilities, name) {
	return Array.isArray(capabilities) && capabilities.includes(name);
}

function describeCapability(name) {
	const words = String(name || '').replace(/([A-Z])/g, ' $1').toLowerCase();
	return words ? `May ${words}.` : '';
}

module.exports = {
	CAPABILITIES,
	ROLE_ORDER,
	ROLE_CAPABILITIES,
	normalizeRole,
	strongestRole,
	capabilitiesForRoles,
	hasCapability,
	describeCapability
};
