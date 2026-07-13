// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Profiles = require("../tools/fs/commandJob/concurrencyProfile.js");

/**
 * B"H
 * Every fallback is a named rung in one ladder. The Awtsmoos lets Awtsmoos.com
 * descend without confusion and ascend only when the machine can bear it.
 */
const expected = [1, 1, 2, 4, 8];

for (let tier = 0; tier <= 4; tier += 1) {
	const profile = Profiles.resolve({
		AWTSMOOS_COMMAND_TIER: String(tier)
	});
	assert.equal(profile.tier, tier);
	assert.equal(profile.maxActive, expected[tier]);
	assert.equal(profile.source, "recovery_tier");
	assert.equal(profile.logicalAdmission, "unlimited_by_default");
}

const adaptive = Profiles.resolve(
	{ AWTSMOOS_COMMAND_TIER: "production" },
	{ parallelism: 8, totalMemory: 16 * 1024 ** 3 }
);
assert.deepEqual(adaptive, {
	tier: 5,
	name: "production",
	maxActive: 16,
	logicalAdmission: "unlimited_by_default",
	source: "adaptive_machine_capacity"
});

const constrained = Profiles.resolve(
	{ AWTSMOOS_COMMAND_PROFILE: "adaptive" },
	{ parallelism: 2, totalMemory: 1024 ** 3 }
);
assert.equal(constrained.maxActive, 4);

const override = Profiles.resolve({
	AWTSMOOS_COMMAND_TIER: "emergency",
	AWTSMOOS_COMMAND_MAX_ACTIVE: "12"
});
assert.equal(override.tier, 0);
assert.equal(override.maxActive, 12);
assert.equal(override.source, "explicit_override");

assert.equal(Profiles.normalizeTier("level-4"), 4);
assert.equal(Profiles.normalizeTier("unlimited"), 5);
assert.equal(Profiles.normalizeTier("unknown"), 5);

console.log(JSON.stringify({
	ok: true,
	suite: "command-concurrency-profiles",
	recoveryTiers: expected,
	adaptiveWorkers: adaptive.maxActive,
	constrainedWorkers: constrained.maxActive
}, null, 2));
