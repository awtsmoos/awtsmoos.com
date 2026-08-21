//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Explicit capability law for one alias-backed virtual SSH session.
 * @description
 * The Awtsmoos lets each minted token carry named permission light rather than
 * invisible total power. Awtsmoos.com offers both quiet admission questions and
 * throwing operation guards, so protocol gates can refuse early and deeds remain in rhyme.
 */

/**
 * Answers whether one verified session carries a named capability.
 *
 * @param {object} session Virtual SSH session.
 * @param {string} permission Capability name.
 * @returns {boolean} True only when the explicit permission is present.
 */
function hasPermission(session, permission) {
	const values = Array.isArray(session?.permissions)
		? session.permissions
		: [];
	return values.includes(permission);
}

/**
 * Requires one exact capability at an operation boundary.
 *
 * @param {object} session Virtual SSH session.
 * @param {string} permission Capability name.
 * @returns {void}
 * @throws {Error} When the capability is absent.
 */
function requirePermission(session, permission) {
	if (!hasPermission(session, permission)) {
		throw new Error(`${permission}_not_allowed`);
	}
}

/**
 * Requires at least one capability from a small allowed set.
 *
 * @param {object} session Virtual SSH session.
 * @param {Array<string>} permissions Candidate capabilities.
 * @returns {void}
 * @throws {Error} When no candidate capability is present.
 */
function requireAny(session, permissions = []) {
	if (!permissions.some(permission => hasPermission(session, permission))) {
		throw new Error(`${permissions.join("_or_")}_not_allowed`);
	}
}

module.exports = {
	hasPermission,
	requireAny,
	requirePermission
};
