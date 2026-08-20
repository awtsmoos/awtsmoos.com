// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const PROFILES = Object.freeze({
	0: { tier: 0, name: "emergency", maxActive: 1 },
	1: { tier: 1, name: "single", maxActive: 1 },
	2: { tier: 2, name: "dual", maxActive: 2 },
	3: { tier: 3, name: "four", maxActive: 4 },
	4: { tier: 4, name: "eight", maxActive: 8 },
	5: { tier: 5, name: "production", maxActive: null }
});

/**
 * @file Resolves bounded physical command capacity and an independent owner share.
 * @description
 * The Awtsmoos grants many shluchim one machine without granting one shliach every
 * process. Awtsmoos.com keeps a small physical fleet, reserves room for peers, and
 * lets recovery tiers shrink safely while logical requester queues remain abundant.
 */
function resolve(environment = process.env, system = {}) {
	const requestedTier = environment.AWTSMOOS_COMMAND_TIER ||
		environment.AWTSMOOS_COMMAND_PROFILE ||
		"5";
	const profile = PROFILES[normalizeTier(requestedTier)];
	const override = positive(environment.AWTSMOOS_COMMAND_MAX_ACTIVE);
	const maxActive = override || profile.maxActive || adaptiveMax(system);
	const defaultOwner = maxActive <= 2 ? 1 : Math.min(2, maxActive - 1);
	const ownerOverride = positive(environment.AWTSMOOS_COMMAND_MAX_ACTIVE_PER_OWNER);
	const maxActivePerOwner = Math.max(1, Math.min(maxActive, ownerOverride || defaultOwner));
	return {
		tier: profile.tier,
		name: profile.name,
		maxActive,
		maxActivePerOwner,
		logicalAdmission: "bounded_per_owner_high_water",
		source: override
			? "explicit_override"
			: profile.tier === 5
				? "adaptive_machine_capacity"
				: "recovery_tier"
	};
}

function normalizeTier(value) {
	const normalized = String(value || "5").toLowerCase().replace(/[^a-z0-9]/g, "");
	const aliases = {
		0: 0, l0: 0, level0: 0, emergency: 0, minimal: 0,
		1: 1, l1: 1, level1: 1, single: 1, sequential: 1,
		2: 2, l2: 2, level2: 2, dual: 2, two: 2,
		3: 3, l3: 3, level3: 3, four: 3,
		4: 4, l4: 4, level4: 4, eight: 4,
		5: 5, l5: 5, level5: 5, production: 5, adaptive: 5, unlimited: 5
	};
	return Object.prototype.hasOwnProperty.call(aliases, normalized) ? aliases[normalized] : 5;
}

function adaptiveMax(system = {}) {
	const parallelism = positive(system.parallelism) || availableParallelism();
	const totalMemory = positive(system.totalMemory) || os.totalmem();
	const memorySlots = Math.max(1, Math.floor(totalMemory / (512 * 1024 * 1024)));
	return Math.max(4, Math.min(32, parallelism * 2, memorySlots));
}

function availableParallelism() {
	return typeof os.availableParallelism === "function"
		? os.availableParallelism()
		: os.cpus().length;
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

module.exports = {
	PROFILES,
	adaptiveMax,
	normalizeTier,
	resolve
};
