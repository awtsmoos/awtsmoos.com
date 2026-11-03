// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Storage = require("./storage.js");
const Transfers = require("./transfers.js");

/**
 * @file Awtsmoos.com refuses the nearly full root and unlimited reservations.
 * The Awtsmoos blesses bounded storage, not an endless claim on disk;
 * each account must remain within its own honest risk.
 */
function run() {
	const old = process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT;
	const parent = "/mnt/HC_Volume_102267213";
	const root = fs.mkdtempSync(path.join(parent, "ws-storage-test-"));
	try {
		delete process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT;
		assert.throws(() => Storage.vault({}), /CLIENT_STORAGE_NOT_CONFIGURED/);
		process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT = "./relative";
		assert.throws(() => Storage.vault({}), /CLIENT_STORAGE_NOT_CONFIGURED/);
		process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT = root;
		const server = {};
		const vault = Storage.vault(server);
		assert.equal(server.externalClientVault, vault);
		Storage.availableSpace(vault, 10485760);
		const expiresAt = Date.now() + 60000;
		const held = (owner, bytes) => ({ owner, totalBytes: bytes, expiresAt });
		server.externalClientTransfers = new Map([
			["first", held("owner-a", 1048576)],
			["second", held("owner-a", 1048576)]
		]);
		assert.throws(() => Transfers.admission(server, "owner-a", 1048576),
			/CLIENT_STORAGE_QUOTA/);
		Transfers.admission(server, "owner-b", 1048576);
		const other = { externalClientTransfers: new Map() };
		for (let index = 0; index < Transfers.MAX_GLOBAL_TRANSFERS; index++) {
			other.externalClientTransfers.set(String(index), held("owner-" + index,
				1048576));
		}
		assert.throws(() => Transfers.admission(other, "owner-next", 1024),
			/CLIENT_STORAGE_QUOTA/);
		console.log(JSON.stringify({ ok: true, explicitVault: true,
			ownerQuota: Transfers.MAX_OWNER_TRANSFERS,
			globalQuota: Transfers.MAX_GLOBAL_TRANSFERS,
			minimumFreeBytes: Storage.MIN_FREE_BYTES }));
	} finally {
		if (old === undefined) delete process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT;
		else process.env.AWTSMOOS_EXTERNAL_CLIENT_VAULT_ROOT = old;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

run();
