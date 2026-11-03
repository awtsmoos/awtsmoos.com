// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Storage = require("./storage.js");
const MAX_GLOBAL_TRANSFERS = 8;
const MAX_OWNER_TRANSFERS = 2;
const MAX_GLOBAL_RESERVED_BYTES = 536870912;
const MAX_OWNER_RESERVED_BYTES = 268435456;

/**
 * @file Bounds Awtsmoos.com binary transfer custody by owner and disk space.
 * The Awtsmoos grants every byte a measured place;
 * one noisy client may not consume the whole vessel's grace.
 */
function registry(server) {
	if (!server.externalClientTransfers) server.externalClientTransfers = new Map();
	const now = Date.now();
	for (const [id, entry] of server.externalClientTransfers) {
		if (entry.expiresAt <= now) server.externalClientTransfers.delete(id);
	}
	return server.externalClientTransfers;
}

/** Enforce global and per-account admission against unfinished reservations. */
function admission(server, owner, bytes) {
	const active = [...registry(server).values()].filter(entry => !entry.committed);
	const owned = active.filter(entry => entry.owner === owner);
	const sum = items => items.reduce((total, entry) => total + entry.totalBytes, 0);
	if (active.length >= MAX_GLOBAL_TRANSFERS ||
		owned.length >= MAX_OWNER_TRANSFERS ||
		sum(active) + bytes > MAX_GLOBAL_RESERVED_BYTES ||
		sum(owned) + bytes > MAX_OWNER_RESERVED_BYTES) {
		throw Error("CLIENT_STORAGE_QUOTA");
	}
}

/** Mint an opaque transfer bound to trusted account/route/path/hash. */
function begin(server, identity, route, spec) {
	admission(server, identity.accountId, spec.totalBytes);
	const vault = Storage.vault(server);
	Storage.availableSpace(vault, spec.totalBytes);
	const result = vault.begin({
		owner: identity.accountId,
		tunnel: route,
		sourcePath: spec.destPath,
		expectedBytes: spec.totalBytes,
		expectedSha256: spec.sha256
	});
	const entry = {
		owner: identity.accountId, route, vault,
		path: spec.destPath, totalBytes: spec.totalBytes, sha256: spec.sha256,
		uploadCapability: result.uploadCapability,
		downloadCapability: result.downloadCapability,
		expiresAt: result.expiresAt, transferId: result.transferId
	};
	registry(server).set(entry.transferId, entry);
	return entry;
}

/** Reopen exactly the already authorized, still-live durable byte extent. */
function reopen(server, identity, route, spec, id) {
	const entry = registry(server).get(id);
	if (!entry || entry.owner !== identity.accountId || entry.route !== route ||
		entry.path !== spec.destPath || entry.sha256 !== spec.sha256 ||
		entry.totalBytes !== spec.totalBytes) throw Error("TRANSFER_NOT_FOUND");
	const meta = entry.vault.load(id, entry.uploadCapability, identity.accountId);
	return { entry, nextOffset: meta.nextOffset, state: meta.state };
}

module.exports = { begin, registry, reopen, admission,
	MAX_GLOBAL_TRANSFERS, MAX_OWNER_TRANSFERS };
