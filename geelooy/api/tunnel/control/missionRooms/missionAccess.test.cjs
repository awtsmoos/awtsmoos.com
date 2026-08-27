// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const {
	provenBinding
} = require("../core/test/provenanceFixture.cjs");

/**
 * @file Proves mission access for owners, explicit grantees, and foreign accounts.
 * @description
 * The Awtsmoos renews owner, guest, proof, and boundary without confusion.
 * Awtsmoos.com uses a disposable possession-backed store to prove canonical owner
 * routing and ordinary missing responses for accounts without ownership or grant.
 */
test("authorizes owner and mission grantee while denying foreign account", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-mission-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(directory, "store.json");
	try {
		const { writeStore } = require("../core/store.js");
		const { authorizeMissionAccess } = require("./missionAccess.js");
		writeStore(storeFixture());
		const owner = authorizeMissionAccess(identity("account-a"), "alpha");
		assert.equal(owner.ok, true);
		assert.equal(owner.access, "owned");
		assert.equal(owner.ownerAccountId, "account-a");
		const shared = authorizeMissionAccess(identity("account-b"), "tun_a");
		assert.equal(shared.ok, true);
		assert.equal(shared.access, "shared");
		assert.equal(shared.ownerAccountId, "account-a");
		const foreign = authorizeMissionAccess(identity("account-c"), "alpha");
		assert.equal(foreign.ok, false);
		assert.equal(foreign.error, "tunnel_not_found");
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
		delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	}
});

function identity(accountId) {
	return {
		accountId,
		userId: `${accountId}-user`,
		sessionId: `${accountId}-session`
	};
}

function storeFixture() {
	return {
		tunnelBindings: {
			tun_a: provenBinding({
				tunnelId: "tun_a",
				tunnelName: "alpha",
				deviceId: "device-a",
				ownerAccountId: "account-a",
				permissionVersion: 3,
				revocationVersion: 2
			})
		},
		tunnelGrants: {
			grant_b: {
				grantId: "grant_b",
				tunnelId: "tun_a",
				ownerAccountId: "account-a",
				granteeAccountId: "account-b",
				role: "mission",
				permissions: ["tunnel.read", "tunnel.mission"],
				permissionVersion: 4,
				expiresAt: null,
				revokedAt: null
			}
		},
		tunnelPairings: {},
		tunnelAudit: []
	};
}
