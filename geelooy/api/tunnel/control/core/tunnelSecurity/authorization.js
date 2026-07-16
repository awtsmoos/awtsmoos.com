// B"H
// Boruch Hashem
// Blessed is He

const { readStore } = require("../store.js");
const Grant = require("./grantStore.js");
const Id = require("./identifiers.js");
const Permission = require("./permissions.js");
const Provenance = require("./bindingProvenance.js");

/**
 * @file Resolves possession-backed, account-scoped tunnel authorization.
 * @description
 * The Awtsmoos creates every account and vessel anew without mixing their names.
 * Awtsmoos.com resolves immutable tunnel IDs before friendly aliases, reveals only
 * proven ownership or explicit grants, and returns no cross-account existence clue.
 */
function accessibleBindings(accountId, store = readStore()) {
	const normalizedAccount = Id.accountId(accountId);
	if (!normalizedAccount) return [];
	const bindings = Object.values(store.tunnelBindings)
		.filter(Provenance.isTrustedBinding);
	const activeGrants = Grant.activeGrantsFor(normalizedAccount, store);
	return bindings.flatMap((binding) => {
		if (binding.ownerAccountId === normalizedAccount) {
			return [{ binding, access: "owned", grant: null }];
		}
		const matchingGrant = activeGrants.find((grant) => {
			return grant.tunnelId === binding.tunnelId;
		});
		return matchingGrant
			? [{ binding, access: "shared", grant: matchingGrant }]
			: [];
	});
}

function resolveAccessible(accountId, reference, store = readStore()) {
	const normalizedReference = Id.normalizeIdentifier(reference);
	if (!normalizedReference) return missing();
	const accessible = accessibleBindings(accountId, store);
	const exactId = accessible.find((entry) => {
		return entry.binding.tunnelId === normalizedReference;
	});
	if (exactId) return { ok: true, ...exactId, matchedBy: "tunnelId" };
	const nameMatches = accessible.filter((entry) => {
		return entry.binding.tunnelName === normalizedReference;
	});
	if (nameMatches.length !== 1) {
		return nameMatches.length
			? { ok: false, error: "ambiguous_tunnel_reference" }
			: missing();
	}
	return { ok: true, ...nameMatches[0], matchedBy: "tunnelName" };
}

function authorize(accountId, reference, permission, store = readStore()) {
	const resolved = resolveAccessible(accountId, reference, store);
	if (!resolved.ok || resolved.access === "owned") return resolved;
	if (!Permission.includesPermission(resolved.grant, permission)) return missing();
	return resolved;
}

function publicAccess(entry) {
	return {
		tunnelId: entry.binding.tunnelId,
		tunnelName: entry.binding.tunnelName,
		deviceId: entry.binding.deviceId,
		deviceName: entry.binding.deviceName,
		platform: entry.binding.platform,
		access: entry.access,
		shared: entry.access === "shared",
		role: entry.grant?.role || "owner",
		permissions: entry.grant?.permissions || Permission.OWNER_PERMISSIONS,
		permissionVersion: entry.grant?.permissionVersion ||
			entry.binding.permissionVersion,
		revocationVersion: entry.binding.revocationVersion,
		ownershipVerified: true,
		pairingProofVersion: entry.binding.pairingProofVersion
	};
}

function missing() {
	return { ok: false, error: "tunnel_not_found" };
}

module.exports = {
	accessibleBindings,
	authorize,
	publicAccess,
	resolveAccessible
};
