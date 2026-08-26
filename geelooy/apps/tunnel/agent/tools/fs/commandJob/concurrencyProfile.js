// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");

const PROFILES = Object.freeze({
	0: { tier: 0, name: "emergency", maxActive: 1 },
	1: { tier: 1, name: "single", maxActive: 1 },
	2: { tier: 2, name: "dual", maxActive: 2 },
	3: { tier: 3, name: "four", maxActive: 4 },
	4: { tier: 4, name: "sixteen", maxActive: 16 },
	5: { tier: 5, name: "production", maxActive: 128 }
});

/**
 * @file Resolves physical command capacity for a high-concurrency native tunnel.
 * @description
 * The Awtsmoos sends many shluchim through one machine without making them one
 * queue. Awtsmoos.com opens 128 production vessels, bounds each owner to eight,
 * and leaves the recovery tiers narrow enough to remain trustworthy in a storm.
 */
function resolve(environment = process.env, system = {}) {
	const requestedTier = environment.AWTSMOOS_COMMAND_TIER ||
		environment.AWTSMOOS_COMMAND_PROFILE ||
		"5";
	const profile = PROFILES[normalizeTier(requestedTier)];
	const override = boundedPositive(environment.AWTSMOOS_COMMAND_MAX_ACTIVE, 512);
	const maxActive = override || profile.maxActive || adaptiveMax(system);
	const defaultOwner = maxActive <= 2 ? 1 : Math.min(8, maxActive - 1);
	const ownerOverride = boundedPositive(
		environment.AWTSMOOS_COMMAND_MAX_ACTIVE_PER_OWNER,
		maxActive
	);
	const maxActivePerOwner = Math.max(
		1,
		Math.min(maxActive, ownerOverride || defaultOwner)
	);
	return {
		tier: profile.tier,
		name: profile.name,
		maxActive,
		maxActivePerOwner,
		logicalAdmission: "bounded_per_owner_high_water",
		source: override ? "explicit_override" : "recovery_or_production_profile"
	};
}

function normalizeTier(value) {
	const normalized = String(value || "5").toLowerCase().replace(/[^a-z0-9]/g, "");
	const aliases = {
		0: 0, l0: 0, level0: 0, emergency: 0, minimal: 0,
		1: 1, l1: 1, level1: 1, single: 1, sequential: 1,
		2: 2, l2: 2, level2: 2, dual: 2, two: 2,
		3: 3, l3: 3, level3: 3, four: 3,
		4: 4, l4: 4, level4: 4, sixteen: 4,
		5: 5, l5: 5, level5: 5, production: 5, adaptive: 5, unlimited: 5
	};
	return Object.prototype.hasOwnProperty.call(aliases, normalized)
		? aliases[normalized]
		: 5;
}

function adaptiveMax(system = {}) {
	const parallelism = boundedPositive(system.parallelism, 128) || availableParallelism();
	const totalMemory = boundedPositive(system.totalMemory, Number.MAX_SAFE_INTEGER) || os.totalmem();
	const memorySlots = Math.max(8, Math.floor(totalMemory / (256 * 1024 * 1024)));
	return Math.max(16, Math.min(128, parallelism * 8, memorySlots));
}

function availableParallelism() {
	return typeof os.availableParallelism === "function"
		? os.availableParallelism()
		: os.cpus().length;
}

function boundedPositive(value, maximum) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) return 0;
	return Math.min(maximum, Math.floor(number));
}

module.exports = {
	PROFILES,
	adaptiveMax,
	normalizeTier,
	resolve
};
