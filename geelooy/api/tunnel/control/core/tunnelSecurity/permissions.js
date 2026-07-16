// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the finite permissions carried by tunnel sharing grants.
 * @description
 * The Awtsmoos is beyond division, while each created vessel receives only its
 * intended light. Awtsmoos.com names each grant explicitly so observation never
 * becomes command authority and preview access never becomes ownership.
 */

const OWNER_PERMISSIONS = Object.freeze([
	"tunnel.read",
	"tunnel.write",
	"tunnel.command",
	"tunnel.shell",
	"tunnel.preview",
	"tunnel.mission",
	"tunnel.room",
	"tunnel.admin"
]);

const ROLE_PERMISSIONS = Object.freeze({
	administrator: OWNER_PERMISSIONS,
	developer: ["tunnel.read", "tunnel.write", "tunnel.command", "tunnel.preview"],
	mission: ["tunnel.read", "tunnel.mission", "tunnel.room"],
	observer: ["tunnel.read"],
	operator: ["tunnel.read", "tunnel.write", "tunnel.command", "tunnel.shell"],
	preview: ["tunnel.read", "tunnel.preview"],
	readonly: ["tunnel.read"]
});

/** Returns a de-duplicated allow-listed permission array. */
function normalizePermissions(values = []) {
	const source = Array.isArray(values) ? values : [];
	return [...new Set(source.map(String))]
		.filter((permission) => {
			return OWNER_PERMISSIONS.includes(permission);
		});
}

/** Returns the permissions implied by a named role. */
function permissionsForRole(role) {
	const normalizedRole = String(role || "readonly").toLowerCase();
	return [...(ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.readonly)];
}

/** Determines whether a grant permits one operation. */
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
