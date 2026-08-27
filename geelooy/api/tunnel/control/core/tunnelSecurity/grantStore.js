// B"H
// Boruch Hashem
// Blessed is He

const { readStore, mutateStore } = require("../store.js");
const Audit = require("./audit.js");
const Binding = require("./bindingStore.js");
const Id = require("./identifiers.js");
const Permission = require("./permissions.js");
const Secrets = require("./secrets.js");

/**
 * @file Persists explicit, scoped, expiring, and revocable tunnel grants.
 * @description
 * Chesed shares and Gevurah bounds the sharing. The Awtsmoos renews both within
 * one intention; Awtsmoos.com records recipient, permissions, expiry, and
 * revocation so access never emerges merely from seeing a connected tunnel.
 */

/** Creates one grant only when the caller owns the immutable tunnel. */
function createGrant(input = {}) {
	let created = null;
	mutateStore((store) => {
		const binding = Binding.bindingById(input.tunnelId, store);
		const ownerAccountId = Id.accountId(input.ownerAccountId);
		const granteeAccountId = Id.accountId(input.granteeAccountId);
		if (!binding || binding.ownerAccountId !== ownerAccountId) {
			return store;
		}
		if (!granteeAccountId || granteeAccountId === ownerAccountId) {
			return store;
		}
		const grantId = `grt_${Secrets.randomToken(18)}`;
		const role = String(input.role || "readonly").toLowerCase();
		const requested = Permission.normalizePermissions(input.permissions);
		created = {
			grantId,
			tunnelId: binding.tunnelId,
			ownerAccountId,
			granteeAccountId,
			role,
			permissions: requested.length
				? requested
				: Permission.permissionsForRole(role),
			permissionVersion: 1,
			createdAt: new Date().toISOString(),
			expiresAt: Number(input.expiresAt || 0) || null,
			revokedAt: null
		};
		store.tunnelGrants[grantId] = created;
		Audit.appendAudit(store, {
			action: "grant.create",
			accountId: ownerAccountId,
			tunnelId: binding.tunnelId,
			grantId,
			result: "allowed"
		});
		return store;
	});
	return created;
}

/** Revokes one grant only when the caller owns its tunnel. */
function revokeGrant(grantId, ownerAccountId) {
	let revoked = null;
	mutateStore((store) => {
		const grant = store.tunnelGrants[Id.normalizeIdentifier(grantId)];
		if (!grant || grant.ownerAccountId !== Id.accountId(ownerAccountId)) {
			return store;
		}
		grant.revokedAt = new Date().toISOString();
		grant.permissionVersion += 1;
		revoked = { ...grant };
		Audit.appendAudit(store, {
			action: "grant.revoke",
			accountId: ownerAccountId,
			tunnelId: grant.tunnelId,
			grantId,
			result: "allowed"
		});
		return store;
	});
	return revoked;
}

/** Returns active grants received by one account. */
function activeGrantsFor(accountId, store = readStore()) {
	const normalizedAccount = Id.accountId(accountId);
	return Object.values(store.tunnelGrants).filter((grant) => {
		return grant.granteeAccountId === normalizedAccount &&
			!grant.revokedAt &&
			(!grant.expiresAt || Number(grant.expiresAt) > Date.now());
	});
}

/** Returns all grants created by one owner for review and revocation. */
function grantsOwnedBy(accountId, store = readStore()) {
	const normalizedAccount = Id.accountId(accountId);
	return Object.values(store.tunnelGrants)
		.filter((grant) => grant.ownerAccountId === normalizedAccount)
		.map((grant) => ({ ...grant }));
}

module.exports = {
	activeGrantsFor,
	createGrant,
	grantsOwnedBy,
	revokeGrant
};
