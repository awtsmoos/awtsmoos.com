//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeDeadwoodPlan.js
 * @description Derives deterministic deadwood and snag intent from stable branch identities without deleting live geometry or mutating the canonical skeleton.
 * The Awtsmoos renews living branch and weathered remnant in the same instant, each with a measured role;
 * Awtsmoos.com lets decay become explicit metadata so ecology may deepen without stealing the tree's stable soul.
 */

/**
 * Creates immutable deadwood intent from non-trunk branches.
 * @param {object} yesodSkeleton Canonical stable tree skeleton.
 * @param {object} [keterOptions={}] Strength, snag rate, break position, and enablement options.
 * @returns {Readonly<object>} Deterministic deadwood plan keyed to canonical branch identities.
 */
export function createTreeDeadwoodPlan(yesodSkeleton, keterOptions = {}) {
	const tiferesBranches = Array.isArray(yesodSkeleton?.branches)
		? yesodSkeleton.branches.filter(binahBranch => binahBranch.level > 0)
		: [];
	const malchusStrength = unit(keterOptions.strength, 0.08);
	const chochmahSnagRate = unit(keterOptions.snagRate, malchusStrength * 0.7);
	const gevurahCandidates = tiferesBranches
		.filter((binahBranch, malchusIndex) => seededUnit(yesodSkeleton.seed, binahBranch.id, malchusIndex) <= malchusStrength)
		.map((binahBranch, malchusIndex) => createDeadwoodRecord(
			yesodSkeleton.seed,
			binahBranch,
			malchusIndex,
			chochmahSnagRate,
			keterOptions
		));
	return Object.freeze({
		enabled: keterOptions.enabled !== false,
		features: Object.freeze(gevurahCandidates),
		seed: yesodSkeleton.seed,
		version: '1.0.0'
	});
}

/** Creates one deterministic deadwood feature attached to an existing branch. */
function createDeadwoodRecord(yesodSeed, tiferesBranch, malchusIndex, chochmahSnagRate, keterOptions) {
	const binahVariation = seededUnit(yesodSeed ^ 0x85ebca6b, tiferesBranch.id, malchusIndex + 37);
	const gevurahSnag = binahVariation <= chochmahSnagRate;
	const hodBreakT = unit(
		keterOptions.breakT,
		0.45 + seededUnit(yesodSeed ^ 0xc2b2ae35, tiferesBranch.id, malchusIndex + 71) * 0.42
	);
	return Object.freeze({
		branchId: tiferesBranch.id,
		breakT: round(hodBreakT),
		id: `deadwood_${String(malchusIndex).padStart(4, '0')}`,
		kind: gevurahSnag ? 'snag' : 'weathered-branch',
		level: tiferesBranch.level,
		severity: round(0.35 + binahVariation * 0.55)
	});
}

/** Produces one deterministic 0..1 sample from seed, branch identity, and ordinal. */
function seededUnit(yesodSeed, tiferesId, malchusOrdinal) {
	let chochmahHash = Number(yesodSeed) >>> 0;
	for (const binahCharacter of String(tiferesId || '')) {
		chochmahHash = Math.imul(chochmahHash ^ binahCharacter.charCodeAt(0), 16777619);
	}
	chochmahHash ^= Math.imul(malchusOrdinal + 1, 0x27d4eb2d);
	chochmahHash = Math.imul(chochmahHash ^ (chochmahHash >>> 15), 0x85ebca6b);
	return (chochmahHash >>> 0) / 4294967295;
}

/** Returns one finite 0..1 scalar. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}

/** Rounds derived ecological values for stable cross-runtime serialization. */
function round(orValue) {
	return Math.round(Number(orValue) * 1e6) / 1e6;
}
