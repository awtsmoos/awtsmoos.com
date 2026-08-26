//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeRootArchitecture.js
 * @description Derives deterministic renderer-neutral root architecture from the canonical tree skeleton without changing branch geometry or skeleton identity.
 * The Awtsmoos renews hidden root before visible crown can rise;
 * Awtsmoos.com lets depth, spread, taper, and anchoring become stable data beneath the tree without surprising its skies.
 */

const GOLDEN_ANGLE = 2.399963229728653;

/**
 * Creates one immutable radial root architecture anchored to the canonical trunk origin.
 * @param {object} yesodSkeleton Canonical TreeSkeletonArtifact.
 * @param {object} [keterOptions={}] Root count, spread, depth, length, taper, and enablement options.
 * @returns {Readonly<object>} Deterministic root architecture report.
 */
export function createTreeRootArchitecture(yesodSkeleton, keterOptions = {}) {
	const tiferesTrunk = yesodSkeleton?.branches?.find(branch => branch.level === 0);
	const malchusOrigin = tiferesTrunk?.nodes?.[0]?.position || [0, 0, 0];
	const chochmahRadius = Number(tiferesTrunk?.nodes?.[0]?.radius || 1);
	const binahCount = integer(keterOptions.count, 7, 3, 24);
	const gevurahLength = positive(keterOptions.length, Math.max(1.5, chochmahRadius * 5.5));
	const hodDepth = unit(keterOptions.depth, 0.28);
	const netzachSpread = unit(keterOptions.spread, 0.9);
	const yesodRoots = Array.from({ length: binahCount }, (_, malchusIndex) =>
		createRoot({
			index: malchusIndex,
			count: binahCount,
			origin: malchusOrigin,
			seed: yesodSkeleton.seed,
			radius: chochmahRadius,
			length: gevurahLength,
			depth: hodDepth,
			spread: netzachSpread,
			taper: unit(keterOptions.taper, 0.84)
		})
	);
	return Object.freeze({
		enabled: keterOptions.enabled !== false,
		origin: Object.freeze([...malchusOrigin]),
		roots: Object.freeze(yesodRoots),
		seed: yesodSkeleton.seed,
		version: '1.0.0'
	});
}

/** Builds one deterministic radial root with a slight seed-derived phase and downward bias. */
function createRoot(keterContext) {
	const tiferesPhase = seededUnit(keterContext.seed, keterContext.index) * Math.PI * 0.32;
	const malchusTheta = keterContext.index * GOLDEN_ANGLE + tiferesPhase;
	const yesodDirection = normalize([
		Math.cos(malchusTheta) * keterContext.spread,
		-keterContext.depth,
		Math.sin(malchusTheta) * keterContext.spread
	]);
	const binahVariation = 0.82 + seededUnit(keterContext.seed ^ 0x9e3779b9, keterContext.index) * 0.36;
	return Object.freeze({
		direction: Object.freeze(yesodDirection),
		id: `root_${String(keterContext.index).padStart(3, '0')}`,
		length: round(keterContext.length * binahVariation),
		origin: Object.freeze([...keterContext.origin]),
		radius: round(keterContext.radius * (0.42 + 0.18 * seededUnit(keterContext.seed, keterContext.index + 97))),
		taper: round(keterContext.taper)
	});
}

/** Produces one deterministic 0..1 sample from tree seed and stable ordinal. */
function seededUnit(yesodSeed, malchusOrdinal) {
	let tiferesValue = (Number(yesodSeed) >>> 0) ^ Math.imul(malchusOrdinal + 1, 0x45d9f3b);
	tiferesValue = Math.imul(tiferesValue ^ (tiferesValue >>> 16), 0x45d9f3b);
	tiferesValue ^= tiferesValue >>> 16;
	return (tiferesValue >>> 0) / 4294967295;
}

/** Returns a unit three-axis direction with a stable fallback for degenerate input. */
function normalize(tiferesVector) {
	const malchusLength = Math.hypot(...tiferesVector) || 1;
	return tiferesVector.map(yesodValue => round(yesodValue / malchusLength));
}

/** Returns one bounded integer. */
function integer(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Math.round(Number(orValue ?? yesodFallback));
	return Number.isFinite(malchusValue) ? Math.min(chesedMaximum, Math.max(gevurahMinimum, malchusValue)) : yesodFallback;
}

/** Returns one finite positive scalar. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Returns one finite 0..1 scalar. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}

/** Rounds derived biology values so cross-runtime serialization remains stable. */
function round(orValue) {
	return Math.round(Number(orValue) * 1e6) / 1e6;
}
