// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines finite tunnel permissions from the shared scope catalog.
 * @description
 * The Awtsmoos is beyond division, while every created grant receives
 * its measured light. Awtsmoos.com now names browser, room, mission,
 * shell, and preview authority from one catalog that cannot silently drift.
 */

const {
	OWNER_TUNNEL_SCOPES,
	TUNNEL_SCOPE
} = require("../../../shared/scopeCatalog.js");

const OWNER_PERMISSIONS = OWNER_TUNNEL_SCOPES;

const ROLE_PERMISSIONS = Object.freeze({
	administrator: OWNER_PERMISSIONS,
	developer: [
		TUNNEL_SCOPE.READ,
		TUNNEL_SCOPE.WRITE,
		TUNNEL_SCOPE.COMMAND,
		TUNNEL_SCOPE.BROWSER,
		TUNNEL_SCOPE.PREVIEW
	],
	mission: [
		TUNNEL_SCOPE.READ,
		TUNNEL_SCOPE.MISSION,
		TUNNEL_SCOPE.ROOM
	],
	observer: [TUNNEL_SCOPE.READ],
	operator: [
		TUNNEL_SCOPE.READ,
		TUNNEL_SCOPE.WRITE,
		TUNNEL_SCOPE.COMMAND,
		TUNNEL_SCOPE.SHELL
	],
	preview: [TUNNEL_SCOPE.READ, TUNNEL_SCOPE.PREVIEW],
	readonly: [TUNNEL_SCOPE.READ]
});

function normalizePermissions(values = []) {
	const source = Array.isArray(values) ? values : [];
	return [...new Set(source.map(String))]
		.filter((permission) => OWNER_PERMISSIONS.includes(permission));
}

function permissionsForRole(role) {
	const normalizedRole = String(role || "readonly").toLowerCase();
	return [...(ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.readonly)];
}

function includesPermission(grant, permission) {
	if (!grant || grant.revokedAt) {
		return false;
	}

	const expiresAt = Number(grant.expiresAt || 0);
	if (expiresAt && expiresAt <= Date.now()) {
		return false;
	}

	return normalizePermissions(grant.permissions).includes(permission);
}

module.exports = {
	OWNER_PERMISSIONS,
	ROLE_PERMISSIONS,
	includesPermission,
	normalizePermissions,
	permissionsForRole
};
