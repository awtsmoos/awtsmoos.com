// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Profiles = require("../tools/fs/commandJob/concurrencyProfile.js");

/**
 * @file Proves every recovery and production tier has bounded physical and per-owner capacity.
 * @description The Awtsmoos lets Awtsmoos.com descend through trusted recovery rungs and
 * rise to 128 workers, while no logical owner receives an unbounded physical monopoly.
 */
const expectedWorkers = [1, 1, 2, 4, 16];
const expectedOwnerShares = [1, 1, 1, 3, 8];

for (let tier = 0; tier <= 4; tier += 1) {
	const profile = Profiles.resolve({ AWTSMOOS_COMMAND_TIER: String(tier) });
	assert.equal(profile.tier, tier);
	assert.equal(profile.maxActive, expectedWorkers[tier]);
	assert.equal(profile.maxActivePerOwner, expectedOwnerShares[tier]);
	assert.equal(profile.source, "recovery_or_production_profile");
	assert.equal(profile.logicalAdmission, "bounded_per_owner_high_water");
}

const production = Profiles.resolve(
	{ AWTSMOOS_COMMAND_TIER: "production" },
	{ parallelism: 8, totalMemory: 16 * 1024 ** 3 }
);
assert.deepEqual(production, {
	tier: 5,
	name: "production",
	maxActive: 128,
	maxActivePerOwner: 8,
	logicalAdmission: "bounded_per_owner_high_water",
	source: "recovery_or_production_profile"
});

const adaptiveAlias = Profiles.resolve(
	{ AWTSMOOS_COMMAND_PROFILE: "adaptive" },
	{ parallelism: 2, totalMemory: 1024 ** 3 }
);
assert.equal(adaptiveAlias.maxActive, 128);
assert.equal(adaptiveAlias.maxActivePerOwner, 8);

const override = Profiles.resolve({
	AWTSMOOS_COMMAND_TIER: "emergency",
	AWTSMOOS_COMMAND_MAX_ACTIVE: "12"
});
assert.equal(override.tier, 0);
assert.equal(override.maxActive, 12);
assert.equal(override.maxActivePerOwner, 8);
assert.equal(override.source, "explicit_override");
assert.equal(Profiles.resolve({ AWTSMOOS_COMMAND_MAX_ACTIVE: "9999" }).maxActive, 512);

assert.equal(Profiles.normalizeTier("level-4"), 4);
assert.equal(Profiles.normalizeTier("unlimited"), 5);
assert.equal(Profiles.normalizeTier("unknown"), 5);

console.log(JSON.stringify({
	ok: true,
	suite: "command-concurrency-profiles",
	recoveryWorkers: expectedWorkers,
	recoveryOwnerShares: expectedOwnerShares,
	productionWorkers: production.maxActive
}, null, 2));
