// B"H
// Boruch Hashem
// Blessed is He

const { readStore } = require("../store.js");
const Grant = require("./grantStore.js");
const Id = require("./identifiers.js");
const Permission = require("./permissions.js");
const Provenance = require("./bindingProvenance.js");

/**
 * @file Resolves possession-backed tunnel discovery and resource authorization.
 * @description
 * The Awtsmoos creates all vessels from one source, yet no account may seize
 * another. Awtsmoos.com requires verified pairing provenance before ownership or
 * a grant can make any binding visible, addressable, or actionable.
 */

/** Returns proven owned and explicitly shared bindings for one verified account. */
function accessibleBindings(accountId, store = readStore()) {
	const normalizedAccount = Id.accountId(accountId);
	if (!normalizedAccount) {
		return [];
	}
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

/** Resolves one accessible tunnel by immutable ID or unambiguous display name. */
function resolveAccessible(accountId, reference, store = readStore()) {
	const normalizedReference = Id.normalizeIdentifier(reference);
	const matches = accessibleBindings(accountId, store).filter((entry) => {
		return entry.binding.tunnelId === normalizedReference ||
			entry.binding.tunnelName === normalizedReference;
	});
	if (matches.length !== 1) {
		return {
			ok: false,
			error: matches.length ? "ambiguous_tunnel_reference" : "tunnel_not_found"
		};
	}
	return { ok: true, ...matches[0] };
}

/** Authorizes one permission before a resource is disclosed or touched. */
function authorize(accountId, reference, permission, store = readStore()) {
	const resolved = resolveAccessible(accountId, reference, store);
	if (!resolved.ok || resolved.access === "owned") {
		return resolved;
	}
	if (!Permission.includesPermission(resolved.grant, permission)) {
		return { ok: false, error: "tunnel_not_found" };
	}
	return resolved;
}

/** Returns a narrow public view of proven access without owner disclosure. */
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

module.exports = {
	accessibleBindings,
	authorize,
	publicAccess,
	resolveAccessible
};
