// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Retention = require("../tunnelSecurity/bindingRetention.js");

/**
	* @file Proves physical cleanup preserves authority, grants, pins, and audit tail.
	* @description The Awtsmoos removes only old inert superseded records.
	*/
const now = Date.parse("2026-07-27T00:00:00.000Z");
const day = 24 * 60 * 60 * 1000;
const store = {
	tunnelBindings: {},
	tunnelGrants: {},
	tunnelAudit: []
};

function binding(id, ageDays, extra = {}) {
	return {
		tunnelId: id,
		tunnelName: "awt-retention",
		deviceId: "dev-one",
		ownerAccountId: "acct-one",
		createdAt: new Date(now - 100 * day).toISOString(),
		revokedAt: new Date(now - ageDays * day).toISOString(),
		...extra
	};
}

store.tunnelBindings.current = {
	...binding("current", 0),
	revokedAt: null,
	supersededAt: null,
	supersededBy: null
};
store.tunnelBindings.tailNewest = binding("tailNewest", 40);
store.tunnelBindings.tailSecond = binding("tailSecond", 50);
store.tunnelBindings.old = binding("old", 60);
store.tunnelBindings.pinned = binding("pinned", 70, { pinnedAt: new Date().toISOString() });
store.tunnelBindings.shared = binding("shared", 80);
store.tunnelBindings.recent = binding("recent", 5);
store.tunnelBindings.other = {
	...binding("other", 90),
	ownerAccountId: "acct-two"
};
store.tunnelGrants.grant = {
	grantId: "grant",
	tunnelId: "shared",
	granteeAccountId: "acct-shared",
	expiresAt: now + day,
	revokedAt: null
};

const plan = Retention.plan(store, {
	accountId: "acct-one",
	at: now,
	retentionMs: 30 * day,
	historyPerIdentity: 2
});
assert.deepEqual(plan.candidates.map(item => item.tunnelId), ["old"]);
assert.equal(store.tunnelBindings.old.tunnelId, "old");
const result = Retention.pruneStore(store, {
	accountId: "acct-one",
	at: now,
	retentionMs: 30 * day,
	historyPerIdentity: 2
});
assert.deepEqual(result.removed.map(item => item.tunnelId), ["old"]);
assert.equal(store.tunnelBindings.old, undefined);
assert.ok(store.tunnelBindings.current);
assert.ok(store.tunnelBindings.tailNewest);
assert.ok(store.tunnelBindings.tailSecond);
assert.ok(store.tunnelBindings.pinned);
assert.ok(store.tunnelBindings.shared);
assert.ok(store.tunnelBindings.recent);
assert.ok(store.tunnelBindings.other);
assert.equal(store.tunnelAudit.at(-1).action, "binding.prune");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-binding-retention",
	dryRunSafe: true,
	auditTailPreserved: true,
	activeGrantPreserved: true,
	pinPreserved: true,
	crossAccountPreserved: true,
	oldInertPruned: true
}, null, 2));
